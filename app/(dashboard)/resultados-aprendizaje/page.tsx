import React from "react";
import { ResultadosAprendizajeTable } from "@/features/academico/ResultadosAprendizajeTable";
import { getResultadosAprendizajeAction } from "@/actions/resultados_aprendizaje.actions";
import { prisma } from "@/lib/prisma";

export default async function ResultadosAprendizajePage({ searchParams }: { searchParams: Promise<{ busqueda?: string }> }) {
  const result = await getResultadosAprendizajeAction({ busqueda: (await searchParams).busqueda });
  const initialData = result.success ? result.data : null;

  const competencias = await prisma.competencia.findMany({
    select: { id: true, codigo: true, nombre: true },
    where: { estado: "ACTIVO" },
    orderBy: { codigo: "asc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Resultados de Aprendizaje</h1>
        <p className="text-text-secondary mt-1">
          Gestión de los Resultados de Aprendizaje (RAP) que deben alcanzar los estudiantes.
        </p>
      </div>

      <ResultadosAprendizajeTable 
        initialData={initialData} 
        competencias={competencias} 
      />
    </div>
  );
}
