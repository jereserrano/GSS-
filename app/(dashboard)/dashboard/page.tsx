"use client";

import React, { useEffect, useState } from "react";
import { KpiCard } from "@/features/dashboard/KpiCard";
import { RiskTable } from "@/features/dashboard/RiskTable";
import { TrendChart, DistributionChart } from "@/features/dashboard/Charts";
import type { KpiData } from "@/types/common.types";
import type { Aprendiz } from "@/types/aprendiz.types";
import { AprendicesService } from "@/services/aprendices.service";
import { Activity, Clock } from "lucide-react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [aprendicesRiesgo, setAprendicesRiesgo] = useState<Aprendiz[]>([]);

  const kpis: KpiData[] = [
    {
      titulo: "Total Aprendices",
      valor: "4.250",
      subtitulo: "Activos en Media Técnica",
      icono: "Users",
      color: "bg-sena-500",
      tendencia: { valor: 5.2, positivo: true }
    },
    {
      titulo: "Instituciones",
      valor: "18",
      subtitulo: "Articuladas en el Magdalena",
      icono: "Building2",
      color: "bg-verde-500",
      tendencia: { valor: 2.0, positivo: true }
    },
    {
      titulo: "Fichas Activas",
      valor: "124",
      subtitulo: "Grupos en formación",
      icono: "Target",
      color: "bg-info-500"
    },
    {
      titulo: "Asistencia Promedio",
      valor: "88.5%",
      subtitulo: "Últimos 30 días",
      icono: "TrendingUp",
      color: "bg-warning-500",
      tendencia: { valor: 1.5, positivo: false }
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      // Solo traemos aprendices en riesgo medio y alto
      const [resRiesgoAlto, resRiesgoMedio] = await Promise.all([
        AprendicesService.getAprendices({ nivelRiesgo: "alto", tamano: 5 }),
        AprendicesService.getAprendices({ nivelRiesgo: "medio", tamano: 5 })
      ]);
      
      const combined = [];
      if (resRiesgoAlto.ok) combined.push(...resRiesgoAlto.data.data);
      if (resRiesgoMedio.ok) combined.push(...resRiesgoMedio.data.data);
      
      // Mostrar solo los primeros 5 en el dashboard
      setAprendicesRiesgo(combined.slice(0, 5));
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

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
        {loading && aprendicesRiesgo.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))
        ) : (
          kpis.map((kpi, idx) => (
            <KpiCard key={idx} kpi={kpi} />
          ))
        )}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TrendChart />
        <DistributionChart />
      </div>

      {/* Tablas Inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RiskTable aprendices={aprendicesRiesgo} isLoading={loading} />
        </div>
        
        {/* Actividades Pendientes (Simple List) */}
        <div className="card-institucional flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-warning-500" />
            <h3 className="font-semibold text-lg text-text-primary">Próximos Cierres</h3>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            {[
              { title: "Evaluación Técnica - Módulo 2", date: "Hoy, 23:59", ficha: "Ficha 2987654" },
              { title: "Entrega Proyecto Final", date: "Mañana, 23:59", ficha: "Ficha 3100222" },
              { title: "Registro de Asistencias Semanal", date: "Viernes, 18:00", ficha: "Todas las Fichas" }
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
