# 01. Usuarios y autenticación

Este documento describe la parte de usuarios y login de DQ-Logistics: qué hay, cómo está organizado, cómo se creó el usuario de prueba y cómo se verifica que funciona.

---

## 1. Resumen

El sistema tiene dos roles, `admin` y `employee`. Los usuarios inician sesión con correo y contraseña. Si la autenticación es correcta, el servidor genera un token JWT y lo guarda en una cookie `httpOnly` llamada `dq_session`. Después de cinco intentos fallidos la cuenta se bloquea 15 minutos.

Estado actual:

| Parte                                           | Estado                           |
| ----------------------------------------------- | -------------------------------- |
| Tabla `roles`                                   | Creada, con `admin` y `employee` |
| Tabla `users`                                   | Creada, con relación a `roles`   |
| Login (`POST /api/auth/login`)                  | Implementado                     |
| Formulario de login (`/login`)                  | Implementado                     |
| Cookie de sesión `dq_session`                   | Implementada                     |
| Bloqueo por intentos fallidos                   | Implementado                     |
| Verificación de sesión (`GET /api/auth/me`)     | Pendiente                        |
| Logout                                          | Pendiente                        |
| `middleware.ts` (proteger rutas)                | Pendiente                        |
| Crear usuarios desde la API (`POST /api/users`) | Pendiente                        |

---

## 2. Base de datos

### 2.1 Tabla `roles`

Catálogo de roles. Un usuario pertenece a un solo rol.

| Columna       | Tipo               | Descripción                                          |
| ------------- | ------------------ | ---------------------------------------------------- |
| `id`          | integer, identity  | Clave primaria                                       |
| `code`        | varchar(30), único | Identificador que usa el código: `admin`, `employee` |
| `name`        | varchar(80)        | Nombre para mostrar: "Administrador", "Empleado"     |
| `description` | text               | Descripción del rol                                  |
| `created_at`  | timestamptz        | Fecha de creación                                    |

Datos iniciales:

| id  | code     | name          |
| --- | -------- | ------------- |
| 1   | admin    | Administrador |
| 2   | employee | Empleado      |

### 2.2 Tabla `users`

| Columna           | Tipo                     | Descripción                                                  |
| ----------------- | ------------------------ | ------------------------------------------------------------ |
| `id`              | integer, identity        | Clave primaria                                               |
| `full_name`       | varchar(120)             | Nombre completo                                              |
| `email`           | varchar(160)             | Correo, único sin distinguir mayúsculas                      |
| `password_hash`   | varchar(255)             | Hash bcrypt de la contraseña. Nunca se guarda en texto plano |
| `role_id`         | integer, FK → `roles.id` | Rol del usuario                                              |
| `is_active`       | boolean                  | Si es `false`, no puede iniciar sesión                       |
| `failed_attempts` | smallint                 | Intentos fallidos consecutivos                               |
| `locked_until`    | timestamptz              | Si tiene fecha futura, la cuenta está bloqueada              |
| `last_login_at`   | timestamptz              | Último login exitoso                                         |
| `created_at`      | timestamptz              | Fecha de creación                                            |
| `updated_at`      | timestamptz              | Última modificación                                          |

Índice único: `users_email_key` sobre `lower(email)`. Impide dos cuentas con el mismo correo aunque cambien las mayúsculas.

### 2.3 Migraciones

El esquema se define en TypeScript con Drizzle y se convierte en SQL con migraciones:

- Esquema: `src/shared/db/schema/` (`roles.ts`, `users.ts`, `relations.ts`, `index.ts`)
- Migraciones generadas: `src/shared/db/migrations/`
- Configuración: `drizzle.config.ts` en la raíz del proyecto

Comandos:

```powershell
npx drizzle-kit generate   # genera el SQL a partir del esquema
npx drizzle-kit migrate    # aplica las migraciones a la base
```

---

## 3. Estructura de código

