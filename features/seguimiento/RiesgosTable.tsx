"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, AlertTriangle, Pencil, Trash2, Download } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { formatDateShort } from "@/lib/utils";
import { deleteRiesgo, exportRiesgosCSV } from "@/actions/riesgos.actions";
import { RiesgoFormDialog } from "./RiesgoFormDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RiesgosTableProps {
  initialData: any;
  aprendices: { id: string; nombres: string; apellidos: string; numeroDocumento: string; ficha: { codigo: string } }[];
}

export function RiesgosTable({ initialData, aprendices }: RiesgosTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRiesgo, setSelectedRiesgo] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const alertas = initialData?.data || [];
  const alertasAltas = alertas.filter((a: any) => a.nivel === "ALTO" && !a.gestionada).length;

  const handleEdit = (riesgo: any) => {
    setSelectedRiesgo(riesgo);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedRiesgo(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta alerta de riesgo?")) return;
    
    setLoading(true);
    try {
      const res = await deleteRiesgo(id);
      if (res.error) throw new Error(res.error);
      toast.success("Alerta eliminada correctamente");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportRiesgosCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "riesgos_export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Listado exportado correctamente");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setExporting(false);
    }
  };

  const columnas: ColumnaDef<any>[] = [
    {
      key: "aprendiz",
      header: "Aprendiz",
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{a.aprendiz.nombres} {a.aprendiz.apellidos}</span>
          <span className="text-xs text-text-secondary">{a.aprendiz.numeroDocumento}</span>
        </div>
      )
    },
    {
      key: "ficha",
      header: "Ficha",
      render: (a) => <span className="font-medium text-sm">{a.aprendiz.ficha?.codigo || "-"}</span>
    },
    {
      key: "motivo",
      header: "Motivo / Tipo",
      render: (a) => (
        <div className="flex flex-col max-w-xs">
          <span className="text-xs font-semibold text-text-secondary uppercase">{a.tipo}</span>
          <span className="text-sm line-clamp-2" title={a.descripcion}>{a.descripcion}</span>
        </div>
      )
    },
    {
      key: "nivel",
      header: "Nivel de Riesgo",
      align: "center",
      render: (a) => <RiskBadge nivel={a.nivel.toLowerCase()} />
    },
    {
      key: "estado",
      header: "Estado",
      render: (a) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
          ${!a.gestionada ? 'bg-danger-50 text-danger-700' : 'bg-success-50 text-success-700'}`}
        >
          {!a.gestionada ? "No Gestionada" : "Gestionada"}
        </span>
      )
    },
    {
      key: "fechaDeteccion",
      header: "Detectado",
      render: (a) => <span className="text-sm">{formatDateShort(a.fechaDeteccion)}</span>
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (a) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(a)}>
            <Pencil size={16} className="text-text-secondary" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <Input 
              placeholder="Buscar alertas por aprendiz o motivo..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-surface pl-9"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-surface" onClick={handleExport} disabled={exporting}>
            <Download size={16} className="mr-2" /> {exporting ? "Exportando..." : "Reporte"}
          </Button>
          <Button onClick={handleCreate}>
            <Plus size={16} className="mr-2" /> Reportar Riesgo
          </Button>
        </div>
      </div>

      {alertasAltas > 0 && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex items-start gap-3 mb-4">
          <AlertTriangle className="text-danger-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-semibold text-danger-800">Atención Requerida</h4>
            <p className="text-sm text-danger-700 mt-1">Hay {alertasAltas} aprendices en riesgo inminente de deserción que requieren intervención inmediata.</p>
          </div>
        </div>
      )}

      <DataTable data={alertas} columnas={columnas} isLoading={loading} />

      {dialogOpen && (
        <RiesgoFormDialog 
          riesgo={selectedRiesgo}
          aprendices={aprendices}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
