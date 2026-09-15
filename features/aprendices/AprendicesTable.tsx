"use client";

import React, { useEffect, useState, useRef } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Aprendiz, FiltrosAprendiz } from "@/types/aprendiz.types";
import type { ColumnaDef, PaginatedResponse } from "@/types/common.types";
import { getAprendicesAction } from "@/actions/aprendices.actions";

interface AprendicesTableProps {
  initialData: PaginatedResponse<Aprendiz> | null;
}

export function AprendicesTable({ initialData }: AprendicesTableProps) {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<Aprendiz> | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const isFirstRender = useRef(true);
  
  // Estado de los filtros
  const [filtros, setFiltros] = useState<FiltrosAprendiz>({
    pagina: 1,
    tamano: 10,
    busqueda: ""
  });

  const cargarDatos = async () => {
    setLoading(true);
    const result = await getAprendicesAction(filtros);
    if (result.success) {
      setData(result.data as PaginatedResponse<Aprendiz>);
    }
    setLoading(false);
  };

  // Efecto que reacciona a cambios en los filtros
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Pequeño debounce para la búsqueda
    const handler = setTimeout(() => {
      cargarDatos();
    }, 300);
    return () => clearTimeout(handler);
  }, [filtros]);


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros(prev => ({ ...prev, busqueda: e.target.value, pagina: 1 }));
  };

  const columnas: ColumnaDef<Aprendiz>[] = [
    {
      key: "documento",
      header: "Documento",
      render: (a) => (
        <div>
          <span className="text-xs text-text-secondary">{a.tipoDocumento}</span>
          <br/>
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
          <span className="font-medium">Ficha {a.ficha?.codigo}</span>
          <span className="text-xs text-text-secondary truncate max-w-[200px]" title={a.institucion?.nombre}>
            {a.institucion?.nombre}
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
    }
  ];

  return (
    <div className="space-y-4">
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1 input-with-icon">
            <Search size={16} className="input-icon" />
            <Input 
              placeholder="Buscar por documento o nombre..." 
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
          <Button>
            <Plus size={16} className="mr-2" /> Nuevo Aprendiz
          </Button>
        </div>
      </div>

      {/* Tabla de Datos */}
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
  );
}
