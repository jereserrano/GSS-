import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MensajeriaView } from "@/features/mensajeria/MensajeriaView";

export default async function MensajesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const rol = session.user.role;

  // FIX: El enum real es ADMINISTRADOR (no "ADMIN")
  const isCoordinador =
    rol === "ADMINISTRADOR" ||
    rol === "ADMIN" || // compatibilidad con sesiones antiguas
    rol === "COORDINADOR";

  return (
    <div className="page-container h-[calc(100vh-80px)] overflow-hidden flex flex-col">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Centro de Mensajería</h1>
        <p className="text-text-secondary mt-1">
          Comunícate con otros miembros de la comunidad educativa de manera directa.
        </p>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-hidden">
        <MensajeriaView
          userId={session.user.id}
          isCoordinador={isCoordinador}
          userRole={rol}
        />
      </div>
    </div>
  );
}
