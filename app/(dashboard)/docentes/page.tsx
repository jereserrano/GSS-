import React from "react";
import { DocentesTable } from "@/features/actores/DocentesTable";
import { getDocentesAction } from "@/actions/docentes.actions";

export default async function DocentesPage({ searchParams }: { searchParams: Promise<{ busqueda?: string }> }) {
  const result = await getDocentesAction({ busqueda: (await searchParams).busqueda });
  const initialData = result.success ? result.data : null;

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Docentes Pares</h1>
        <p className="text-text-secondary mt-1">
          Personal de las instituciones educativas que apoya y hace seguimiento a los estudiantes.
        </p>
      </div>

      <DocentesTable initialData={initialData} />
    </div>
  );
}
