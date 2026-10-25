"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    Avatar,
    Box,
    Drawer,
    IconButton,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import { ROLE_LABELS, type Role } from "@/shared/security/roles";

const EXPANDED_WIDTH = 264;
const COLLAPSED_WIDTH = 80;
const STORAGE_KEY = "dq-sidebar-collapsed";

interface MenuItem {
    label: string;
    href: string;
    icon: ReactNode;
    roles: Role[];
}

// Cada opción indica qué roles pueden verla
const menuItems: MenuItem[] = [
    { label: "Proyecciones y analítica", href: "/dashboard", icon: <TrendingUpIcon />, roles: ["admin", "employee"] },
    { label: "Lotes", href: "/lotes", icon: <Inventory2Icon />, roles: ["admin", "employee"] },
    { label: "Pedidos", href: "/pedidos", icon: <ReceiptLongIcon />, roles: ["admin", "employee"] },
    { label: "Usuarios", href: "/usuarios", icon: <PeopleIcon />, roles: ["admin"] },
];

interface SidebarButtonProps {
    icon: ReactNode;
    label: string;
    collapsed: boolean;
    active?: boolean;
    danger?: boolean;
    disabled?: boolean;
    onClick: () => void;
}

function SidebarButton({ icon, label, collapsed, active, danger, disabled, onClick }: SidebarButtonProps) {
    return (
        <Tooltip title={collapsed ? label : ""} placement="right" arrow>
            <ListItemButton
                onClick={onClick}
                disabled={disabled}
                sx={{
                    position: "relative",
                    mx: 1.5,
                    mb: 0.5,
                    px: collapsed ? 0 : 2,
                    minHeight: 46,
                    borderRadius: 2.5,
                    justifyContent: collapsed ? "center" : "flex-start",
                    color: active ? "#ffffff" : "#94a3b8",
                    bgcolor: active ? "rgba(59, 130, 246, 0.18)" : "transparent",
                    transition: "background-color 0.2s ease, color 0.2s ease",
                    "&:hover": {
                        bgcolor: danger
                            ? "rgba(244, 63, 94, 0.15)"
                            : active
                                ? "rgba(59, 130, 246, 0.26)"
                                : "rgba(148, 163, 184, 0.1)",
                        color: danger ? "#fda4af" : "#e2e8f0",
                    },
                    "&::before": active
                        ? {
                            content: '""',
                            position: "absolute",
                            left: -12,
                            top: 10,
                            bottom: 10,
                            width: 4,
                            borderRadius: 4,
                            bgcolor: "#3b82f6",
                        }
                        : undefined,
                }}
            >
                <ListItemIcon
                    sx={{ minWidth: 0, mr: collapsed ? 0 : 2, color: "inherit", justifyContent: "center" }}
                >
                    {icon}
                </ListItemIcon>

                {!collapsed && (
                    <ListItemText
                        primary={label}
                        slotProps={{
                            primary: { sx: { fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" } },
                        }}
                    />
                )}
            </ListItemButton>
        </Tooltip>
    );
}

interface SidebarContentProps {
    role: Role;
    collapsed: boolean;
    pathname: string;
    loggingOut: boolean;
    onNavigate: (href: string) => void;
    onToggle?: () => void;
    onLogout: () => void;
}

function SidebarContent({
    role,
    collapsed,
    pathname,
    loggingOut,
    onNavigate,
    onToggle,
    onLogout,
}: SidebarContentProps) {
    // Solo se muestran las opciones que corresponden al rol del usuario
    const visibleItems = menuItems.filter((item) => item.roles.includes(role));

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#0f172a", color: "#cbd5e1" }}>
            {/* Logo */}
            <Box
                sx={{
                    height: 72,
                    px: collapsed ? 0 : 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "flex-start",
                    gap: 1.5,
                    flexShrink: 0,
                }}
            >
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        color: "#ffffff",
                        background: "linear-gradient(135deg, #2563eb, #60a5fa)",
                        flexShrink: 0,
                    }}
                >
                    <LocalShippingIcon fontSize="small" />
                </Box>

                {!collapsed && (
                    <Typography sx={{ color: "#ffffff", fontWeight: 800, fontSize: 18, whiteSpace: "nowrap" }}>
                        DQ<Box component="span" sx={{ color: "#60a5fa" }}>-Logistics</Box>
                    </Typography>
                )}
            </Box>

            {/* Etiqueta de sección */}
            {!collapsed ? (
                <Typography
                    variant="caption"
                    sx={{ px: 3, pt: 2, pb: 1, color: "#64748b", fontWeight: 700, letterSpacing: 1.2 }}
                >
                    MENÚ PRINCIPAL
                </Typography>
            ) : (
                <Box sx={{ mx: 2, my: 1.5, borderTop: "1px solid #1e293b" }} />
            )}

            {/* Navegación filtrada por rol */}
            <Box sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden", py: 1 }}>
                {visibleItems.map((item) => (
                    <SidebarButton
                        key={item.href}
                        icon={item.icon}
                        label={item.label}
                        collapsed={collapsed}
                        active={pathname === item.href}
                        onClick={() => onNavigate(item.href)}
                    />
                ))}
            </Box>

            {/* Pie: usuario, cerrar sesión y colapsar */}
            <Box sx={{ borderTop: "1px solid #1e293b", pt: 1.5, pb: 1.5 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: collapsed ? "center" : "flex-start",
                        gap: 1.5,
                        px: collapsed ? 0 : 2.5,
                        mb: 1.5,
                    }}
                >
                    <Avatar sx={{ width: 36, height: 36, bgcolor: "#1d4ed8", fontSize: 14, fontWeight: 700 }}>
                        DQ
                    </Avatar>
                    {!collapsed && (
                        <Box sx={{ minWidth: 0 }}>
                            <Typography noWrap sx={{ color: "#ffffff", fontSize: 14, fontWeight: 600 }}>
                                Mi cuenta
                            </Typography>
                            <Typography noWrap sx={{ color: "#64748b", fontSize: 12 }}>
                                {ROLE_LABELS[role]}
                            </Typography>
                        </Box>
                    )}
                </Box>

                <SidebarButton
                    icon={<LogoutIcon />}
                    label="Cerrar sesión"
                    collapsed={collapsed}
                    danger
                    disabled={loggingOut}
                    onClick={onLogout}
                />

                {onToggle && (
                    <SidebarButton
                        icon={collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        label={collapsed ? "Expandir menú" : "Contraer menú"}
                        collapsed={collapsed}
                        onClick={onToggle}
                    />
                )}
            </Box>
        </Box>
    );
}

