import React from "react";
import { Providers } from "@/components/providers";
import { SecurityGuard } from "@/components/shared/SecurityGuard";
import "./globals.css";

export const metadata = {
  title: "GSS - Grade Submission System",
  description: "Sistema de Gestión y Seguimiento Académico - SENA Regional Magdalena",
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
