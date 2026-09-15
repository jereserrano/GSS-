"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { formatDateShort } from "@/lib/utils";

interface VisitaSeguimiento {
  id: string;
  institucion: string;
  fecha: string;
  responsable: string;
  novedades: number;
  estado: "programada" | "realizada" | "aplazada";
}

export function SeguimientoTable() {
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const visitas: VisitaSeguimiento[] = [
    {
      id: "vis-1",
      institucion: "IED Liceo Celedón",
      fecha: new Date(Date.now() - 86400000 * 3).toISOString(),
      responsable: "Enlace SENA",
      novedades: 2,
      estado: "realizada"
    },
    {
      id: "vis-2",
      institucion: "IED Normal Superior",
      fecha: new Date(Date.now() + 86400000 * 2).toISOString(),
      responsable: "Coordinador Académico",
      novedades: 0,
      estado: "programada"
    }
  ];

  const columnas: ColumnaDef<VisitaSeguimiento>[] = [
    {
      key: "institucion",
      header: "Institución Educativa",
      render: (v) => <span className="font-semibold text-text-primary">{v.institucion}</span>
    },
    {
      key: "fecha",
      header: "Fecha de Visita",
      render: (v) => <span className="text-sm font-medium">{formatDateShort(v.fecha)}</span>
    },
    {
      key: "responsable",
      header: "Responsable",
      render: (v) => <span className="text-sm">{v.responsable}</span>
    },
    {
      key: "novedades",
      header: "Novedades Encontradas",
      align: "center",
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${v.novedades > 0 ? 'bg-warning-100 text-warning-700' : 'bg-slate-100 text-slate-500'}`}>
          {v.novedades}
        </span>
      )
    },
    {
      key: "estado",
      header: "Estado",
      render: (v) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
          ${v.estado === 'realizada' ? 'bg-success-50 text-success-700' : 
            v.estado === 'programada' ? 'bg-info-50 text-info-700' : 'bg-warning-50 text-warning-700'}`}
        >
          {v.estado}
        </span>
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
              placeholder="Buscar visitas..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-surface"
            />
          </div>
          <Button variant="outline" className="shrink-0 bg-surface">
            <Filter size={16} className="mr-2" /> Filtros
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-surface">
            <Download size={16} className="mr-2" /> Reporte
          </Button>
          <Button>
            <Plus size={16} className="mr-2" /> Programar Visita
          </Button>
        </div>
      </div>
      <DataTable data={visitas} columnas={columnas} isLoading={loading} />
    </div>
  );
}