export default function DashboardShell({ children, role }: { children: ReactNode; role: Role }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const pathname = usePathname();
    const router = useRouter();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        setCollapsed(localStorage.getItem(STORAGE_KEY) === "true");
    }, []);

    function toggleCollapsed() {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem(STORAGE_KEY, String(next));
    }

    function navigate(href: string) {
        setMobileOpen(false);
        router.push(href);
    }

    async function handleLogout() {
        setLoggingOut(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    }

    const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f1f5f9" }}>
            {isMobile ? (
                <>
                    <IconButton
                        onClick={() => setMobileOpen(true)}
                        aria-label="Abrir menú"
                        sx={{
                            position: "fixed",
                            top: 12,
                            left: 12,
                            zIndex: theme.zIndex.drawer - 1,
                            bgcolor: "#0f172a",
                            color: "#ffffff",
                            "&:hover": { bgcolor: "#1e293b" },
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Drawer
                        open={mobileOpen}
                        onClose={() => setMobileOpen(false)}
                        slotProps={{ paper: { sx: { width: EXPANDED_WIDTH, border: "none" } } }}
                    >
                        <SidebarContent
                            role={role}
                            collapsed={false}
                            pathname={pathname}
                            loggingOut={loggingOut}
                            onNavigate={navigate}
                            onLogout={handleLogout}
                        />
                    </Drawer>
                </>
            ) : (
                <Box
                    component="aside"
                    sx={{
                        width,
                        flexShrink: 0,
                        position: "sticky",
                        top: 0,
                        height: "100vh",
                        overflow: "hidden",
                        transition: "width 0.25s ease",
                    }}
                >
                    <SidebarContent
                        role={role}
                        collapsed={collapsed}
                        pathname={pathname}
                        loggingOut={loggingOut}
                        onNavigate={navigate}
                        onToggle={toggleCollapsed}
                        onLogout={handleLogout}
                    />
                </Box>
            )}

            <Box
                component="main"
                sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 3 }, pt: { xs: 8, md: 3 } }}
            >
                {children}
            </Box>
        </Box>
    );
}