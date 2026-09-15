"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Institucion, FiltrosInstitucion } from "@/types/institucion.types";
import type { ColumnaDef, PaginatedResponse } from "@/types/common.types";
import { InstitucionesService } from "@/services/instituciones.service";
import { InstitucionFormDialog } from "./InstitucionFormDialog";
import { deleteInstitucion, exportInstitucionesCSV } from "@/actions/institucion.actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export function InstitucionesTable() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<Institucion> | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInstitucion, setSelectedInstitucion] = useState<Institucion | undefined>(undefined);
  const [exporting, setExporting] = useState(false);
  
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "INSTRUCTOR";
  const canDelete = userRole === "ADMINISTRADOR";
  
  const [filtros, setFiltros] = useState<FiltrosInstitucion>({
    pagina: 1,
    tamano: 10,
    busqueda: ""
  });

  const cargarDatos = async () => {
    setLoading(true);
    const result = await InstitucionesService.getInstituciones(filtros);
    if (result.ok) {
      setData(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      cargarDatos();
    }, 300);
    return () => clearTimeout(handler);
  }, [filtros]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros(prev => ({ ...prev, busqueda: e.target.value, pagina: 1 }));
  };

  const handleNew = () => {
    setSelectedInstitucion(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (institucion: Institucion, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInstitucion(institucion);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("¿Está seguro de eliminar esta institución?")) {
      try {
        const res = await deleteInstitucion(id);
        if (res.error) throw new Error(res.error);
        toast.success("Institución eliminada correctamente");
        cargarDatos();
      } catch (error: any) {
        toast.error(error.message || "Error al eliminar institución");
      }
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportInstitucionesCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");

      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "instituciones_export.csv";
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

  const columnas: ColumnaDef<Institucion>[] = [
    {
      key: "nit",
      header: "NIT",
      render: (i) => <span className="font-mono text-sm">{i.nit}</span>
    },
    {
      key: "nombre",
      header: "Institución Educativa",
      render: (i) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{i.nombre}</span>
          <span className="text-xs text-text-secondary">{i.municipio}, {i.departamento}</span>
        </div>
      )
    },
    {
      key: "contacto",
      header: "Contacto Principal",
      render: (i) => (
        <div className="flex flex-col">
          <span className="text-sm">{i.rector}</span>
          <span className="text-xs text-text-secondary">{i.telefono}</span>
        </div>
      )
    },
    {
      key: "sedes",
      header: "Sedes",
      align: "center",
      render: (i) => (
        <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
          {i.sedes?.length || 0}
        </span>
      )
    },
    {
      key: "estado",
      header: "Estado",
      render: (i) => <StatusBadge estado={i.estado} />
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      render: (i) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" className="text-primary" onClick={(e) => handleEdit(i, e)}>
            Editar
          </Button>
          {canDelete && (
            <Button variant="ghost" size="sm" className="text-danger-600 hover:text-danger-700 hover:bg-danger-50" onClick={(e) => handleDelete(i.id, e)}>
              Eliminar
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <Input 
              placeholder="Buscar por NIT o nombre..." 
              value={filtros.busqueda}
              onChange={handleSearchChange}
              className="bg-surface pl-9"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-surface" onClick={handleExport} disabled={exporting}>
            <Download size={16} className="mr-2" /> {exporting ? "Exportando..." : "Exportar"}
          </Button>
          <Button onClick={handleNew}>
            <Plus size={16} className="mr-2" /> Nueva Institución
          </Button>
        </div>
      </div>

      <DataTable 
        data={data?.data || []} 
        columnas={columnas} 
        isLoading={loading} 
        onRowClick={(row) => router.push(`/instituciones/${row.id}`)}
      />

      {!loading && data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-text-secondary px-2">
          <div>
            Mostrando {((data.page - 1) * data.pageSize) + 1} a {Math.min(data.page * data.pageSize, data.total)} de {data.total} instituciones
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

      {dialogOpen && (
        <InstitucionFormDialog 
          institucion={selectedInstitucion as any} 
          onClose={() => setDialogOpen(false)} 
          onSuccess={cargarDatos}
        />
      )}
    </div>
  );
}
