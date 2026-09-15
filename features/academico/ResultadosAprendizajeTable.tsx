"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Download, Pencil, Trash2 } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { deleteResultadoAprendizaje, exportResultadosAprendizajeCSV } from "@/actions/resultados_aprendizaje.actions";
import { ResultadoAprendizajeFormDialog } from "./ResultadoAprendizajeFormDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ResultadosAprendizajeTableProps {
  initialData: any;
  competencias: { id: string; codigo: string; nombre: string }[];
}

export function ResultadosAprendizajeTable({ initialData, competencias }: ResultadosAprendizajeTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResultado, setSelectedResultado] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const resultados = initialData?.data || [];

  const handleEdit = (resultado: any) => {
    setSelectedResultado(resultado);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedResultado(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este Resultado de Aprendizaje? Se eliminarán también las evaluaciones asociadas.")) return;
    
    setLoading(true);
    try {
      const res = await deleteResultadoAprendizaje(id);
      if (res.error) throw new Error(res.error);
      toast.success("RAP eliminado correctamente");
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
      const result = await exportResultadosAprendizajeCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resultados_aprendizaje_export.csv";
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
      key: "codigo",
      header: "Código",
      render: (r) => <span className="font-mono text-sm font-medium">{r.codigo}</span>
    },
    {
      key: "nombre",
      header: "Resultado de Aprendizaje (RAP)",
      render: (r) => (
        <span className="font-semibold text-text-primary text-sm max-w-md block line-clamp-2" title={r.nombre}>
          {r.nombre}
        </span>
      )
    },
    {
      key: "competencia",
      header: "Competencia Asociada",
      render: (r) => (
        <span className="text-sm text-text-secondary truncate max-w-[250px] inline-block" title={`${r.competencia.codigo} - ${r.competencia.nombre}`}>
          {r.competencia.codigo} - {r.competencia.nombre}
        </span>
      )
    },
    {
      key: "fase",
      header: "Fase del Proyecto",
      align: "center",
      render: (r) => (
        <span className="capitalize bg-info-50 text-info-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
          {r.fase.toLowerCase()}
        </span>
      )
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (r) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}>
            <Pencil size={16} className="text-text-secondary" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <Input 
              placeholder="Buscar por código o nombre..." 
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
            <Plus size={16} className="mr-2" /> Nuevo RAP
          </Button>
        </div>
      </div>

      <DataTable 
        data={resultados} 
        columnas={columnas} 
        isLoading={loading} 
      />

      {dialogOpen && (
        <ResultadoAprendizajeFormDialog 
          resultado={selectedResultado}
          competencias={competencias}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
