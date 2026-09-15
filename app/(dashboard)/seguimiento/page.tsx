import React from "react";
import { SeguimientoTable } from "@/features/seguimiento/SeguimientoTable";

export default function SeguimientoPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Visitas de Seguimiento</h1>
        <p className="text-text-secondary mt-1">
          Control de visitas técnicas y seguimiento al desarrollo de la articulación.
        </p>
      </div>

      <SeguimientoTable />
    </div>
  );
}
