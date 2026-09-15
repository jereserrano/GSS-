"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";

interface Evaluacion {
  id: string;
  aprendiz: string;
  documento: string;
  rap: string;
  ficha: string;
  juicio: "Aprobado" | "Deficiente" | "Pendiente";
  fecha: string;
}

export function EvaluacionesTable() {
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const evaluaciones: Evaluacion[] = [
    {
      id: "eval-1",
      aprendiz: "Carlos Martínez",
      documento: "1.002.333.444",
      rap: "RAP1 - Interpretar requisitos",
      ficha: "228120",
      juicio: "Aprobado",
      fecha: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: "eval-2",
      aprendiz: "Andrés Silva",
      documento: "1.004.555.666",
      rap: "RAP1 - Interpretar requisitos",
      ficha: "228120",
      juicio: "Deficiente",
      fecha: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: "eval-3",
      aprendiz: "Laura Gómez",
      documento: "1.003.444.555",
      rap: "RAP2 - Construir BD",
      ficha: "228120",
      juicio: "Pendiente",
      fecha: ""
    }
  ];

  const columnas: ColumnaDef<Evaluacion>[] = [
    {
      key: "aprendiz",
      header: "Aprendiz",
      render: (e) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{e.aprendiz}</span>
          <span className="text-xs text-text-secondary">{e.documento}</span>
        </div>
      )
    },
    {
      key: "ficha",
      header: "Ficha",
      render: (e) => <span className="font-medium text-sm">{e.ficha}</span>
    },
    {
      key: "rap",
      header: "Resultado de Aprendizaje (RAP)",
      render: (e) => <span className="text-sm line-clamp-1" title={e.rap}>{e.rap}</span>
    },
    {
      key: "juicio",
      header: "Juicio Valorativo",
      render: (e) => (
        <span className={`px-3 py-1 rounded-md text-xs font-bold tracking-wide uppercase
          ${e.juicio === 'Aprobado' ? 'bg-success-100 text-success-700' : 
            e.juicio === 'Deficiente' ? 'bg-danger-100 text-danger-700' : 
            'bg-slate-100 text-slate-600'}`}
        >
          {e.juicio === 'Aprobado' ? 'A (Aprobado)' : 
           e.juicio === 'Deficiente' ? 'D (Deficiente)' : 
           'Pendiente'}
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
              placeholder="Buscar evaluación o aprendiz..." 
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
            <Plus size={16} className="mr-2" /> Registrar Juicios
          </Button>
        </div>
      </div>

      <DataTable 
        data={evaluaciones} 
        columnas={columnas} 
        isLoading={loading} 
      />
    </div>
  );
}
