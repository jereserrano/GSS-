"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Institucion, FiltrosInstitucion } from "@/types/institucion.types";
import type { ColumnaDef, PaginatedResponse } from "@/types/common.types";
import { InstitucionesService } from "@/services/instituciones.service";
import { InstitucionFormDialog } from "./InstitucionFormDialog";
import { deleteInstitucion } from "@/actions/institucion.actions";
import { toast } from "sonner";

export function InstitucionesTable() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<Institucion> | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInstitucion, setSelectedInstitucion] = useState<Institucion | undefined>(undefined);
  
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
          <Button variant="ghost" size="sm" className="text-danger-600 hover:text-danger-700 hover:bg-danger-50" onClick={(e) => handleDelete(i.id, e)}>
            Eliminar
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1 input-with-icon">
            <Search size={16} className="input-icon" />
            <Input 
              placeholder="Buscar por NIT o nombre..." 
              value={filtros.busqueda}
              onChange={handleSearchChange}
              className="bg-surface"
            />
          </div>
          <Button variant="outline" className="shrink-0 bg-surface">
            <Filter size={16} className="mr-2" /> Filtros
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-surface">
            <Download size={16} className="mr-2" /> Exportar
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
          institucion={selectedInstitucion} 
          onClose={() => setDialogOpen(false)} 
          onSuccess={cargarDatos}
        />
      )}
    </div>
  );
}
