"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";

interface Competencia {
  codigo: string;
  nombre: string;
  programa: string;
  duracionHoras: number;
  tipo: "técnica" | "transversal" | "básica";
  estado: "activo" | "inactivo";
}

export function CompetenciasTable() {
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const competencias: Competencia[] = [
    {
      codigo: "220501096",
      nombre: "Implementar la arquitectura del software de acuerdo con prácticas y herramientas de desarrollo",
      programa: "Técnico en Programación de Software",
      duracionHoras: 180,
      tipo: "técnica",
      estado: "activo"
    },
    {
      codigo: "240201528",
      nombre: "Razonar cuantitativamente frente a situaciones susceptibles de ser abordadas de manera matemática",
      programa: "Transversal a todos",
      duracionHoras: 48,
      tipo: "básica",
      estado: "activo"
    }
  ];

  const columnas: ColumnaDef<Competencia>[] = [
    {
      key: "codigo",
      header: "Código",
      render: (c) => <span className="font-mono text-sm font-medium">{c.codigo}</span>
    },
    {
      key: "nombre",
      header: "Competencia",
      render: (c) => (
        <span className="font-semibold text-text-primary text-sm max-w-md block line-clamp-2" title={c.nombre}>
          {c.nombre}
        </span>
      )
    },
    {
      key: "programa",
      header: "Programa",
      render: (c) => <span className="text-sm text-text-secondary">{c.programa}</span>
    },
    {
      key: "tipo",
      header: "Tipo",
      render: (c) => (
        <span className="capitalize bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
          {c.tipo}
        </span>
      )
    },
    {
      key: "duracionHoras",
      header: "Duración",
      align: "center",
      render: (c) => <span className="text-sm font-medium">{c.duracionHoras}h</span>
    },
    {
      key: "estado",
      header: "Estado",
      render: (c) => <StatusBadge estado={c.estado} />
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1 input-with-icon">
            <Search size={16} className="input-icon" />
            <Input 
              placeholder="Buscar competencia..." 
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
            <Plus size={16} className="mr-2" /> Nueva Competencia
          </Button>
        </div>
      </div>

      <DataTable 
        data={competencias} 
        columnas={columnas} 
        isLoading={loading} 
      />
    </div>
  );
}
