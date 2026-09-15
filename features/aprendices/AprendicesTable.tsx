"use client";

import React, { useEffect, useState, useRef } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Aprendiz, FiltrosAprendiz } from "@/types/aprendiz.types";
import type { ColumnaDef, PaginatedResponse } from "@/types/common.types";
import { getAprendicesAction, deleteAprendiz, exportAprendicesCSV } from "@/actions/aprendices.actions";
import { AprendizFormDialog } from "./AprendizFormDialog";
import { toast } from "sonner";

interface Ficha {
  id: string;
  codigo: string;
}

interface AprendicesTableProps {
  initialData: any;
  fichas: Ficha[];
}

export function AprendicesTable({ initialData, fichas }: AprendicesTableProps) {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<Aprendiz> | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const isFirstRender = useRef(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAprendiz, setSelectedAprendiz] = useState<Aprendiz | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const [filtros, setFiltros] = useState<FiltrosAprendiz>({
    pagina: 1,
    tamano: 10,
    busqueda: ""
  });

  const cargarDatos = async () => {
    setLoading(true);
    const result = await getAprendicesAction(filtros);
    if (result.success) {
      setData(result.data as unknown as PaginatedResponse<Aprendiz>);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const handler = setTimeout(() => { cargarDatos(); }, 300);
    return () => clearTimeout(handler);
  }, [filtros]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros(prev => ({ ...prev, busqueda: e.target.value, pagina: 1 }));
  };

  const handleOpenCreate = () => {
    setSelectedAprendiz(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (aprendiz: Aprendiz) => {
    setSelectedAprendiz(aprendiz);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAprendiz(null);
    cargarDatos(); // Refrescar tras crear/editar
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportAprendicesCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "aprendices_export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Listado de aprendices exportado correctamente");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (aprendiz: Aprendiz) => {
    const confirmed = window.confirm(
      `¿Eliminar a ${aprendiz.nombres} ${aprendiz.apellidos}? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeletingId(aprendiz.id);
    const result = await deleteAprendiz(aprendiz.id);
    setDeletingId(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Aprendiz eliminado correctamente");
      cargarDatos();
    }
  };

  const columnas: ColumnaDef<Aprendiz>[] = [
    {
      key: "documento",
      header: "Documento",
      render: (a) => (
        <div>
          <span className="text-xs text-text-secondary">{a.tipoDocumento}</span>
          <br />
          <span className="font-medium">{a.numeroDocumento}</span>
        </div>
      )
    },
    {
      key: "nombres",
      header: "Nombres y Apellidos",
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{a.nombres} {a.apellidos}</span>
          <span className="text-xs text-text-secondary">{a.emailSena || a.emailPersonal}</span>
        </div>
      )
    },
    {
      key: "ficha",
      header: "Formación",
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-medium">Ficha {(a.ficha as any)?.codigo}</span>
          <span className="text-xs text-text-secondary truncate max-w-[200px]" title={(a as any).ficha?.institucion?.nombre}>
            {(a as any).ficha?.institucion?.nombre}
          </span>
        </div>
      )
    },
    {
      key: "estado",
      header: "Estado",
      render: (a) => <StatusBadge estado={a.estado} />
    },
    {
      key: "nivelRiesgo",
      header: "Riesgo",
      render: (a) => <RiskBadge nivel={a.nivelRiesgo} />
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      render: (a) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-text-secondary hover:text-primary"
            onClick={(e) => { e.stopPropagation(); handleOpenEdit(a); }}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-text-secondary hover:text-danger-600"
            disabled={deletingId === a.id}
            onClick={(e) => { e.stopPropagation(); handleDelete(a); }}
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
        {/* Barra de herramientas */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-1 gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              <Input
                placeholder="Buscar por documento o nombre..."
                value={filtros.busqueda}
                onChange={handleSearchChange}
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
            <Button onClick={handleOpenCreate}>
              <Plus size={16} className="mr-2" /> Nuevo Aprendiz
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <DataTable
          data={data?.data || []}
          columnas={columnas}
          isLoading={loading}
          onRowClick={(row) => router.push(`/aprendices/${row.id}`)}
        />

        {/* Paginación */}
        {!loading && data && data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-text-secondary px-2">
            <div>
              Mostrando {((data.page - 1) * data.pageSize) + 1} a {Math.min(data.page * data.pageSize, data.total)} de {data.total} aprendices
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page === 1}
                onClick={() => setFiltros(prev => ({ ...prev, pagina: prev.pagina! - 1 }))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page === data.totalPages}
                onClick={() => setFiltros(prev => ({ ...prev, pagina: prev.pagina! + 1 }))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {dialogOpen && (
        <AprendizFormDialog
          aprendiz={selectedAprendiz}
          fichas={fichas}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}
