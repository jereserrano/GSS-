"use client";

import React, { useEffect, useState, useRef } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download, Pencil, Trash2 } from "lucide-react";
import type { ColumnaDef, PaginatedResponse } from "@/types/common.types";
import { getProgramasAction, deletePrograma, exportProgramasCSV } from "@/actions/programas.actions";
import { ProgramaFormDialog } from "./ProgramaFormDialog";
import { toast } from "sonner";

interface ProgramasTableProps {
  initialData: any;
}

export function ProgramasTable({ initialData }: ProgramasTableProps) {
  const [data, setData] = useState<PaginatedResponse<any> | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const isFirstRender = useRef(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPrograma, setSelectedPrograma] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const [filtros, setFiltros] = useState({ pagina: 1, tamano: 10, busqueda: "" });

  const cargarDatos = async () => {
    setLoading(true);
    const result = await getProgramasAction(filtros);
    if (result.success) setData(result.data as PaginatedResponse<any>);
    setLoading(false);
  };

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const handler = setTimeout(() => { cargarDatos(); }, 300);
    return () => clearTimeout(handler);
  }, [filtros]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPrograma(null);
    cargarDatos();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportProgramasCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "programas_export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Listado de programas exportado correctamente");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (programa: any) => {
    if (!window.confirm(`¿Eliminar "${programa.nombre}"? Solo es posible si no tiene fichas asociadas.`)) return;
    setDeletingId(programa.id);
    const result = await deletePrograma(programa.id);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Programa eliminado correctamente");
      cargarDatos();
    }
  };

  const columnas: ColumnaDef<any>[] = [
    {
      key: "codigo",
      header: "Código SENA",
      render: (p) => <span className="font-mono text-sm font-semibold">{p.codigo}</span>
    },
    {
      key: "nombre",
      header: "Nombre del Programa",
      render: (p) => <span className="font-semibold text-text-primary">{p.nombre}</span>
    },
    {
      key: "nivelFormacion",
      header: "Nivel",
      render: (p) => (
        <span className="capitalize bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
          {p.nivelFormacion?.toLowerCase()}
        </span>
      )
    },
    {
      key: "fichas",
      header: "Fichas",
      align: "center",
      render: (p) => (
        <span className="text-sm font-semibold text-text-primary">
          {p._count?.fichas ?? 0}
        </span>
      )
    },
    {
      key: "estado",
      header: "Estado",
      render: (p) => <StatusBadge estado={p.estado?.toLowerCase()} />
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 text-text-secondary hover:text-primary"
            onClick={(e) => { e.stopPropagation(); setSelectedPrograma(p); setDialogOpen(true); }}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 text-text-secondary hover:text-danger-600"
            disabled={deletingId === p.id}
            onClick={(e) => { e.stopPropagation(); handleDelete(p); }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-1 gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              <Input
                placeholder="Buscar por código o nombre del programa..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value, pagina: 1 }))}
                className="bg-surface pl-9"
              />
            </div>
            <Button variant="outline" className="shrink-0 bg-surface">
              <Filter size={16} className="mr-2" /> Filtros
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-surface" onClick={handleExport} disabled={exporting}>
              <Download size={16} className="mr-2" /> {exporting ? "Exportando..." : "Exportar"}
            </Button>
            <Button onClick={() => { setSelectedPrograma(null); setDialogOpen(true); }}>
              <Plus size={16} className="mr-2" /> Nuevo Programa
            </Button>
          </div>
        </div>

        <DataTable data={data?.data || []} columnas={columnas} isLoading={loading} />

        {!loading && data && data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-text-secondary px-2">
            <div>
              Mostrando {((data.page - 1) * data.pageSize) + 1} a {Math.min(data.page * data.pageSize, data.total)} de {data.total} programas
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={data.page === 1}
                onClick={() => setFiltros(prev => ({ ...prev, pagina: prev.pagina - 1 }))}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled={data.page === data.totalPages}
                onClick={() => setFiltros(prev => ({ ...prev, pagina: prev.pagina + 1 }))}>
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {dialogOpen && (
        <ProgramaFormDialog
          programa={selectedPrograma}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}
