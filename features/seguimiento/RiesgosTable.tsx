"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, AlertTriangle } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { formatDateShort } from "@/lib/utils";

interface AlertaRiesgo {
  id: string;
  aprendiz: string;
  ficha: string;
  motivo: string;
  nivel: "alto" | "medio" | "bajo";
  fechaDeteccion: string;
}

export function RiesgosTable() {
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const alertas: AlertaRiesgo[] = [
    {
      id: "alerta-1",
      aprendiz: "Andrés Silva",
      ficha: "228120",
      motivo: "Inasistencia consecutiva (3 clases)",
      nivel: "alto",
      fechaDeteccion: new Date().toISOString()
    },
    {
      id: "alerta-2",
      aprendiz: "Laura Gómez",
      ficha: "233101",
      motivo: "Bajo rendimiento en RAP1",
      nivel: "medio",
      fechaDeteccion: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ];

  const columnas: ColumnaDef<AlertaRiesgo>[] = [
    {
      key: "aprendiz",
      header: "Aprendiz",
      render: (a) => <span className="font-semibold text-text-primary">{a.aprendiz}</span>
    },
    {
      key: "ficha",
      header: "Ficha",
      render: (a) => <span className="font-medium text-sm">{a.ficha}</span>
    },
    {
      key: "motivo",
      header: "Motivo de la Alerta",
      render: (a) => <span className="text-sm">{a.motivo}</span>
    },
    {
      key: "nivel",
      header: "Nivel de Riesgo",
      align: "center",
      render: (a) => <RiskBadge nivel={a.nivel} />
    },
    {
      key: "fechaDeteccion",
      header: "Detectado",
      render: (a) => <span className="text-sm">{formatDateShort(a.fechaDeteccion)}</span>
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      render: (a) => (
        <Button variant="outline" size="sm" className="text-primary">
          Gestionar Caso
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
              placeholder="Buscar alertas..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-surface"
            />
          </div>
          <Button variant="outline" className="shrink-0 bg-surface">
            <Filter size={16} className="mr-2" /> Filtros
          </Button>
        </div>
      </div>

      <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex items-start gap-3 mb-4">
        <AlertTriangle className="text-danger-600 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-semibold text-danger-800">Atención Requerida</h4>
          <p className="text-sm text-danger-700 mt-1">Hay {alertas.filter(a => a.nivel === 'alto').length} aprendices en riesgo inminente de deserción que requieren intervención inmediata.</p>
        </div>
      </div>

      <DataTable data={alertas} columnas={columnas} isLoading={loading} />
    </div>
  );
}
