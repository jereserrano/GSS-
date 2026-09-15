import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata = {
  title: "Prompt Maestro - SENA Media Técnica",
  description: "Sistema de Seguimiento a la Integración con la Media Técnica",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Providers>
          <div className="flex min-h-screen bg-app">
            <Sidebar />
            <div className="main-content flex-1 flex flex-col w-full">
              <Header />
              <main className="flex-1 w-full relative">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
