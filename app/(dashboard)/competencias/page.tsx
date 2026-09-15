import React from "react";
import { CompetenciasTable } from "@/features/academico/CompetenciasTable";
import { getCompetenciasAction } from "@/actions/competencias.actions";
import { prisma } from "@/lib/prisma";

export default async function CompetenciasPage({ searchParams }: { searchParams: Promise<{ busqueda?: string }> }) {
  const result = await getCompetenciasAction({ busqueda: (await searchParams).busqueda });
  const initialData = result.success ? result.data : null;

  const programas = await prisma.programa.findMany({
    select: { id: true, codigo: true, nombre: true },
    where: { estado: "ACTIVO" },
    orderBy: { nombre: "asc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Competencias</h1>
        <p className="text-text-secondary mt-1">
          Estructura de competencias técnicas y transversales del diseño curricular SENA.
        </p>
      </div>

      <CompetenciasTable 
        initialData={initialData} 
        programas={programas} 
      />
    </div>
  );
}
