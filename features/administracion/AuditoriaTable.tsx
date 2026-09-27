"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import type { ColumnaDef } from "@/types/common.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Shield, User, Activity, Download, XCircle } from "lucide-react";
import { exportAuditoriaCSV } from "@/actions/reportes.actions";
import { toast } from "sonner";

/**
 * Función helper para formatear JSON como string o el texto plano
 */
function formatDetalle(detalle: string | null | undefined): string {
  if (!detalle) return "—";
  try {
    const parsed = JSON.parse(detalle);
    return typeof parsed === "object" ? "Ver detalle avanzado" : String(parsed);
  } catch {
    return detalle;
  }
}

const MODULO_COLORS: Record<string, string> = {
  INSTITUCIONES: "bg-blue-100 text-blue-700",
  APRENDICES: "bg-green-100 text-green-700",
  EVALUACIONES: "bg-purple-100 text-purple-700",
  FICHAS: "bg-yellow-100 text-yellow-700",
  INSTRUCTORES: "bg-orange-100 text-orange-700",
  RIESGOS: "bg-red-100 text-red-700",
  SISTEMA: "bg-slate-100 text-slate-700",
};

const ACCION_ICONS: Record<string, React.ReactNode> = {
  CREAR: <span className="text-green-600 font-bold">+</span>,
  ACTUALIZAR: <span className="text-blue-600 font-bold">✎</span>,
  EDITAR: <span className="text-blue-600 font-bold">✎</span>,
  ELIMINAR: <span className="text-red-600 font-bold">✕</span>,
  LOGIN: <span className="text-purple-600 font-bold">→</span>,
};

