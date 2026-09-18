"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download, Pencil, Trash2 } from "lucide-react";
import type { ColumnaDef, PaginatedResponse } from "@/types/common.types";
import { getFichasAction, deleteFicha, exportFichasCSV } from "@/actions/fichas.actions";
import { FichaFormDialog } from "./FichaFormDialog";
import { formatDateShort } from "@/lib/utils";
import { toast } from "sonner";

interface FichasTableProps {
  initialData: any;
  programas: { id: string; codigo: string; nombre: string }[];
  instituciones: { id: string; nombre: string }[];
  sedes: { id: string; nombre: string; institucionId: string }[];
}

export function FichasTable({ initialData, programas, instituciones, sedes }: FichasTableProps) {
  const { data: session } = useSession();
  const userRole = ((session?.user as any)?.role || "").toUpperCase();
  const canManage = userRole === "ADMINISTRADOR" || userRole.includes("ADMIN") || userRole.includes("COORD");

  const [data, setData] = useState<PaginatedResponse<any> | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const isFirstRender = useRef(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filtros, setFiltros] = useState<any>({ pagina: 1, tamano: 10, busqueda: "" });

  const handleFilterSelect = (key: string, value: any) => {
    setFiltros((prev: any) => ({ ...prev, [key]: value || undefined, pagina: 1 }));
  };

  const cargarDatos = async () => {
    setLoading(true);
    const result = await getFichasAction(filtros);
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
    setSelectedFicha(null);
    cargarDatos();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportFichasCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fichas_export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Listado de fichas exportado correctamente");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (ficha: any) => {
    if (!window.confirm(`¿Eliminar la ficha ${ficha.codigo}? Esta acción no se puede deshacer.`)) return;
    setDeletingId(ficha.id);
    const result = await deleteFicha(ficha.id);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Ficha eliminada correctamente");
      cargarDatos();
    }
  };

  const columnas: ColumnaDef<any>[] = [
    {
      key: "codigo",
      header: "Número de Ficha",
      render: (f) => <span className="font-bold text-text-primary text-base font-mono">{f.codigo}</span>
    },
    {
      key: "programa",
      header: "Programa Técnico",
      render: (f) => (
        <div className="flex flex-col">
          <span className="font-medium">{f.programa?.nombre}</span>
          <span className="text-xs text-text-secondary font-mono">Cód: {f.programa?.codigo}</span>
        </div>
      )
    },
    {
      key: "institucion",
      header: "Institución / Sede",
      render: (f) => (
        <div className="flex flex-col">
          <span className="text-sm truncate max-w-[200px]" title={f.institucion?.nombre}>
            {f.institucion?.nombre}
          </span>
          <span className="text-xs text-text-secondary">{f.sede?.nombre}</span>
        </div>
      )
    },
    {
      key: "fechas",
      header: "Fechas",
      render: (f) => (
        <div className="flex flex-col text-xs text-text-secondary">
          <span>Inicio: <span className="font-medium text-text-primary">{formatDateShort(f.fechaInicio)}</span></span>
          <span>Fin: <span className="font-medium text-text-primary">{formatDateShort(f.fechaFin)}</span></span>
        </div>
      )
    },
    {
      key: "aprendices",
      header: "Aprendices",
      align: "center",
      render: (f) => (
        <span className="text-sm font-semibold text-text-primary">
          {f._count?.aprendices ?? 0}
        </span>
      )
    },
    {
      key: "estado",
      header: "Estado",
      render: (f) => <StatusBadge estado={f.estado?.toLowerCase()} />
    },
    ...(canManage ? [{
      key: "acciones",
      header: "",
      align: "right" as const,
      render: (f: any) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 text-text-secondary hover:text-primary"
            onClick={(e) => { e.stopPropagation(); setSelectedFicha(f); setDialogOpen(true); }}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 text-text-secondary hover:text-danger-600"
            disabled={deletingId === f.id}
            onClick={(e) => { e.stopPropagation(); handleDelete(f); }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }] : [])
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-1 gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              <Input
                placeholder="Buscar por número de ficha, programa o institución..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value, pagina: 1 }))}
                className="bg-surface pl-9"
              />
            </div>
            <Button variant={showFilters ? "default" : "outline"} className={`shrink-0 ${!showFilters && 'bg-surface'}`} onClick={() => setShowFilters(!showFilters)}>
              <Filter size={16} className="mr-2" /> Filtros
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-surface" onClick={handleExport} disabled={exporting}>
              <Download size={16} className="mr-2" /> {exporting ? "Exportando..." : "Exportar"}
            </Button>
            {canManage && (
              <Button onClick={() => { setSelectedFicha(null); setDialogOpen(true); }}>
                <Plus size={16} className="mr-2" /> Nueva Ficha
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-surface border border-border rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1.5 w-full sm:w-auto min-w-[200px]">
              <label className="text-xs font-medium text-text-secondary">Estado</label>
              <select 
                className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                value={filtros.estado || ""}
                onChange={(e) => handleFilterSelect("estado", e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5 w-full sm:w-auto min-w-[200px]">
              <label className="text-xs font-medium text-text-secondary">Programa</label>
              <select 
                className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                value={filtros.programaId || ""}
                onChange={(e) => handleFilterSelect("programaId", e.target.value)}
              >
                <option value="">Todos los programas</option>
                {programas.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full sm:w-auto min-w-[200px]">
              <label className="text-xs font-medium text-text-secondary">Institución</label>
              <select 
                className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                value={filtros.institucionId || ""}
                onChange={(e) => handleFilterSelect("institucionId", e.target.value)}
              >
                <option value="">Todas las instituciones</option>
                {instituciones.map(i => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <DataTable data={data?.data || []} columnas={columnas} isLoading={loading} />

        {!loading && data && data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-text-secondary px-2">
            <div>
              Mostrando {((data.page - 1) * data.pageSize) + 1} a {Math.min(data.page * data.pageSize, data.total)} de {data.total} fichas
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
        <FichaFormDialog
          ficha={selectedFicha}
          programas={programas}
          instituciones={instituciones}
          sedes={sedes}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}
