import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GestorExcusas } from "@/features/seguimiento/GestorExcusas";

export default async function GestorExcusasPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const rol = session.user.role;
  const isCoordSede = rol === "COORDINADOR_SEDE" || (rol.includes("COORD") && rol.includes("SEDE"));

  // Roles que pueden VER el gestor de excusas
  const ROLES_CON_ACCESO = [
    "INSTRUCTOR",
    "ADMINISTRADOR",
    "ADMIN",
    "COORDINADOR",
    "COORDINADOR_SEDE",
    "APOYO_COORDINACION",
  ];

  if (!ROLES_CON_ACCESO.includes(rol) && !isCoordSede) {
    return (
      <div className="page-container text-center py-20">
        <h2 className="text-xl font-bold">No tienes acceso a este módulo.</h2>
      </div>
    );
  }

  // Roles que pueden APROBAR / RECHAZAR excusas (Coordinador de Sede solo tiene lectura)
  const canEdit = !isCoordSede && ROLES_CON_ACCESO.includes(rol);

  const descripcion = (() => {
    if (isCoordSede) return "Consulta y seguimiento de excusas radicadas en tu sede (modo solo lectura).";
    if (rol === "INSTRUCTOR") return "Revisa y gestiona las excusas de los aprendices de tus fichas.";
    if (rol === "APOYO_COORDINACION") return "Gestiona las excusas de los aprendices de tu sede.";
    return "Vista general de todas las excusas radicadas en la institución.";
  })();

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Gestor de Excusas</h1>
        <p className="text-text-secondary mt-1">{descripcion}</p>
      </div>

      <GestorExcusas canEdit={canEdit} />
    </div>
  );
}
