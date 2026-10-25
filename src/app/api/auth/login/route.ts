import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError } from "@/modules/auth/domain/login-policy";
import { authenticate } from "@/modules/auth/services/auth.service";
import { SESSION_COOKIE, SESSION_DURATION_SECONDS } from "@/shared/security/jwt";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ message: "Datos inválidos" }, { status: 400 });
    }

    try {
        const { token, user } = await authenticate(parsed.data.email, parsed.data.password);

        const response = NextResponse.json({ user });
        response.cookies.set(SESSION_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: SESSION_DURATION_SECONDS,
        });

        return response;
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }

        console.error("Error en login:", error);
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    }
}