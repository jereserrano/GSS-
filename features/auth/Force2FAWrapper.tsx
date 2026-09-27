"use client";

import React from "react";
import { Setup2FA } from "./Setup2FA";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function Force2FAWrapper() {
  const router = useRouter();
  const { update } = useSession();

  const handleSuccess = async () => {
    // Al configurar el 2FA con éxito, actualizamos la sesión localmente
    await update({ twoFactorEnabled: true });
    // Luego forzamos recarga para que el layout vuelva a leer la sesión y actualice el acceso.
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-6 space-y-4 max-w-3xl mx-auto w-full">
      <div className="text-center space-y-1 bg-white p-6 rounded-2xl shadow-sm border border-sena-green/10 w-full">
        <h1 className="text-2xl font-bold text-[#39A900]">
          ¡Bienvenido a GSS!
        </h1>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">
          Por seguridad institucional, es obligatorio configurar la autenticación en dos pasos antes de continuar.
        </p>
      </div>
      
      <div className="w-full">
        <Setup2FA onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
