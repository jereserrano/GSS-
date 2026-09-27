"use client";

import React from "react";
import { RiskMatrix } from "./RiskMatrix";
import { Loader2, AlertCircle, Users, FileCheck2, Target } from "lucide-react";
import { CompetenceRadarChart, DrillDownBarChart } from "./AcademicCoreCharts";
import { StackedDeliveryChart, DeliveryHeatmap } from "./TrackingCharts";

// Componente simple para el Gráfico de Anillo de Progreso
const ProgressCircle = ({ progress }: { progress: number }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center">
      <svg className="transform -rotate-90 w-32 h-32">
        <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="14" fill="transparent" className="text-slate-200/50" />
        <circle 
          cx="64" cy="64" r={radius} 
          stroke="currentColor" strokeWidth="14" fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round"
          className="text-[#39A900] transition-all duration-1000 ease-out" 
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-[#00304D]">
        <span className="text-2xl font-bold">{progress}%</span>
      </div>
    </div>
  );
};

interface AcademicDashboardLayoutProps {
  loading: boolean;
  data: any;
  children: React.ReactNode; // Selectors
}

export function AcademicDashboardLayout({ loading, data, children }: AcademicDashboardLayoutProps) {
  if (loading && !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00304D]" />
      </div>
    );
  }

  if (!data) return <div className="p-4 text-red-500">Error cargando el dashboard académico.</div>;

  const dashboard = data.dashboard || {};
  const kpis = data.kpis || {};

  return (
    <div className="space-y-6">
      
      {/* -------------------------------------------------------------
          FILTROS GLOBALES PERMANENTES (Glassmorphism)
      ------------------------------------------------------------- */}
      <div className="bg-white/60 backdrop-blur-md border border-white/80 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#00304D]" />
          <div>
            <h2 className="text-sm font-bold text-[#00304D]">Filtro Académico Avanzado</h2>
            <p className="text-xs text-[#00304D]/70">Navega y segmenta los datos de formación</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          {children}
        </div>
      </div>

      {/* -------------------------------------------------------------
          NIVEL 1: EL PANORAMA GENERAL
      ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* KPI Cards (Glassmorphism) ocupan 3 columnas */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-semibold text-[#00304D]/70">Total Aprendices</h3>
              <Users className="h-5 w-5 text-[#39A900]" />
            </div>
            <div className="text-3xl font-extrabold text-[#00304D]">{kpis.totalAprendices || 0}</div>
            <p className="text-xs text-[#00304D]/60 mt-1">En formación activa</p>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-semibold text-[#00304D]/70">Por Calificar / Pendientes</h3>
              <FileCheck2 className="h-5 w-5 text-[#f59e0b]" />
            </div>
            <div className="text-3xl font-extrabold text-[#00304D]">{kpis.actividadesPendientes || 0}</div>
            <p className="text-xs text-[#00304D]/60 mt-1">Actividades de la selección</p>
          </div>

          <div className={`backdrop-blur-md rounded-2xl p-5 shadow-sm flex flex-col justify-center border ${kpis.aprendicesRiesgoAlto > 0 ? 'bg-red-50/80 border-red-200' : 'bg-white/60 border-white/80'}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className={`text-sm font-semibold ${kpis.aprendicesRiesgoAlto > 0 ? 'text-red-700' : 'text-[#00304D]/70'}`}>
                Riesgo Alto (Deserción)
              </h3>
              <AlertCircle className={`h-5 w-5 ${kpis.aprendicesRiesgoAlto > 0 ? 'text-red-600' : 'text-[#007832]'}`} />
            </div>
            <div className={`text-3xl font-extrabold ${kpis.aprendicesRiesgoAlto > 0 ? 'text-red-700' : 'text-[#00304D]'}`}>
              {kpis.aprendicesRiesgoAlto || 0}
            </div>
            {kpis.aprendicesRiesgoAlto > 0 && (
              <p className="text-xs text-red-600 mt-1 font-medium">Requieren intervención</p>
            )}
          </div>
        </div>

        {/* Gráfico de Progreso Anillo ocupa 1 columna */}
        <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-[#00304D] mb-2 w-full text-center">Progreso de Formación</h3>
          <ProgressCircle progress={dashboard.progreso || 0} />
          <p className="text-xs text-[#00304D]/60 mt-2 text-center">Rendimiento ponderado</p>
        </div>
      </div>

      {/* -------------------------------------------------------------
          NIVEL 2: EL NÚCLEO ACADÉMICO
      ------------------------------------------------------------- */}
      {(dashboard.competencias && dashboard.competencias.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <CompetenceRadarChart competencias={dashboard.competencias} />
          <DrillDownBarChart 
            competencias={dashboard.competencias} 
            resultadosAprendizaje={dashboard.resultadosAprendizaje || []} 
          />
        </div>
      )}

      {/* -------------------------------------------------------------
          NIVEL 3: SEGUIMIENTO DE ACTIVIDADES Y ENTREGAS
      ------------------------------------------------------------- */}
      {(dashboard.entregasSemanales && dashboard.heatmap) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <StackedDeliveryChart data={dashboard.entregasSemanales} />
          <DeliveryHeatmap data={dashboard.heatmap} />
        </div>
      )}

      {/* -------------------------------------------------------------
          GRÁFICAS DE RIESGO E HISTÓRICAS
      ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        {data.riskData && data.riskData.length > 0 ? (
          <RiskMatrix data={data.riskData} fichas={data.fichas || []} />
        ) : (
          <div className="text-center p-8 text-[#00304D]/60 bg-white/40 rounded-xl border border-white/80 backdrop-blur-md shadow-sm">
            No hay datos suficientes para graficar la Matriz de Riesgos.
          </div>
        )}
      </div>

    </div>
  );
}
