import React from "react";
import { Providers } from "@/components/providers";
import { SecurityGuard } from "@/components/shared/SecurityGuard";
import "./globals.css";

export const metadata = {
  title: "GSS — Sistema de Información para el Seguimiento del Proceso de Integración con la Media Técnica",
  description: "GSS — Proyecto académico desarrollado en el contexto del SENA para el seguimiento formativo de la Media Técnica",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-app">
        <Providers>
          <SecurityGuard>
            {children}
          </SecurityGuard>
        </Providers>
      </body>
    </html>
  );
}
