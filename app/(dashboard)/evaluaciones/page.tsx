import React from "react";
import { EvaluacionesTable } from "@/features/ejecucion/EvaluacionesTable";
import { getEvaluacionesAction } from "@/actions/evaluaciones.actions";
import { prisma } from "@/lib/prisma";

export default async function EvaluacionesPage({ searchParams }: { searchParams: Promise<{ busqueda?: string }> }) {
  const result = await getEvaluacionesAction({ busqueda: (await searchParams).busqueda });
  const initialData = result.success ? result.data : null;

  const raps = await prisma.resultadoAprendizaje.findMany({
    select: { id: true, codigo: true, nombre: true },
    orderBy: { codigo: "asc" }
  });

  const aprendices = await prisma.aprendiz.findMany({
    select: { 
      id: true, 
      nombres: true, 
      apellidos: true, 
      numeroDocumento: true,
      ficha: { select: { codigo: true } }
    },
    where: { estado: "EN_FORMACION" },
    orderBy: { apellidos: "asc" }
  });



  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Juicios Valorativos</h1>
        <p className="text-text-secondary mt-1">
          Registro y consulta de las calificaciones definitivas de los Resultados de Aprendizaje.
        </p>
      </div>

      <EvaluacionesTable 
        initialData={initialData} 
        raps={raps}
        aprendices={aprendices}
      />
    </div>
  );
}
