import React from "react";
import { Viewport } from "next";
import { Providers } from "@/components/providers";
import { SecurityGuard } from "@/components/shared/SecurityGuard";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#39A900",
};

export const metadata = {
  title: "GSS — Sistema de Información para el Seguimiento del Proceso de Integración con la Media Técnica",
  description: "GSS — Proyecto académico desarrollado en el contexto del SENA para el seguimiento formativo de la Media Técnica",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GSS",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // La sesión NO se carga aquí para que el root layout sea estático y
  // no arrastre bcryptjs/otplib/prisma al bundle de webpack, lo que
  // causaba "Cannot read properties of undefined (reading 'call')" en
  // el prerendering de /_not-found y otras páginas estáticas.
  //
  // Cada sub-layout que necesite sesión (dashboard) la obtiene por su cuenta
  // con getServerSession + export const dynamic = "force-dynamic".
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
