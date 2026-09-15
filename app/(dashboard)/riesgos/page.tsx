import React from "react";
import { RiesgosTable } from "@/features/seguimiento/RiesgosTable";

export default function RiesgosPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Sistema de Riesgos</h1>
        <p className="text-text-secondary mt-1">
          Alertas tempranas por deserción, inasistencia o bajo rendimiento.
        </p>
      </div>

      <RiesgosTable />
    </div>
  );
}
