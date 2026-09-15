import React from "react";
import { ProgramasTable } from "@/features/programas/ProgramasTable";

export default function ProgramasPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Programas de Formación</h1>
        <p className="text-text-secondary mt-1">
          Catálogo de programas técnicos ofertados en articulación.
        </p>
      </div>

      <ProgramasTable />
    </div>
  );
}
