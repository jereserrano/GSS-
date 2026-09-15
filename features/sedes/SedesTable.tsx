"use client";

import React, { useEffect, useState, useRef } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download, Pencil, Trash2 } from "lucide-react";
import type { ColumnaDef, PaginatedResponse } from "@/types/common.types";
import { getSedesAction, deleteSede, exportSedesCSV } from "@/actions/sedes.actions";
import { SedeFormDialog } from "./SedeFormDialog";
import { toast } from "sonner";

interface Institucion {
  id: string;
  nombre: string;
}

interface SedesTableProps {
  initialData: any;
  instituciones: Institucion[];
}

export function SedesTable({ initialData, instituciones }: SedesTableProps) {
  const [data, setData] = useState<PaginatedResponse<any> | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const isFirstRender = useRef(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSede, setSelectedSede] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const [filtros, setFiltros] = useState({ pagina: 1, tamano: 10, busqueda: "" });

  const cargarDatos = async () => {
    setLoading(true);
    const result = await getSedesAction(filtros);
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
    setSelectedSede(null);
    cargarDatos();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportSedesCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sedes_export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Listado de sedes exportado correctamente");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (sede: any) => {
    const confirmed = window.confirm(`¿Eliminar la sede "${sede.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;
    setDeletingId(sede.id);
    const result = await deleteSede(sede.id);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Sede eliminada correctamente");
      cargarDatos();
    }
  };

  const columnas: ColumnaDef<any>[] = [
    {
      key: "nombre",
      header: "Sede",
      render: (s) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary">{s.nombre}</span>
            {s.esPrincipal && (
              <span className="bg-primary-light text-primary text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">
                Principal
              </span>
            )}
          </div>
          <span className="text-xs text-text-secondary">{s.institucion?.nombre}</span>
        </div>
      )
    },
    {
      key: "ubicacion",
      header: "Ubicación",
      render: (s) => (
        <div className="flex flex-col">
          <span className="text-sm">{s.direccion || "—"}</span>
          <span className="text-xs text-text-secondary">
            {[s.barrio, s.municipio].filter(Boolean).join(" • ") || "—"}
          </span>
        </div>
      )
    },
    {
      key: "coordinador",
      header: "Coordinador",
      render: (s) => (
        <div className="flex flex-col">
          <span className="text-sm">{s.coordinador || "No asignado"}</span>
          <span className="text-xs text-text-secondary">{s.telefono || ""}</span>
        </div>
      )
    },
    {
      key: "estado",
      header: "Estado",
      render: (s) => <StatusBadge estado={s.estado?.toLowerCase()} />
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 text-text-secondary hover:text-primary"
            onClick={(e) => { e.stopPropagation(); setSelectedSede(s); setDialogOpen(true); }}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 text-text-secondary hover:text-danger-600"
            disabled={deletingId === s.id}
            onClick={(e) => { e.stopPropagation(); handleDelete(s); }}
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
                placeholder="Buscar sede por nombre o institución..."
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
            <Button onClick={() => { setSelectedSede(null); setDialogOpen(true); }}>
              <Plus size={16} className="mr-2" /> Nueva Sede
            </Button>
          </div>
        </div>

        <DataTable data={data?.data || []} columnas={columnas} isLoading={loading} />

        {!loading && data && data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-text-secondary px-2">
            <div>
              Mostrando {((data.page - 1) * data.pageSize) + 1} a {Math.min(data.page * data.pageSize, data.total)} de {data.total} sedes
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
        <SedeFormDialog
          sede={selectedSede}
          instituciones={instituciones}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}
