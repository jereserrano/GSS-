import React from "react";
import { KpiCard } from "@/features/dashboard/KpiCard";
import { RiskTable } from "@/features/dashboard/RiskTable";
import { TrendChart, DistributionChart } from "@/features/dashboard/Charts";
import { getDashboardKpis } from "@/actions/dashboard.actions";
import type { KpiData } from "@/types/common.types";
import { Clock, BookCheck, FileSignature, CheckCircle2, AlertCircle, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const result = await getDashboardKpis();

  const dashboardData = result.ok && result.data ? result.data : null;
  const kpisData = dashboardData?.kpis ?? null;
  const aprendicesRiesgo = dashboardData?.aprendicesRiesgo ?? [];
  const proximosCierres = dashboardData?.proximosCierres ?? [];
  const labels = (dashboardData as any)?.labels;
  const userRole = (result.ok ? (result as any).rol : "ADMINISTRADOR").toUpperCase();

  const isAprendiz = userRole === "APRENDIZ" || userRole.includes("APRENDIZ");
  const isInstructor = userRole === "INSTRUCTOR" || userRole.includes("INSTRUCT");

  // Definir las 4 métricas adaptadas para responder preguntas pedagógicas concretas
  const kpis: KpiData[] = [
    {
      titulo: labels?.kpi1?.title ?? (isAprendiz ? "Actividades Asignadas" : "Total Aprendices"),
      valor: kpisData ? kpisData.totalAprendices.toLocaleString("es-CO") : "0",
      subtitulo: labels?.kpi1?.sub ?? (isAprendiz ? "¿Cuántas actividades tengo?" : "¿A cuántos aprendices acompaño?"),
      icono: isAprendiz ? "BookCheck" : "Users",
      color: "bg-[#39A900]",
    },
    {
      titulo: labels?.kpi2?.title ?? (isAprendiz ? "Entregas Realizadas" : "Mis Fichas / Grupos"),
      valor: kpisData ? kpisData.totalInstituciones.toString() : "0",
      subtitulo: labels?.kpi2?.sub ?? (isAprendiz ? "¿Cuántas evidencias he enviado?" : "¿En cuántos grupos oriento formación?"),
      icono: isAprendiz ? "FileSignature" : (isInstructor ? "Target" : "Building2"),
      color: "bg-[#39A900]",
    },
    {
      titulo: labels?.kpi3?.title ?? (isAprendiz ? "Evidencias Aprobadas" : "Actividades en Curso"),
      valor: kpisData ? kpisData.totalFichas.toString() : "0",
      subtitulo: labels?.kpi3?.sub ?? (isAprendiz ? "Resultados de aprendizaje cumplidos" : "Guías y talleres activos"),
      icono: isAprendiz ? "CheckCheck" : "Target",
      color: "bg-[#39A900]",
    },
    {
      titulo: labels?.kpi4?.title ?? (isAprendiz ? "Promedio Asistencia" : "Asistencia Global"),
      valor: kpisData ? `${kpisData.asistenciaPromedio}%` : "100%",
      subtitulo: labels?.kpi4?.sub ?? (isAprendiz ? "Mi asistencia a sesiones" : "Promedio general registrado"),
      icono: "TrendingUp",
      color: "bg-[#39A900]",
    },
  ];

  const pageTitle = isAprendiz 
    ? "Mi Espacio Formativo" 
    : (isInstructor ? "Panel de Gestión Académica" : "Panel de Gestión y Articulación");

  const pageSubtitle = isAprendiz
    ? "Consulta tu progreso en el programa de formación, actividades pendientes y estado de evidencias."
    : (isInstructor 
      ? "Seguimiento integral a fichas de la media técnica, revisión de evidencias y juicios evaluativos."
      : "Monitoreo global del proceso de integración con las instituciones de educación media.");

  return (
    <div className="page-container space-y-6 page-enter pb-10">
      
      {/* Encabezado del Dashboard */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f0fdf4] text-[#267000] border border-[#bbf7d0] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39A900]"></span>
            <span>{isAprendiz ? "Rol Aprendiz" : isInstructor ? "Rol Instructor" : "Administración"}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{pageTitle}</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">{pageSubtitle}</p>
        </div>

        {/* Acceso Rápido Contextual */}
        <div className="flex items-center gap-2">
          {isAprendiz ? (
            <Link
              href="/actividades"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#39A900] hover:bg-[#319200] text-white px-3.5 py-2 rounded-lg shadow-xs transition-colors"
            >
              <span>Ver Mis Actividades</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <Link
              href="/entregas"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#39A900] hover:bg-[#319200] text-white px-3.5 py-2 rounded-lg shadow-xs transition-colors"
            >
              <span>Revisar Entregas</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards: Respondiendo preguntas concretas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <KpiCard key={idx} kpi={kpi} />
        ))}
      </div>

      {/* Gráficos de Gestión Formativa (Solo para Instructor y Admin) */}
      {!isAprendiz && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TrendChart />
          <DistributionChart />
        </div>
      )}

      {/* Vistas Inferiores Específicas por Rol */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {!isAprendiz ? (
            <RiskTable aprendices={aprendicesRiesgo} isLoading={false} />
          ) : (
            /* Tarjeta de Ruta Pedagógica del Aprendiz */
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-2 rounded-lg bg-[#f0fdf4] text-[#267000] border border-[#bbf7d0]">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-slate-900">Ruta de Formación y Juicios Evaluativos</h2>
                    <p className="text-xs text-slate-500">Acompañamiento del proceso de articulación con la Media Técnica</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#f0fdf4] text-[#267000] border border-[#bbf7d0] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={14} />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-800">1. Consulta de Guías y Actividades</h3>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Revisa detalladamente los resultados de aprendizaje, instrucciones y evidencias requeridas por tu instructor.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={14} />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-800">2. Envío Oportuno de Evidencias</h3>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Adjunta tus enlaces de trabajo u observaciones antes de la fecha límite estipulada para evitar alertas de retraso.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-50 text-[#267000] border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                      <BookCheck size={14} />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-800">3. Retroalimentación y Aprobación</h3>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Recibe la evaluación del instructor. Una vez revisada, tu evidencia quedará marcada como aprobada en el sistema.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">¿Tienes dudas sobre una actividad?</span>
                <Link href="/notificaciones" className="text-[#267000] hover:underline font-semibold">
                  Contactar por notificaciones
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Próximos Cierres de Evidencias */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Clock size={18} className="text-amber-600" />
            <div>
              <h2 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Próximos Vencimientos</h2>
              <p className="text-[11px] text-slate-500">Fechas límite de actividades</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2.5">
            {proximosCierres.length > 0 ? (
              proximosCierres.map((act: any) => (
                <div key={act.id} className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-100/60 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs text-slate-900 truncate">{act.title}</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">{act.ficha} • Vence: {act.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-xs text-slate-400">
                <Clock size={28} className="text-slate-300 mb-2 stroke-[1.5]" />
                <p className="font-medium text-slate-600">No hay vencimientos próximos</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Todas tus actividades están al día</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
