import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/modules/dashboard/components/DashboardShell";
import { SESSION_COOKIE, verifySession } from "@/shared/security/jwt";
import { isRole, type Role } from "@/shared/security/roles";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySession(token) : null;

    // Sin sesión válida no se muestra ninguna pantalla del dashboard
    if (!session) {
        redirect("/login");
    }

    // Si el rol no es reconocido, se usa el más restringido
    const role: Role = isRole(session.role) ? session.role : "employee";

    return <DashboardShell role={role}>{children}</DashboardShell>;
}