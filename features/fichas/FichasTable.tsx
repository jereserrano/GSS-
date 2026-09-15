"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Ficha, FiltrosFicha } from "@/types/institucion.types";
import type { ColumnaDef, PaginatedResponse } from "@/types/common.types";
import { FichasService } from "@/services/fichas.service";
import { formatDateShort } from "@/lib/utils";

export function FichasTable() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<Ficha> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [filtros, setFiltros] = useState<FiltrosFicha>({
    pagina: 1,
    tamano: 10,
    busqueda: ""
  });

  const cargarDatos = async () => {
    setLoading(true);
    const result = await FichasService.getFichas(filtros);
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

  const columnas: ColumnaDef<Ficha>[] = [
    {
      key: "codigo",
      header: "Número de Ficha",
      render: (f) => (
        <span className="font-bold text-text-primary text-base">{f.codigo}</span>
      )
    },
    {
      key: "programa",
      header: "Programa Técnico",
      render: (f) => (
        <div className="flex flex-col">
          <span className="font-medium">{f.programa?.nombre}</span>
          <span className="text-xs text-text-secondary font-mono">Código: {f.programa?.codigo}</span>
        </div>
      )
    },
    {
      key: "institucion",
      header: "Institución y Sede",
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
      key: "estado",
      header: "Estado",
      render: (f) => <StatusBadge estado={f.estado} />
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1 input-with-icon">
            <Search size={16} className="input-icon" />
            <Input 
              placeholder="Buscar por número de ficha..." 
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
            <Plus size={16} className="mr-2" /> Nueva Ficha
          </Button>
        </div>
      </div>

      <DataTable 
        data={data?.data || []} 
        columnas={columnas} 
        isLoading={loading} 
        // En Fase 2 podríamos habilitar esto: onRowClick={(row) => router.push(`/fichas/${row.id}`)}
      />

      {!loading && data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-text-secondary px-2">
          <div>
            Mostrando {((data.page - 1) * data.pageSize) + 1} a {Math.min(data.page * data.pageSize, data.total)} de {data.total} fichas
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
