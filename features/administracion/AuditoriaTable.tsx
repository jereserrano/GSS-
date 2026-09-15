"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import type { ColumnaDef } from "@/types/common.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Shield, User, Activity, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { exportAuditoriaCSV } from "@/actions/reportes.actions";
import { toast } from "sonner";

interface AuditoriaTableProps {
  initialData: any;
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
  EDITAR: <span className="text-blue-600 font-bold">✎</span>,
  ELIMINAR: <span className="text-red-600 font-bold">✕</span>,
  LOGIN: <span className="text-purple-600 font-bold">→</span>,
};

export function AuditoriaTable({ initialData }: AuditoriaTableProps) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [exporting, setExporting] = useState(false);
  const logs = initialData?.data || [];

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportAuditoriaCSV();
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
      header: "Módulo",
      render: (log) => (
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${MODULO_COLORS[log.modulo] || "bg-slate-100 text-slate-700"}`}>
          {log.modulo}
        </span>
      ),
    },
    {
      key: "detalle",
      header: "Detalle",
      render: (log) => (
        <span className="text-sm text-text-secondary truncate max-w-xs block">{log.detalle}</span>
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
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex items-center gap-2 max-w-lg flex-1">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <Input
              placeholder="Buscar por módulo o usuario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-surface pl-9"
            />
          </div>
          <Button variant="secondary" onClick={() => router.push(`?busqueda=${busqueda}`)}>
            Buscar
          </Button>
        </div>
        <Button variant="outline" className="bg-surface" onClick={handleExport} disabled={exporting}>
          <Download size={16} className="mr-2" /> {exporting ? "Exportando..." : "Exportar"}
        </Button>
      </div>

      <DataTable data={logs} columnas={columnas} isLoading={false} />

      {initialData && initialData.total === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-text-secondary gap-3">
          <Shield size={40} className="opacity-30" />
          <p className="text-sm">No hay eventos de auditoría registrados aún.</p>
          <p className="text-xs opacity-70">Los eventos se registran automáticamente cuando se realizan cambios críticos.</p>
        </div>
      )}
    </div>
  );
}
