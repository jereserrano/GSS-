"use client";

import React, { useState } from "react";
import { disable2FAForUserAction } from "@/actions/2fa.actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function Admin2FAManager({ usersWith2FA }: { usersWith2FA: any[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleDisable = async (userId: string) => {
    if (!window.confirm("¿Seguro que deseas desvincular el 2FA de este usuario?")) return;
    
    setLoading(userId);
    try {
      const res = await disable2FAForUserAction(userId);
      if (res.success) {
        toast.success("Dispositivo 2FA desvinculado correctamente");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(res.error || "Error al desvincular 2FA");
      }
    } catch (e) {
      toast.error("Error al comunicarse con el servidor");
    }
    setLoading(null);
  };

  if (usersWith2FA.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Panel Administrativo: Gestión de 2FA</h2>
      <p className="text-sm text-gray-600 mb-4">
        La siguiente tabla muestra a todos los usuarios del sistema que tienen la verificación 2FA activa. Puedes desvincularles el dispositivo si perdieron el acceso.
      </p>
      
      <div className="overflow-x-auto max-h-96 custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 sticky top-0">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Nombre</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3 rounded-tr-lg text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {usersWith2FA.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium">{u.nombre}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-gray-600 capitalize">{u.rol?.nombre?.toLowerCase() || 'Sin rol'}</td>
                <td className="px-4 py-3 text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDisable(u.id)}
                    disabled={loading === u.id}
                  >
                    {loading === u.id ? "Desvinculando..." : "Desvincular 2FA"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
