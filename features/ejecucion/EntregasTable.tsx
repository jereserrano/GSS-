"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Download, Pencil, Trash2 } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { formatDateShort } from "@/lib/utils";
import { deleteEntrega, exportEntregasCSV } from "@/actions/entregas.actions";
import { EntregaFormDialog } from "./EntregaFormDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EntregasTableProps {
  initialData: any;
  actividades: { id: string; nombre: string }[];
  aprendices: { id: string; nombres: string; apellidos: string; numeroDocumento: string }[];
}

export function EntregasTable({ initialData, actividades, aprendices }: EntregasTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const entregas = initialData?.data || [];

  const handleEdit = (entrega: any) => {
    setSelectedEntrega(entrega);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedEntrega(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta entrega?")) return;
    
    setLoading(true);
    try {
      const res = await deleteEntrega(id);
      if (res.error) throw new Error(res.error);
      toast.success("Entrega eliminada correctamente");
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
      const result = await exportEntregasCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "entregas_export.csv";
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
      render: (e) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{e.aprendiz.nombres} {e.aprendiz.apellidos}</span>
          <span className="text-xs text-text-secondary">{e.aprendiz.numeroDocumento}</span>
        </div>
      )
    },
    {
      key: "actividad",
      header: "Actividad",
      render: (e) => (
        <div className="flex flex-col max-w-xs">
          <span className="text-sm font-medium line-clamp-1" title={e.actividad.nombre}>{e.actividad.nombre}</span>
          <span className="text-xs text-text-secondary">Vence: {formatDateShort(e.actividad.fechaFin)}</span>
        </div>
      )
    },
    {
      key: "fechaEntrega",
      header: "Fecha de Entrega",
      render: (e) => <span className="text-sm">{e.fechaEntrega ? formatDateShort(e.fechaEntrega) : "No entregado"}</span>
    },
    {
      key: "estado",
      header: "Estado",
      render: (e) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
          ${e.estado === 'CALIFICADO' ? 'bg-success-50 text-success-700' : 
            e.estado === 'PENDIENTE' ? 'bg-warning-50 text-warning-700' : 
            e.estado === 'ENTREGADO' ? 'bg-info-50 text-info-700' :
            'bg-danger-50 text-danger-700'}`}
        >
          {e.estado.toLowerCase()}
        </span>
      )
    },
    {
      key: "calificacion",
      header: "Calificación",
      align: "center",
      render: (e) => {
        const cal = e.calificacion ? Number(e.calificacion) : null;
        let colorClass = "text-slate-400";
        if (cal !== null) {
          colorClass = cal >= 3.5 ? "text-success-600" : "text-danger-600";
        }
        return (
          <span className={`font-bold ${colorClass}`}>
            {cal !== null ? cal.toFixed(1) : "—"}
          </span>
        );
      }
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (e) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(e)}>
            <Pencil size={16} className="text-text-secondary" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <Input 
              placeholder="Buscar por aprendiz o actividad..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-surface pl-9"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-surface" onClick={handleExport} disabled={exporting}>
            <Download size={16} className="mr-2" /> {exporting ? "Exportando..." : "Exportar"}
          </Button>
          <Button onClick={handleCreate}>
            <Plus size={16} className="mr-2" /> Registrar Entrega
          </Button>
        </div>
      </div>

      <DataTable 
        data={entregas} 
        columnas={columnas} 
        isLoading={loading} 
      />

      {dialogOpen && (
        <EntregaFormDialog 
          entrega={selectedEntrega}
          actividades={actividades}
          aprendices={aprendices}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
