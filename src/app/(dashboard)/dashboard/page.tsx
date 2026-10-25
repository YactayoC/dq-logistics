import { Paper, Stack, Typography } from "@mui/material";

const kpis = [
    { label: "Lotes procesados", value: "—" },
    { label: "Pedidos analizados", value: "—" },
    { label: "Clientes en riesgo", value: "—" },
];

export default function DashboardPage() {
    return (
        <>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                Dashboard
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                {kpis.map((kpi) => (
                    <Paper key={kpi.label} elevation={2} sx={{ p: 3, flex: 1, borderRadius: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            {kpi.label}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                            {kpi.value}
                        </Typography>
                    </Paper>
                ))}
            </Stack>
        </>
    );
}