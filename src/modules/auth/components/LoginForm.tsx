"use client";

import { useState, type FormEvent } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                setError(data.message ?? "No se pudo iniciar sesión");
                return;
            }

            // Provisional: cambiar a router.push("/dashboard") cuando exista el dashboard
            setSuccess(true);
        } catch {
            setError("Error de conexión. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
                background: "linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #42a5f5 100%)",
            }}
        >
            <Container maxWidth="xs">
                <Paper elevation={24} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                background: "linear-gradient(135deg, #1565c0, #42a5f5)",
                                boxShadow: 4,
                                mb: 2,
                            }}
                        >
                            <LocalShippingIcon fontSize="large" />
                        </Box>

                        <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
                            DQ-Logistics
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: "center" }}>
                            Plataforma de logística y análisis de pedidos
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Sesión iniciada correctamente. El dashboard estará disponible próximamente.
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            fullWidth
                            required
                            id="email"
                            name="email"
                            type="email"
                            label="Correo electrónico"
                            autoComplete="email"
                            autoFocus
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailOutlinedIcon color="action" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            required
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            label="Contraseña"
                            autoComplete="current-password"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                py: 1.4,
                                fontWeight: 600,
                                textTransform: "none",
                                fontSize: "1rem",
                                background: "linear-gradient(135deg, #1565c0, #42a5f5)",
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Ingresar"}
                        </Button>
                    </Box>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 3, textAlign: "center" }}
                    >
                        © {new Date().getFullYear()} DQ-Logistics
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}