import React from "react";
import { InstructoresTable } from "@/features/actores/InstructoresTable";
import { getInstructoresAction } from "@/actions/instructores.actions";

export default async function InstructoresPage({ searchParams }: { searchParams: Promise<{ busqueda?: string }> }) {
  const result = await getInstructoresAction({ busqueda: (await searchParams).busqueda });
  const initialData = result.success ? result.data : null;

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Instructores SENA</h1>
        <p className="text-text-secondary mt-1">
          Personal encargado de impartir la formación técnica en articulación.
        </p>
      </div>

      <InstructoresTable initialData={initialData} />
    </div>
  );
}