```
src/
├── app/
│   ├── (auth)/login/page.tsx            # Página /login
│   ├── page.tsx                         # Redirige a /login
│   └── api/
│       ├── health/route.ts              # GET  /api/health
│       └── auth/login/route.ts          # POST /api/auth/login
├── modules/auth/
│   ├── components/LoginForm.tsx         # Formulario (cliente)
│   ├── domain/login-policy.ts           # Reglas de bloqueo y error
│   ├── repositories/users.repository.ts # Consultas a users y roles
│   └── services/auth.service.ts         # Flujo del login
└── shared/
    ├── db/
    │   ├── client.ts                    # Conexión a PostgreSQL
    │   └── schema/                      # Definición de tablas
    └── security/
        ├── password.ts                  # Hash y verificación (bcryptjs)
        └── jwt.ts                       # Firma y lectura del token (jose)
```

Capas, de afuera hacia adentro:

| Capa            | Responsabilidad                                                        |
| --------------- | ---------------------------------------------------------------------- |
| `app/api/`      | Recibe la petición HTTP, valida la entrada y responde                  |
| `services/`     | Ejecuta el flujo: busca al usuario, verifica, bloquea, genera el token |
| `repositories/` | Único lugar con consultas SQL para usuarios                            |
| `domain/`       | Reglas puras (límite de intentos, tiempo de bloqueo)                   |
| `shared/`       | Infraestructura reutilizable: base de datos y seguridad                |

---

## 4. Flujo de login

```
LoginForm (navegador)
  → POST /api/auth/login  { email, password }
  → route.ts valida con Zod
  → auth.service.authenticate()
      1. Busca el usuario por correo (repositorio, con JOIN a roles)
      2. Si no existe: compara contra un hash falso y responde 401
      3. Si está inactivo: responde 401
      4. Si está bloqueado: responde 423
      5. Compara la contraseña con bcrypt
      6. Si es incorrecta: suma un intento; al llegar a 5 bloquea 15 min
      7. Si es correcta: resetea intentos, guarda last_login_at, firma el JWT
  → Respuesta 200 con { user } y cookie dq_session
```

### Respuestas del endpoint

| Código | Cuándo                                              | Mensaje                                              |
| ------ | --------------------------------------------------- | ---------------------------------------------------- |
| 200    | Login correcto                                      | `{ user }`                                           |
| 400    | Body inválido (email mal formado, sin contraseña)   | "Datos inválidos"                                    |
| 401    | Correo o contraseña incorrectos, o usuario inactivo | "Correo o contraseña incorrectos"                    |
| 423    | Cuenta bloqueada temporalmente                      | "Cuenta bloqueada temporalmente. Intenta más tarde." |
| 500    | Error inesperado                                    | "Error interno del servidor"                         |

El mensaje del 401 es el mismo para correo inexistente y contraseña incorrecta, para no revelar qué correos están registrados.

### Cookie de sesión

| Atributo   | Valor                | Motivo                                      |
| ---------- | -------------------- | ------------------------------------------- |
| Nombre     | `dq_session`         | Constante `SESSION_COOKIE` en `jwt.ts`      |
| `httpOnly` | `true`               | El JavaScript del navegador no puede leerla |
| `secure`   | `true` en producción | Solo viaja por HTTPS en Azure               |
| `sameSite` | `lax`                | Reduce ataques CSRF                         |
| `maxAge`   | 8 horas              | Duración de la sesión                       |

### Contenido del JWT

| Campo  | Valor                                 |
| ------ | ------------------------------------- |
| `sub`  | id del usuario                        |
| `role` | código del rol (`admin` o `employee`) |
| `iat`  | fecha de emisión                      |
| `exp`  | fecha de expiración (8 horas)         |

---

## 5. Usuario de prueba

### 5.1 Usuario administrador

Creado al inicio del proyecto para pruebas.

| Campo      | Valor                                                 |
| ---------- | ----------------------------------------------------- |
| Correo     | `admin@dq-logistics.com`                              |
| Nombre     | Administrador                                         |
| Rol        | `admin`                                               |
| Contraseña | La definida al generar el hash (no se documenta aquí) |

### 5.2 Usuario empleado de prueba

| Campo                | Valor                                                       |
| -------------------- | ----------------------------------------------------------- |
| Correo               | `empleado@dq-logistics.com`                                 |
| Nombre               | Empleado de Prueba                                          |
| Rol                  | `employee`                                                  |
| Contraseña de prueba | `Empleado123` (solo para desarrollo, no usar en producción) |

