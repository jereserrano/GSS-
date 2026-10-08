import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PortafolioInstructor } from "@/features/documentos/instructor/PortafolioInstructor";
import { ConsolaRevisionDocumentos } from "@/features/documentos/admin/ConsolaRevisionDocumentos";
import { DocumentosAprendiz } from "@/features/documentos/aprendiz/DocumentosAprendiz";

export default async function DocumentosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const rol = (session.user as any).role?.toUpperCase() || "";
  const isAprendiz = rol.includes("APRENDIZ");
  const isRevisor = rol === "ADMINISTRADOR" || rol === "COORDINADOR" || rol === "APOYO_COORDINACION";
  const isInstructor = rol.includes("INSTRUCT");

  const titulo = isRevisor
    ? "Revisión de Documentación Institucional"
    : isAprendiz
      ? "Mis Documentos"
      : "Mi Portafolio Docente";

  const subtitulo = isRevisor
    ? "Supervisa y verifica el estado de la documentación de los instructores."
    : isAprendiz
      ? "Consulta y solicita tus certificados de estudio."
      : "Gestiona tu información personal y los soportes documentales requeridos.";

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          {titulo}
        </h1>
        <p className="text-text-secondary mt-1">
          {subtitulo}
        </p>
      </div>

      {isRevisor && <ConsolaRevisionDocumentos />}
      {isInstructor && <PortafolioInstructor userId={session.user.id} />}
      {isAprendiz && <DocumentosAprendiz userId={session.user.id} />}
    </div>
  );
}
