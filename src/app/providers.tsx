"use client";

import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import type { ReactNode } from "react";

const theme = createTheme({
    palette: {
        primary: { main: "#1565c0" },
        secondary: { main: "#2e7d32" },
    },
    shape: { borderRadius: 8 },
});

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </AppRouterCacheProvider>
    );
}