import React from "react";
import { CompetenciasTable } from "@/features/academico/CompetenciasTable";

export default function CompetenciasPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Competencias</h1>
        <p className="text-text-secondary mt-1">
          Estructura de competencias técnicas y transversales del diseño curricular SENA.
        </p>
      </div>

      <CompetenciasTable />
    </div>
  );
}
