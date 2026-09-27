import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Force2FAWrapper } from "@/features/auth/Force2FAWrapper";
import { SessionHydration } from "@/components/SessionHydration";

// El dashboard siempre requiere sesión — nunca pre-renderizar estáticamente
export const dynamic = "force-dynamic";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  // Si no está habilitado el 2FA, forzamos la vista de configuración
  if (session?.user && !(session.user as any).twoFactorEnabled) {
    return (
      <SessionHydration session={session}>
        <div className="flex min-h-screen bg-app items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <Force2FAWrapper />
          </div>
        </div>
      </SessionHydration>
    );
  }

  return (
    <SessionHydration session={session}>
      <div className="flex min-h-screen bg-app">
        <Sidebar />
        <div className="main-content flex-1 flex flex-col w-full min-h-screen">
          <Header />
          <main className="flex-1 w-full relative">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SessionHydration>
  );
}
