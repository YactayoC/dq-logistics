import { eq, sql } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { roles, users } from "@/shared/db/schema";

export async function findUserByEmail(email: string) {
    const [row] = await db
        .select({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            passwordHash: users.passwordHash,
            isActive: users.isActive,
            failedAttempts: users.failedAttempts,
            lockedUntil: users.lockedUntil,
            roleCode: roles.code,
        })
        .from(users)
        .innerJoin(roles, eq(users.roleId, roles.id))
        .where(sql`lower(${users.email}) = ${email.toLowerCase()}`)
        .limit(1);

    return row ?? null;
}

export async function registerFailedAttempt(userId: number, attempts: number, lockedUntil: Date | null) {
    await db
        .update(users)
        .set({
            failedAttempts: attempts,
            lockedUntil,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
}

export async function registerSuccessfulLogin(userId: number) {
    await db
        .update(users)
        .set({
            failedAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
}