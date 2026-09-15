import React from "react";
import { KpiCard } from "@/features/dashboard/KpiCard";
import { RiskTable } from "@/features/dashboard/RiskTable";
import { TrendChart, DistributionChart } from "@/features/dashboard/Charts";
import { getDashboardKpis } from "@/actions/dashboard.actions";
import type { KpiData } from "@/types/common.types";
import { Clock } from "lucide-react";

export default async function DashboardPage() {
  const result = await getDashboardKpis();

  const dashboardData = result.ok && result.data ? result.data : null;
  const kpisData = dashboardData?.kpis ?? null;
  const aprendicesRiesgo = dashboardData?.aprendicesRiesgo ?? [];

  const kpis: KpiData[] = [
    {
      titulo: "Total Aprendices",
      valor: kpisData ? kpisData.totalAprendices.toLocaleString("es-CO") : "—",
      subtitulo: "En formación activa",
      icono: "Users",
      color: "bg-sena-500",
    },
    {
      titulo: "Instituciones",
      valor: kpisData ? kpisData.totalInstituciones.toString() : "—",
      subtitulo: "Articuladas en el Magdalena",
      icono: "Building2",
      color: "bg-verde-500",
    },
    {
      titulo: "Fichas Activas",
      valor: kpisData ? kpisData.totalFichas.toString() : "—",
      subtitulo: "Grupos en formación",
      icono: "Target",
      color: "bg-info-500",
    },
    {
      titulo: "Asistencia Promedio",
      valor: kpisData ? `${kpisData.asistenciaPromedio}%` : "—",
      subtitulo: "Aprendices en formación",
      icono: "TrendingUp",
      color: "bg-warning-500",
    },
  ];

  return (
    <div className="page-container space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Panorama General</h1>
          <p className="text-text-secondary mt-1">Resumen del proceso de articulación con la Media Técnica.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <KpiCard key={idx} kpi={kpi} />
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TrendChart />
        <DistributionChart />
      </div>

      {/* Tablas Inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RiskTable aprendices={aprendicesRiesgo} isLoading={false} />
        </div>

        {/* Próximos Cierres */}
        <div className="card-institucional flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-warning-500" />
            <h3 className="font-semibold text-lg text-text-primary">Próximos Cierres</h3>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {[
              { title: "Evaluación Técnica - Módulo 2", date: "Hoy, 23:59", ficha: "Ficha 2987654" },
              { title: "Entrega Proyecto Final", date: "Mañana, 23:59", ficha: "Ficha 3100222" },
              { title: "Registro de Asistencias Semanal", date: "Viernes, 18:00", ficha: "Todas las Fichas" },
            ].map((act, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg border border-border bg-slate-50">
                <div className="h-2 w-2 rounded-full bg-warning-500 mt-2 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-text-primary">{act.title}</span>
                  <span className="text-xs text-text-secondary mt-1">{act.ficha} • {act.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
