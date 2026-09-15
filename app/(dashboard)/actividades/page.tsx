import React from "react";
import { ActividadesTable } from "@/features/ejecucion/ActividadesTable";

export default function ActividadesPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Actividades</h1>
        <p className="text-text-secondary mt-1">
          Gestión de tareas, talleres y proyectos asignados a las fichas.
        </p>
      </div>

      <ActividadesTable />
    </div>
  );
}
