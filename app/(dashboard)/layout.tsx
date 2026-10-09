import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Force2FAWrapper } from "@/features/auth/Force2FAWrapper";
import { SessionHydration } from "@/components/SessionHydration";
import { ThemeInjector } from "@/components/layout/ThemeInjector";
import { prisma } from "@/lib/prisma";
import { OfflineSyncManager } from "@/components/OfflineSyncManager";

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
        <ThemeInjector />
        <div className="flex min-h-screen bg-app items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <Force2FAWrapper />
          </div>
        </div>
      </SessionHydration>
    );
  }

  const config = await prisma.configuracionSistema.findFirst();

  return (
    <SessionHydration session={session}>
      <ThemeInjector />
      <OfflineSyncManager />
      <div className="flex min-h-screen bg-app">
        <Sidebar branding={{
          ...(config?.nombreSoftware ? { nombreSoftware: config.nombreSoftware } : {}),
          ...(config?.nombreInstitucion ? { nombreInstitucion: config.nombreInstitucion } : {}),
          ...(config?.logoUrl ? { logoUrl: config.logoUrl } : {}),
        }} />
        <div className="main-content flex-1 flex flex-col w-full min-h-screen">
          <Header {...(config?.logoUrl ? { logoUrl: config.logoUrl } : {})} />
          <main className="flex-1 w-full relative">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SessionHydration>
  );
}
