import React from "react";
import { AsistenciaTable } from "@/features/ejecucion/AsistenciaTable";
import { getAsistenciasAction } from "@/actions/asistencia.actions";
import { prisma } from "@/lib/prisma";

export default async function AsistenciaPage({ searchParams }: { searchParams: Promise<{ busqueda?: string }> }) {
  const result = await getAsistenciasAction({ busqueda: (await searchParams).busqueda });
  const initialData = result.success ? result.data : null;

  const fichas = await prisma.ficha.findMany({
    select: { 
      id: true, 
      codigo: true,
      programa: { select: { nombre: true } }
    },
    where: { estado: "ACTIVO" },
    orderBy: { codigo: "asc" }
  });

  const instructores = await prisma.instructor.findMany({
    select: { id: true, nombres: true, apellidos: true },
    where: { estado: "ACTIVO" },
    orderBy: { apellidos: "asc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Control de Asistencia</h1>
        <p className="text-text-secondary mt-1">
          Registro y seguimiento de la participación de los aprendices en las sesiones de formación.
        </p>
      </div>

      <AsistenciaTable 
        initialData={initialData} 
        fichas={fichas}
        instructores={instructores}
      />
    </div>
  );
}
