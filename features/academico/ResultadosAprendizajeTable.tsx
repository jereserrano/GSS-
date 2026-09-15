"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";

interface ResultadoAprendizaje {
  codigo: string;
  nombre: string;
  competencia: string;
  fase: "análisis" | "planeación" | "ejecución" | "evaluación";
}

export function ResultadosAprendizajeTable() {
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const resultados: ResultadoAprendizaje[] = [
    {
      codigo: "RAP1",
      nombre: "Interpretar el informe de requisitos para determinar las necesidades tecnológicas",
      competencia: "220501096 - Implementar la arquitectura del software...",
      fase: "análisis"
    },
    {
      codigo: "RAP2",
      nombre: "Construir la base de datos de acuerdo con el modelo relacional",
      competencia: "220501096 - Implementar la arquitectura del software...",
      fase: "ejecución"
    }
  ];

  const columnas: ColumnaDef<ResultadoAprendizaje>[] = [
    {
      key: "codigo",
      header: "Código",
      render: (r) => <span className="font-mono text-sm font-medium">{r.codigo}</span>
    },
    {
      key: "nombre",
      header: "Resultado de Aprendizaje (RAP)",
      render: (r) => (
        <span className="font-semibold text-text-primary text-sm max-w-md block">
          {r.nombre}
        </span>
      )
    },
    {
      key: "competencia",
      header: "Competencia Asociada",
      render: (r) => <span className="text-sm text-text-secondary truncate max-w-[250px] inline-block" title={r.competencia}>{r.competencia}</span>
    },
    {
      key: "fase",
      header: "Fase del Proyecto",
      align: "center",
      render: (r) => (
        <span className="capitalize bg-info-50 text-info-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
          {r.fase}
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
              placeholder="Buscar RAP..." 
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
            <Plus size={16} className="mr-2" /> Nuevo RAP
          </Button>
        </div>
      </div>

      <DataTable 
        data={resultados} 
        columnas={columnas} 
        isLoading={loading} 
      />
    </div>
  );
}
