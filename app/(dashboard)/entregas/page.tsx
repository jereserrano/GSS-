import React from "react";
import { EntregasTable } from "@/features/ejecucion/EntregasTable";

export default function EntregasPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Evidencias y Entregas</h1>
        <p className="text-text-secondary mt-1">
          Revisión de las evidencias de aprendizaje subidas por los estudiantes.
        </p>
      </div>

      <EntregasTable />
    </div>
  );
}