export function AuditoriaTable({ initialData }: { initialData: any }) {
  const [busqueda, setBusqueda] = useState("");
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFechas, setExportFechas] = useState({ inicio: "", fin: "" });
  const [selectedLog, setSelectedLog] = useState<any>(null);
  
  const logs = initialData?.data || [];

  const filteredLogs = React.useMemo(() => {
    if (!busqueda.trim()) return logs;
    const lower = busqueda.toLowerCase();
    return logs.filter((log: any) => 
      log.modulo?.toLowerCase().includes(lower) ||
      log.user?.nombre?.toLowerCase().includes(lower) ||
      log.user?.email?.toLowerCase().includes(lower) ||
      log.accion?.toLowerCase().includes(lower) ||
      log.detalle?.toLowerCase().includes(lower) ||
      log.entidad?.toLowerCase().includes(lower)
    );
  }, [busqueda, logs]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const filtros = {
        fechaInicio: exportFechas.inicio || undefined,
        fechaFin: exportFechas.fin || undefined
      };
      const result = await exportAuditoriaCSV(filtros);
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "auditoria_export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Reporte exportado correctamente");
      setShowExportModal(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setExporting(false);
    }
  };

  const columnas: ColumnaDef<any>[] = [
    {
      key: "accion",
      header: "Acción",
      render: (log) => (
        <div className="flex items-center gap-2">
          <span>{ACCION_ICONS[log.accion] ?? <Activity size={14} />}</span>
          <span className="font-mono text-sm font-medium">{log.accion}</span>
        </div>
      ),
    },
    {
      key: "modulo",
      header: "Módulo / Entidad",
      render: (log) => (
        <div className="flex flex-col items-start gap-1">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${MODULO_COLORS[log.modulo] || "bg-slate-100 text-slate-700"}`}>
            {log.modulo}
          </span>
          {log.entidad && <span className="text-[10px] text-gray-500 font-mono">{log.entidad}</span>}
        </div>
      ),
    },
    {
      key: "detalle",
      header: "Detalle",
      render: (log) => (
        <span
          className="text-sm text-text-secondary truncate max-w-[100px] md:max-w-[120px] lg:max-w-[200px] block cursor-pointer hover:text-blue-600 hover:underline"
          title={log.detalle ?? ""}
          onClick={() => setSelectedLog(log)}
        >
          {formatDetalle(log.detalle)}
        </span>
      ),
    },
    {
      key: "usuario",
      header: "Usuario",
      render: (log) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-sena-100 flex items-center justify-center shrink-0">
            <User size={13} className="text-sena-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{log.user?.nombre || "Sistema"}</span>
            <span className="text-[11px] text-text-secondary">{log.user?.email || "—"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "fecha",
      header: "Fecha / Hora",
      render: (log) => (
        <div className="flex flex-col">
          <span className="text-sm">{new Date(log.fecha).toLocaleDateString("es-CO")}</span>
          <span className="text-xs text-text-secondary">{new Date(log.fecha).toLocaleTimeString("es-CO")}</span>
        </div>
      ),
    },
    {
      key: "acciones",
      header: "Ver Diff",
      render: (log) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedLog(log)}>Inspeccionar</Button>
      )
    }
  ];

  return (
    <div className="space-y-4 relative">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <Input
              placeholder="Buscar por módulo o usuario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-surface pl-9"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-surface" onClick={() => setShowExportModal(true)}>
            <Download size={16} className="mr-2" /> Exportar
          </Button>
        </div>
      </div>

      <DataTable data={filteredLogs} columnas={columnas} isLoading={false} />

      {initialData && initialData.total === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-text-secondary gap-3">
          <Shield size={40} className="opacity-30" />
          <p className="text-sm">No hay eventos de auditoría registrados aún.</p>
          <p className="text-xs opacity-70">Los eventos se registran automáticamente cuando se realizan cambios críticos.</p>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col relative overflow-hidden">
            <h3 className="font-bold text-[#00304D] text-lg mb-4 flex items-center gap-2">
              <Download className="h-5 w-5" /> Exportar Auditoría
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Inicio (opcional)</label>
                <Input 
                  type="date" 
                  value={exportFechas.inicio} 
                  onChange={e => setExportFechas(p => ({ ...p, inicio: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Fin (opcional)</label>
                <Input 
                  type="date" 
                  value={exportFechas.fin} 
                  onChange={e => setExportFechas(p => ({ ...p, fin: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowExportModal(false)} disabled={exporting}>Cancelar</Button>
              <Button className="bg-[#00304D] hover:bg-[#00304D]/90" onClick={handleExport} disabled={exporting}>
                {exporting ? "Generando..." : "Descargar CSV"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Diff Viewer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 sm:p-8 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#00304D] text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" /> 
                  Inspección Forense - {selectedLog.accion}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Módulo: <span className="font-semibold">{selectedLog.modulo}</span> | 
                  Entidad: <span className="font-semibold">{selectedLog.entidad || "N/A"}</span> | 
                  ID: <span className="font-mono text-gray-400">{selectedLog.entidadId || "N/A"}</span>
                </p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
              {/* Meta Info */}
              <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between text-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Autor del Cambio</p>
                  <p className="font-medium text-[#00304D]">{selectedLog.user?.nombre || "Sistema"}</p>
                  <p className="text-xs text-gray-500">{selectedLog.user?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Fecha y Hora</p>
                  <p className="font-medium text-[#00304D]">{new Date(selectedLog.fecha).toLocaleString("es-CO")}</p>
                  <p className="text-xs text-gray-500 font-mono">IP: {selectedLog.ip || "Local"}</p>
                </div>
              </div>

              {/* Detalle Normal */}
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Mensaje / Detalle</p>
                <p className="text-sm text-gray-700">{selectedLog.detalle}</p>
              </div>

              {/* Diff Viewer (JSON Compare) */}
              {(selectedLog.valoresAnteriores || selectedLog.valoresNuevos) && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Comparación de Datos (Diff)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Anteriores (Rojo) */}
                    <div className="bg-[#ffebe9] border border-[#ff8182] rounded-lg overflow-hidden flex flex-col h-[300px]">
                      <div className="bg-[#ff8182]/20 px-3 py-1.5 text-xs font-bold text-red-900 border-b border-[#ff8182]">
                        Estado Anterior
                      </div>
                      <pre className="p-3 text-[11px] overflow-auto flex-1 font-mono text-red-900 leading-relaxed">
                        {selectedLog.valoresAnteriores ? JSON.stringify(selectedLog.valoresAnteriores, null, 2) : "N/A (Creación o sin datos previos)"}
                      </pre>
                    </div>

                    {/* Nuevos (Verde) */}
                    <div className="bg-[#e6ffed] border border-[#2ea043] rounded-lg overflow-hidden flex flex-col h-[300px]">
                      <div className="bg-[#2ea043]/20 px-3 py-1.5 text-xs font-bold text-green-900 border-b border-[#2ea043]">
                        Estado Nuevo / Actual
                      </div>
                      <pre className="p-3 text-[11px] overflow-auto flex-1 font-mono text-green-900 leading-relaxed">
                        {selectedLog.valoresNuevos ? JSON.stringify(selectedLog.valoresNuevos, null, 2) : "N/A (Eliminación o sin datos nuevos)"}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-white text-right">
              <Button onClick={() => setSelectedLog(null)} variant="default" className="bg-[#00304D] hover:bg-[#00304D]/90">
                Cerrar Inspección
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
