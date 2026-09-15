"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { formatDateShort } from "@/lib/utils";

interface RegistroAsistencia {
  id: string;
  ficha: string;
  fecha: string;
  instructor: string;
  asistieron: number;
  faltas: number;
  excusas: number;
  total: number;
  estado: "registrada" | "pendiente";
}

export function AsistenciaTable() {
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const registros: RegistroAsistencia[] = [
    {
      id: "asist-1",
      ficha: "228120 - Téc. Programación",
      fecha: new Date().toISOString(),
      instructor: "Andrés Felipe Gómez",
      asistieron: 22,
      faltas: 2,
      excusas: 1,
      total: 25,
      estado: "registrada"
    },
    {
      id: "asist-2",
      ficha: "233101 - Téc. Sistemas",
      fecha: new Date(Date.now() - 86400000).toISOString(),
      instructor: "Diana Marcela Rojas",
      asistieron: 25,
      faltas: 0,
      excusas: 0,
      total: 25,
      estado: "pendiente"
    }
  ];

  const columnas: ColumnaDef<RegistroAsistencia>[] = [
    {
      key: "ficha",
      header: "Ficha / Grupo",
      render: (a) => <span className="font-semibold text-text-primary text-sm">{a.ficha}</span>
    },
    {
      key: "fecha",
      header: "Fecha de Sesión",
      render: (a) => <span className="text-sm font-medium">{formatDateShort(a.fecha)}</span>
    },
    {
      key: "instructor",
      header: "Instructor",
      render: (a) => <span className="text-sm text-text-secondary">{a.instructor}</span>
    },
    {
      key: "asistencia",
      header: "Resumen de Asistencia",
      render: (a) => {
        const porcentajeAsistencia = Math.round((a.asistieron / a.total) * 100);
        return (
          <div className="flex flex-col gap-1 w-full max-w-[200px]">
            <div className="flex justify-between text-xs">
              <span className="text-success-600 font-medium">{a.asistieron} Asist.</span>
              <span className="text-danger-600 font-medium">{a.faltas} Faltas</span>
              <span className="text-warning-600 font-medium">{a.excusas} Exc.</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-success-500 h-full" style={{ width: `${porcentajeAsistencia}%` }} />
              <div className="bg-danger-500 h-full" style={{ width: `${(a.faltas / a.total) * 100}%` }} />
              <div className="bg-warning-500 h-full" style={{ width: `${(a.excusas / a.total) * 100}%` }} />
            </div>
          </div>
        );
      }
    },
    {
      key: "estado",
      header: "Estado",
      render: (a) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
          ${a.estado === 'registrada' ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700'}`}
        >
          {a.estado}
        </span>
      )
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      render: (a) => (
        <Button variant={a.estado === 'pendiente' ? 'default' : 'ghost'} size="sm">
          {a.estado === 'pendiente' ? 'Tomar Asistencia' : 'Ver Detalle'}
        </Button>
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
              placeholder="Buscar por ficha o instructor..." 
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
            <Plus size={16} className="mr-2" /> Nueva Sesión
          </Button>
        </div>
      </div>

      <DataTable 
        data={registros} 
        columnas={columnas} 
        isLoading={loading} 
      />
    </div>
  );
}
