import type { Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "DQ-Logistics",
  description: "Plataforma de logística y análisis de pedidos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}