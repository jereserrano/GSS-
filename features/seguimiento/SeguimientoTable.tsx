"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Download, Pencil, Trash2 } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { formatDateShort } from "@/lib/utils";
import { deleteSeguimiento, exportSeguimientosCSV } from "@/actions/seguimientos.actions";
import { SeguimientoFormDialog } from "./SeguimientoFormDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SeguimientoTableProps {
  initialData: any;
  instituciones: { id: string; nombre: string }[];
}

export function SeguimientoTable({ initialData, instituciones }: SeguimientoTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSeguimiento, setSelectedSeguimiento] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const visitas = initialData?.data || [];

  const handleEdit = (s: any) => { setSelectedSeguimiento(s); setDialogOpen(true); };
  const handleCreate = () => { setSelectedSeguimiento(null); setDialogOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta visita de seguimiento?")) return;
    setLoading(true);
    try {
      const res = await deleteSeguimiento(id);
      if (res.error) throw new Error(res.error);
      toast.success("Visita eliminada correctamente");
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
      const result = await exportSeguimientosCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "seguimientos_export.csv";
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
      key: "institucion",
      header: "Institución Educativa",
      render: (v) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{v.institucionNombre}</span>
        </div>
      )
    },
    {
      key: "fecha",
      header: "Fecha de Visita",
      render: (v) => <span className="text-sm font-medium">{formatDateShort(v.fecha)}</span>
    },
    {
      key: "responsable",
      header: "Responsable",
      render: (v) => <span className="text-sm">{v.responsable}</span>
    },
    {
      key: "novedades",
      header: "Novedades",
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${v.novedades ? 'bg-warning-100 text-warning-700' : 'bg-slate-100 text-slate-500'}`}>
          {v.novedades ? "Con novedades" : "Sin novedades"}
        </span>
      )
    },
    {
      key: "estado",
      header: "Estado",
      render: (v) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
          ${v.estado === 'REALIZADA' ? 'bg-success-50 text-success-700' :
            v.estado === 'PROGRAMADA' ? 'bg-info-50 text-info-700' :
            v.estado === 'APLAZADA' ? 'bg-warning-50 text-warning-700' :
            'bg-slate-100 text-slate-600'}`}
        >
          {v.estado.toLowerCase()}
        </span>
      )
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (v) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(v)}>
            <Pencil size={16} className="text-text-secondary" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)}>
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
            <Input placeholder="Buscar por institución..." value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)} className="bg-surface pl-9" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-surface" onClick={handleExport} disabled={exporting}>
            <Download size={16} className="mr-2" /> {exporting ? "Exportando..." : "Reporte"}
          </Button>
          <Button onClick={handleCreate}>
            <Plus size={16} className="mr-2" /> Programar Visita
          </Button>
        </div>
      </div>

      <DataTable data={visitas} columnas={columnas} isLoading={loading} />

      {dialogOpen && (
        <SeguimientoFormDialog
          seguimiento={selectedSeguimiento}
          instituciones={instituciones}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
