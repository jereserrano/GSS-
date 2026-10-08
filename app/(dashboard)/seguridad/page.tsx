import React from "react";
import { Setup2FA } from "@/features/auth/Setup2FA";
import { Disable2FAButton } from "@/features/auth/Disable2FAButton";
import { Admin2FAManager } from "@/features/auth/Admin2FAManager";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

export default async function SeguridadPage() {
  const session = await getServerSession();
  let is2FAEnabled = false;
  let isAdmin = false;
  let usersWith2FA: any[] = [];
  
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email }
    });
    
    if (user?.twoFactorEnabled) {
      is2FAEnabled = true;
    }
    
    if (typeof user?.rol === 'string' && user.rol.toUpperCase().includes('ADMIN')) {
      isAdmin = true;
      usersWith2FA = await prisma.user.findMany({
        where: { twoFactorEnabled: true },
        orderBy: { nombre: 'asc' }
      });
    }
  }

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Seguridad de la Cuenta</h1>
        <p className="text-text-secondary mt-1">
          Configura la autenticación en dos pasos (2FA) para proteger el acceso a la plataforma.
        </p>
      </div>
      
      {is2FAEnabled ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-green-800">
          <h2 className="text-lg font-bold mb-2">¡2FA Activado!</h2>
          <p>Tu cuenta está protegida. Se solicitará el código de tu aplicación autenticadora (Google Authenticator) en dispositivos nuevos o cada 7 días.</p>
          <Disable2FAButton />
        </div>
      ) : (
        <Setup2FA />
      )}

      {isAdmin && (
        <Admin2FAManager usersWith2FA={usersWith2FA} />
      )}
    </div>
  );
}

