"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Download, Pencil, Trash2 } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { deleteCompetencia, exportCompetenciasCSV } from "@/actions/competencias.actions";
import { CompetenciaFormDialog } from "./CompetenciaFormDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CompetenciasTableProps {
  initialData: any;
  programas: { id: string; codigo: string; nombre: string }[];
}

export function CompetenciasTable({ initialData, programas }: CompetenciasTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCompetencia, setSelectedCompetencia] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const competencias = initialData?.data || [];

  const handleEdit = (competencia: any) => {
    setSelectedCompetencia(competencia);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedCompetencia(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta competencia? Se eliminarán también sus resultados de aprendizaje asociados.")) return;
    
    setLoading(true);
    try {
      const res = await deleteCompetencia(id);
      if (res.error) throw new Error(res.error);
      toast.success("Competencia eliminada correctamente");
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
      const result = await exportCompetenciasCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "competencias_export.csv";
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
      render: (c) => <span className="font-mono text-sm font-medium">{c.codigo}</span>
    },
    {
      key: "nombre",
      header: "Competencia",
      render: (c) => (
        <span className="font-semibold text-text-primary text-sm max-w-md block line-clamp-2" title={c.nombre}>
          {c.nombre}
        </span>
      )
    },
    {
      key: "programa",
      header: "Programa",
      render: (c) => <span className="text-sm text-text-secondary">{c.programa.nombre}</span>
    },
    {
      key: "tipo",
      header: "Tipo",
      render: (c) => (
        <span className="capitalize bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
          {c.tipo.toLowerCase()}
        </span>
      )
    },
    {
      key: "duracionHoras",
      header: "Duración",
      align: "center",
      render: (c) => <span className="text-sm font-medium">{c.duracionHoras}h</span>
    },
    {
      key: "resultados",
      header: "Resultados",
      align: "center",
      render: (c) => <span className="text-sm text-text-secondary">{c._count?.resultadosAprendizaje || 0}</span>
    },
    {
      key: "estado",
      header: "Estado",
      render: (c) => <StatusBadge estado={c.estado} />
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (c) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}>
            <Pencil size={16} className="text-text-secondary" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
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
            <Plus size={16} className="mr-2" /> Nueva Competencia
          </Button>
        </div>
      </div>

      <DataTable 
        data={competencias} 
        columnas={columnas} 
        isLoading={loading} 
      />

      {dialogOpen && (
        <CompetenciaFormDialog 
          competencia={selectedCompetencia}
          programas={programas}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
