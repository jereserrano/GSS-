import React from "react";
import { ProgramasTable } from "@/features/programas/ProgramasTable";
import { getProgramasAction } from "@/actions/programas.actions";

export default async function ProgramasPage() {
  const initialResult = await getProgramasAction({ pagina: 1, tamano: 10 });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Programas de Formación</h1>
        <p className="text-text-secondary mt-1">
          Catálogo de programas técnicos ofertados en articulación con la Media Técnica.
        </p>
      </div>

      <ProgramasTable
        initialData={initialResult.success ? initialResult.data : null}
      />
    </div>
  );
}
