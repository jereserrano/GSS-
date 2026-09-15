"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, Eye } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { formatDateShort } from "@/lib/utils";

interface Entrega {
  id: string;
  aprendiz: string;
  documento: string;
  actividad: string;
  fechaEntrega: string;
  estado: "calificada" | "pendiente" | "tardia";
  calificacion?: string; // A (Aprobado), D (Deficiente)
}

export function EntregasTable() {
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const entregas: Entrega[] = [
    {
      id: "ent-1",
      aprendiz: "Carlos Martínez",
      documento: "1.002.333.444",
      actividad: "Taller: Modelo Entidad-Relación",
      fechaEntrega: new Date(Date.now() - 86400000 * 1).toISOString(),
      estado: "pendiente"
    },
    {
      id: "ent-2",
      aprendiz: "Laura Gómez",
      documento: "1.003.444.555",
      actividad: "Proyecto: Documento de Requisitos",
      fechaEntrega: new Date(Date.now() - 86400000 * 4).toISOString(),
      estado: "calificada",
      calificacion: "A"
    },
    {
      id: "ent-3",
      aprendiz: "Andrés Silva",
      documento: "1.004.555.666",
      actividad: "Proyecto: Documento de Requisitos",
      fechaEntrega: new Date(Date.now() - 86400000 * 2).toISOString(),
      estado: "tardia",
      calificacion: "D"
    }
  ];

  const columnas: ColumnaDef<Entrega>[] = [
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
      key: "actividad",
      header: "Actividad",
      render: (e) => <span className="text-sm font-medium line-clamp-1">{e.actividad}</span>
    },
    {
      key: "fechaEntrega",
      header: "Fecha de Entrega",
      render: (e) => <span className="text-sm">{formatDateShort(e.fechaEntrega)}</span>
    },
    {
      key: "estado",
      header: "Estado",
      render: (e) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
          ${e.estado === 'calificada' ? 'bg-success-50 text-success-700' : 
            e.estado === 'pendiente' ? 'bg-warning-50 text-warning-700' : 
            'bg-danger-50 text-danger-700'}`}
        >
          {e.estado}
        </span>
      )
    },
    {
      key: "calificacion",
      header: "Calificación",
      align: "center",
      render: (e) => (
        <span className={`font-bold ${e.calificacion === 'A' ? 'text-success-600' : e.calificacion === 'D' ? 'text-danger-600' : 'text-slate-400'}`}>
          {e.calificacion || "—"}
        </span>
      )
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      render: (e) => (
        <Button variant="ghost" size="sm">
          <Eye size={16} className="mr-2" /> Revisar
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
              placeholder="Buscar entrega o aprendiz..." 
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
        </div>
      </div>

      <DataTable 
        data={entregas} 
        columnas={columnas} 
        isLoading={loading} 
      />
    </div>
  );
}
