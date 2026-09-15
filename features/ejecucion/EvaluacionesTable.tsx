"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Download, Pencil, Trash2 } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { formatDateShort } from "@/lib/utils";
import { deleteEvaluacion, exportEvaluacionesCSV } from "@/actions/evaluaciones.actions";
import { EvaluacionFormDialog } from "./EvaluacionFormDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface EvaluacionesTableProps {
  initialData: any;
  raps: { id: string; codigo: string; nombre: string }[];
  aprendices: { id: string; nombres: string; apellidos: string; numeroDocumento: string; ficha: { codigo: string } }[];

}

export function EvaluacionesTable({ initialData, raps, aprendices }: EvaluacionesTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [exporting, setExporting] = useState(false);
  
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "INSTRUCTOR";
  const canDelete = userRole === "ADMINISTRADOR" || userRole === "COORDINADOR";
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState<any>(null);

  const evaluaciones = initialData?.data || [];

  const handleEdit = (evaluacion: any) => {
    setSelectedEvaluacion(evaluacion);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedEvaluacion(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este juicio valorativo?")) return;
    
    setLoading(true);
    try {
      const res = await deleteEvaluacion(id);
      if (res.error) throw new Error(res.error);
      toast.success("Juicio eliminado correctamente");
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
      const result = await exportEvaluacionesCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "evaluaciones_export.csv";
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
      key: "ficha",
      header: "Ficha",
      render: (e) => <span className="font-medium text-sm">{e.aprendiz.ficha?.codigo || "-"}</span>
    },
    {
      key: "rap",
      header: "Resultado de Aprendizaje (RAP)",
      render: (e) => (
        <div className="flex flex-col max-w-xs">
          <span className="text-sm font-medium">{e.resultadoAprendizaje.codigo}</span>
          <span className="text-xs text-text-secondary line-clamp-1" title={e.resultadoAprendizaje.nombre}>{e.resultadoAprendizaje.nombre}</span>
        </div>
      )
    },
    {
      key: "juicio",
      header: "Juicio Valorativo",
      render: (e) => (
        <span className={`px-3 py-1 rounded-md text-xs font-bold tracking-wide uppercase
          ${e.juicio === 'APROBADO' ? 'bg-success-100 text-success-700' : 
            e.juicio === 'DEFICIENTE' ? 'bg-danger-100 text-danger-700' : 
            'bg-slate-100 text-slate-600'}`}
        >
          {e.juicio === 'APROBADO' ? 'A (Aprobado)' : 
           e.juicio === 'DEFICIENTE' ? 'D (Deficiente)' : 
           'Por Evaluar'}
        </span>
      )
    },
    {
      key: "fecha",
      header: "Fecha de Evaluación",
      render: (e) => <span className="text-sm">{e.fechaEvaluacion ? formatDateShort(e.fechaEvaluacion) : "—"}</span>
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
          {canDelete && (
            <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}>
              <Trash2 size={16} className="text-red-500" />
            </Button>
          )}
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
              placeholder="Buscar por aprendiz o RAP..." 
              value={busqueda}
              onChange={(ev) => setBusqueda(ev.target.value)}
              className="bg-surface pl-9"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-surface" onClick={handleExport} disabled={exporting}>
            <Download size={16} className="mr-2" /> {exporting ? "Exportando..." : "Exportar"}
          </Button>
          <Button onClick={handleCreate}>
            <Plus size={16} className="mr-2" /> Registrar Juicio
          </Button>
        </div>
      </div>

      <DataTable 
        data={evaluaciones} 
        columnas={columnas} 
        isLoading={loading} 
      />

      {dialogOpen && (
        <EvaluacionFormDialog 
          evaluacion={selectedEvaluacion}
          raps={raps}
          aprendices={aprendices}

          onClose={() => setDialogOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