### 5.3 Cómo se creó el usuario empleado

**Paso 1.** Generar el hash bcrypt de la contraseña desde PowerShell, en la carpeta del proyecto:

```powershell
node -e "require('bcryptjs').hash('Empleado123', 12).then(h => console.log(h))"
```

Se obtiene una cadena que empieza con `$2a$` o `$2b$`. Ese hash es lo que se guarda en la base; la contraseña original nunca se almacena.

**Paso 2.** Insertar el registro en DataGrip, sobre la base `dq_logistics`, reemplazando `PEGA_AQUI_EL_HASH`:

```sql
INSERT INTO users (full_name, email, password_hash, role_id)
VALUES (
  'Empleado de Prueba',
  'empleado@dq-logistics.com',
  'PEGA_AQUI_EL_HASH',
  (SELECT id FROM roles WHERE code = 'employee')
);
```

El `role_id` se obtiene con una subconsulta sobre `roles.code`, así no hay que conocer el id numérico del rol.

**Paso 3.** Verificar el registro:

```sql
SELECT u.id, u.full_name, u.email, r.code AS rol, u.is_active, u.failed_attempts, u.locked_until
FROM users u
JOIN roles r ON r.id = u.role_id;
```

Resultado esperado: una fila por usuario, con `is_active = true`, `failed_attempts = 0` y `locked_until` vacío.

---

## 6. Cómo probar

### 6.1 Login desde el formulario

1. `npm run dev`
2. Abrir http://localhost:3000/login
3. Ingresar `empleado@dq-logistics.com` y `Empleado123`
4. Debe aparecer "Login correcto" (provisional, ver sección 8)
5. En F12 → Application → Cookies, verificar `dq_session`

### 6.2 Login desde PowerShell

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"empleado@dq-logistics.com","password":"Empleado123"}'
```

Respuesta esperada:

```
user
----
@{id=2; fullName=Empleado de Prueba; email=empleado@dq-logistics.com; role=employee}
```

### 6.3 Prueba de bloqueo

1. Enviar cinco contraseñas incorrectas para el empleado.
2. Verificar en DataGrip:

```sql
SELECT email, failed_attempts, locked_until FROM users WHERE email = 'empleado@dq-logistics.com';
```

`locked_until` debe tener una fecha 15 minutos en el futuro.

3. Desbloquear para seguir probando:

```sql
UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE email = 'empleado@dq-logistics.com';
```

---

## 7. Comandos útiles

| Acción                     | Comando o consulta                                                               |
| -------------------------- | -------------------------------------------------------------------------------- |
| Ver usuarios y roles       | `SELECT u.email, r.code FROM users u JOIN roles r ON r.id = u.role_id;`          |
| Desbloquear un usuario     | `UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE email = '...';` |
| Desactivar un usuario      | `UPDATE users SET is_active = false WHERE email = '...';`                        |
| Generar hash de contraseña | `node -e "require('bcryptjs').hash('CLAVE', 12).then(h => console.log(h))"`      |
| Ejecutar migraciones       | `npx drizzle-kit migrate`                                                        |

---

## 8. Pendientes y notas

- **Redirección tras login:** `LoginForm.tsx` muestra un `alert` provisional. Debe cambiarse a `router.push("/dashboard")` cuando exista el dashboard.
- **`GET /api/auth/me`:** devuelve el id y el rol desde el token. Pendiente de crear.
- **Logout:** `POST /api/auth/logout` debe borrar la cookie. Pendiente.
- **`middleware.ts`:** protegerá las rutas del dashboard y redirigirá a `/login` si no hay sesión válida. Pendiente.
- **`POST /api/users`:** creación de usuarios solo para rol `admin`. Pendiente. Reemplazará la creación manual por SQL.
- **Contraseñas de prueba:** `Empleado123` es solo para desarrollo. Antes de desplegar en Azure, eliminar los usuarios de prueba y usar contraseñas reales.
- **`DUMMY_HASH`** en `auth.service.ts`: hash bcrypt fijo que se compara cuando el correo no existe, para igualar el tiempo de respuesta.