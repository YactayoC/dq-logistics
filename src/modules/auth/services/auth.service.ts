import { signSession } from "@/shared/security/jwt";
import { verifyPassword } from "@/shared/security/password";
import {
    AuthError,
    MAX_FAILED_ATTEMPTS,
    isLocked,
    lockUntil,
} from "../domain/login-policy";
import {
    findUserByEmail,
    registerFailedAttempt,
    registerSuccessfulLogin,
} from "../repositories/users.repository";

const INVALID_CREDENTIALS = "Correo o contraseña incorrectos";

// Hash falso para que el tiempo de respuesta sea parecido aunque el usuario no exista.
const DUMMY_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8G8cOhJZxVrX9kM5g1YqQ1mZyqB7Ee";

export async function authenticate(email: string, password: string) {
    const user = await findUserByEmail(email);

    if (!user) {
        await verifyPassword(password, DUMMY_HASH);
        throw new AuthError(INVALID_CREDENTIALS, 401);
    }

    if (!user.isActive) {
        throw new AuthError(INVALID_CREDENTIALS, 401);
    }

    if (isLocked(user.lockedUntil)) {
        throw new AuthError("Cuenta bloqueada temporalmente. Intenta más tarde.", 423);
    }

    const valid = await verifyPassword(password, user.passwordHash);

    if (!valid) {
        const attempts = user.failedAttempts + 1;
        const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
        await registerFailedAttempt(
            user.id,
            shouldLock ? 0 : attempts,
            shouldLock ? lockUntil() : null,
        );
        throw new AuthError(INVALID_CREDENTIALS, 401);
    }

    await registerSuccessfulLogin(user.id);

    const token = await signSession({ sub: String(user.id), role: user.roleCode });

    return {
        token,
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.roleCode,
        },
    };
}