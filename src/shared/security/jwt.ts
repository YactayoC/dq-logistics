import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "dq_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 horas

export interface SessionPayload {
    sub: string; // id del usuario
    role: string; // código del rol: "admin" o "employee"
}

function getSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("Falta la variable de entorno JWT_SECRET");
    return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
    return new SignJWT({ role: payload.role })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(payload.sub)
        .setIssuedAt()
        .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
        .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return { sub: String(payload.sub), role: String(payload.role) };
    } catch {
        return null;
    }
}

export { SESSION_DURATION_SECONDS };