import React from "react";
import { ReportesDashboard } from "@/features/seguimiento/ReportesDashboard";

export default function ReportesPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Módulo de Reportes</h1>
        <p className="text-text-secondary mt-1">
          Generación y exportación de informes estadísticos del programa de articulación.
        </p>
      </div>

      <ReportesDashboard />
    </div>
  );
}
