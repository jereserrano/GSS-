"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Users, AlertTriangle, CalendarCheck, ClipboardList, 
  Download, FileText, TrendingUp, Shield 
} from "lucide-react";
import { 
  generarReporteAprendicesCSV, 
  generarReporteRiesgosCSV,
  generarReporteAsistenciaCSV,
  generarReporteEvaluacionesCSV
} from "@/actions/reportes.actions";
import { toast } from "sonner";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable } from "@/components/shared/DataTable";

interface ReportesPageClientProps {
  resumen: {
    totalAprendices: number;
    alertasActivas: number;
    totalAsistencias: number;
    totalEvaluaciones: number;
  } | null;
  listados: {
    aprendices: any[];
    alertas: any[];
    asistencias: any[];
  };
}

const REPORTES = [
  {
    id: "aprendices",
    titulo: "Listado de Aprendices",
    descripcion: "Todos los aprendices registrados con su estado, nivel de riesgo y porcentaje de asistencia por ficha e institución.",
    icono: Users,
    color: "text-sena-600",
    bg: "bg-sena-50",
    accion: generarReporteAprendicesCSV,
    filename: "reporte_aprendices.csv",
  },
  {
    id: "riesgos",
    titulo: "Alertas de Riesgo",
    descripcion: "Todas las alertas tempranas registradas (deserción, inasistencia, bajo rendimiento), incluyendo su estado de gestión.",
    icono: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    accion: generarReporteRiesgosCSV,
    filename: "reporte_alertas_riesgo.csv",
  },
  {
    id: "asistencia",
    titulo: "Registro de Asistencias",
    descripcion: "Consolidado de todas las sesiones de asistencia por ficha, instructor y fecha.",
    icono: CalendarCheck,
    color: "text-green-600",
    bg: "bg-green-50",
    accion: generarReporteAsistenciaCSV,
    filename: "reporte_asistencia.csv",
  },
  {
    id: "evaluaciones",
    titulo: "Reporte de Evaluaciones",
    descripcion: "Juicios valorativos de todos los aprendices por resultado de aprendizaje.",
    icono: Shield,
    color: "text-purple-600",
    bg: "bg-purple-50",
    accion: generarReporteEvaluacionesCSV,
    filename: "reporte_evaluaciones.csv",
  },
];

export function ReportesPageClient({ resumen, listados }: ReportesPageClientProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDescargar = async (reporte: typeof REPORTES[number]) => {
    setLoadingId(reporte.id);
    try {
      const result = await reporte.accion();
      if (!result.success || !result.csv) throw new Error(result.error || "Error generando reporte");

      // Crear y descargar el archivo CSV
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = reporte.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Reporte "${reporte.titulo}" descargado correctamente`);
    } catch (err: any) {
      toast.error(err.message || "Error al generar el reporte");
    } finally {
      setLoadingId(null);
    }
  };

  const stats = [
    { label: "Total Aprendices", valor: resumen?.totalAprendices ?? "—", icono: Users, color: "text-sena-600" },
    { label: "Alertas Sin Gestionar", valor: resumen?.alertasActivas ?? "—", icono: AlertTriangle, color: "text-red-600" },
    { label: "Registros Asistencia", valor: resumen?.totalAsistencias ?? "—", icono: CalendarCheck, color: "text-green-600" },
    { label: "Evaluaciones Registradas", valor: resumen?.totalEvaluaciones ?? "—", icono: ClipboardList, color: "text-blue-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="card-institucional p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-slate-50`}>
              <s.icono size={22} className={s.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{s.valor.toLocaleString?.("es-CO") ?? s.valor}</p>
              <p className="text-xs text-text-secondary">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reportes */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-sena-600" />
          Reportes Disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REPORTES.map((r) => (
            <div key={r.id} className="card-institucional flex flex-col gap-4 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${r.bg}`}>
                  <r.icono size={22} className={r.color} />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{r.titulo}</h3>
                  <span className="text-[11px] text-text-secondary font-mono bg-slate-100 px-1.5 py-0.5 rounded">CSV</span>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed flex-1">{r.descripcion}</p>
              <Button
                onClick={() => handleDescargar(r)}
                disabled={loadingId === r.id}
                className="w-full"
                variant="outline"
              >
                {loadingId === r.id ? (
                  "Generando..."
                ) : (
                  <>
                    <Download size={15} className="mr-2" /> Descargar CSV
                  </>
                )}
              </Button>
            </div>
          ))}


        </div>
      </div>

      <div className="pt-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Vista Previa de Listados</h2>
        <Tabs defaultValue="aprendices" className="w-full bg-white rounded-xl border border-slate-200 p-4">
          <TabsList className="mb-4">
            <TabsTrigger value="aprendices">Aprendices</TabsTrigger>
            <TabsTrigger value="alertas">Alertas de Riesgo</TabsTrigger>
            <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
          </TabsList>
          <TabsContent value="aprendices">
            <DataTable 
              data={listados.aprendices} 
              columnas={[
                { key: "numeroDocumento", header: "Documento" },
                { key: "nombres", header: "Nombres" },
                { key: "apellidos", header: "Apellidos" },
                { key: "ficha", header: "Ficha", render: (item) => item.ficha?.codigo || "N/A" },
                { key: "institucion", header: "Institución", render: (item) => item.ficha?.institucion?.nombre || "N/A" },
                { key: "estado", header: "Estado" },
                { key: "riesgo", header: "Riesgo", render: (item) => item.nivelRiesgo }
              ]} 
            />
          </TabsContent>
          <TabsContent value="alertas">
            <DataTable 
              data={listados.alertas} 
              columnas={[
                { key: "fecha", header: "Fecha", render: (item) => new Date(item.fechaDeteccion).toLocaleDateString("es-CO") },
                { key: "aprendiz", header: "Aprendiz", render: (item) => `${item.aprendiz?.nombres} ${item.aprendiz?.apellidos}` },
                { key: "motivo", header: "Motivo", render: (item) => item.motivo },
                { key: "nivel", header: "Nivel" },
                { key: "estado", header: "Estado", render: (item) => item.gestionada ? "Gestionada" : "Pendiente" }
              ]} 
            />
          </TabsContent>
          <TabsContent value="asistencia">
            <DataTable 
              data={listados.asistencias} 
              columnas={[
                { key: "fecha", header: "Fecha", render: (item) => new Date(item.fecha).toLocaleDateString("es-CO") },
                { key: "ficha", header: "Ficha", render: (item) => item.ficha?.codigo || "N/A" },
                { key: "sesionId", header: "ID Sesión", render: (item) => item.id.substring(0,8) }
              ]} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
