import React from "react";
import { ReportesPageClient } from "@/features/reportes/ReportesPageClient";
import { getResumenReportes, getReportesListadosAction } from "@/actions/reportes.actions";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  const result = await getResumenReportes();
  const resultListados = await getReportesListadosAction();
  const resumen = result.success ? result.data! : null;
  const listados = resultListados.success ? resultListados.data! : null;

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Módulo de Reportes</h1>
        <p className="text-text-secondary mt-1">
          Generación y exportación de informes estadísticos del programa de articulación.
        </p>
      </div>

      <ReportesPageClient 
        resumen={resumen ?? null} 
        listados={listados ?? { aprendices: [], alertas: [], asistencias: [] }} 
      />
    </div>
  );
}
