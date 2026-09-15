"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download } from "lucide-react";
import type { Programa } from "@/types/institucion.types";
import type { ColumnaDef } from "@/types/common.types";

export function ProgramasTable() {
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Mock data directo para agilidad en Fase 1
  const programas: Programa[] = [
    {
      id: "prog-1",
      codigo: "228120",
      nombre: "Técnico en Programación de Software",
      nivelFormacion: "técnico",
      estado: "activo",
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    },
    {
      id: "prog-2",
      codigo: "233101",
      nombre: "Técnico en Sistemas",
      nivelFormacion: "técnico",
      estado: "activo",
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    },
    {
      id: "prog-3",
      codigo: "413115",
      nombre: "Técnico en Asistencia Administrativa",
      nivelFormacion: "técnico",
      estado: "inactivo",
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    }
  ];

  const columnas: ColumnaDef<Programa>[] = [
    {
      key: "codigo",
      header: "Código SENA",
      render: (p) => <span className="font-mono text-sm font-medium">{p.codigo}</span>
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
          {p.nivelFormacion}
        </span>
      )
    },
    {
      key: "estado",
      header: "Estado",
      render: (p) => <StatusBadge estado={p.estado} />
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1 input-with-icon">
            <Search size={16} className="input-icon" />
            <Input 
              placeholder="Buscar programa..." 
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
            <Download size={16} className="mr-2" /> Exportar
          </Button>
          <Button>
            <Plus size={16} className="mr-2" /> Nuevo Programa
          </Button>
        </div>
      </div>

      <DataTable 
        data={programas} 
        columnas={columnas} 
        isLoading={loading} 
      />
    </div>
  );
}
