import React from "react";
import { TomaAsistenciaForm } from "@/features/ejecucion/TomaAsistenciaForm";
import { prisma } from "@/lib/prisma";

export default async function TomarAsistenciaPage() {
  const fichas = await prisma.ficha.findMany({
    where: { estado: "ACTIVO" },
    include: {
      programa: true,
      aprendices: {
        where: { estado: "EN_FORMACION" },
        orderBy: { apellidos: "asc" }
      }
    },
    orderBy: { codigo: "asc" }
  });

  const instructores = await prisma.instructor.findMany({
    where: { estado: "ACTIVO" },
    orderBy: { apellidos: "asc" }
  });

  return (
    <div className="page-container space-y-6 page-enter max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Toma de Asistencia (Modo Lista)</h1>
        <p className="text-text-secondary mt-1">
          Seleccione una ficha para desplegar el listado de aprendices y registrar la asistencia de forma masiva.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
        <TomaAsistenciaForm fichas={fichas as any} instructores={instructores as any} />
      </div>
    </div>
  );
}
