export const ROLES = ["admin", "employee"] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
    admin: "Administrador",
    employee: "Empleado",
};

export function isRole(value: string): value is Role {
    return (ROLES as readonly string[]).includes(value);
}