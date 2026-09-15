import React from "react";
import { EvaluacionesTable } from "@/features/ejecucion/EvaluacionesTable";

export default function EvaluacionesPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Juicios Valorativos</h1>
        <p className="text-text-secondary mt-1">
          Registro y consulta de las calificaciones definitivas de los Resultados de Aprendizaje.
        </p>
      </div>

      <EvaluacionesTable />
    </div>
  );
}
