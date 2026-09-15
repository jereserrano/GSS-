import React from "react";
import { AsistenciaTable } from "@/features/ejecucion/AsistenciaTable";

export default function AsistenciaPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Control de Asistencia</h1>
        <p className="text-text-secondary mt-1">
          Registro y seguimiento de la participación de los aprendices en las sesiones de formación.
        </p>
      </div>

      <AsistenciaTable />
    </div>
  );
}
