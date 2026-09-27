import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PortafolioInstructor } from "@/features/documentos/instructor/PortafolioInstructor";
import { ConsolaRevisionDocumentos } from "@/features/documentos/admin/ConsolaRevisionDocumentos";

export default async function DocumentosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const rol = (session.user as any).role?.toUpperCase() || "";
  const isAprendiz = rol.includes("APRENDIZ");
  
  if (isAprendiz) {
    return (
      <div className="page-container text-center py-20">
        <h2 className="text-xl font-bold">No tienes acceso a este módulo.</h2>
      </div>
    );
  }

  const isRevisor = rol === "ADMINISTRADOR" || rol === "COORDINADOR" || rol === "APOYO_COORDINACION";
  const isInstructor = rol.includes("INSTRUCT");

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          {isRevisor ? "Revisión de Documentación Institucional" : "Mi Portafolio Docente"}
        </h1>
        <p className="text-text-secondary mt-1">
          {isRevisor 
            ? "Supervisa y verifica el estado de la documentación de los instructores." 
            : "Gestiona tu información personal y los soportes documentales requeridos."}
        </p>
      </div>

      {isRevisor && <ConsolaRevisionDocumentos />}
      {isInstructor && <PortafolioInstructor userId={session.user.id} />}
    </div>
  );
}
