"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { formatDateShort } from "@/lib/utils";

interface Actividad {
  id: string;
  nombre: string;
  ficha: string;
  tipo: "taller" | "proyecto" | "foro";
  fechaVencimiento: string;
  entregas: number;
  totalAprendices: number;
  estado: "activa" | "cerrada" | "borrador";
}

export function ActividadesTable() {
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const actividades: Actividad[] = [
    {
      id: "act-1",
      nombre: "Taller: Modelo Entidad-Relación",
      ficha: "228120 - Téc. Programación",
      tipo: "taller",
      fechaVencimiento: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 días
      entregas: 15,
      totalAprendices: 25,
      estado: "activa"
    },
    {
      id: "act-2",
      nombre: "Proyecto: Documento de Requisitos (SRS)",
      ficha: "228120 - Téc. Programación",
      tipo: "proyecto",
      fechaVencimiento: new Date(Date.now() - 86400000 * 5).toISOString(), // -5 días
      entregas: 24,
      totalAprendices: 25,
      estado: "cerrada"
    }
  ];

  const columnas: ColumnaDef<Actividad>[] = [
    {
      key: "nombre",
      header: "Actividad",
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary line-clamp-1">{a.nombre}</span>
          <span className="text-xs text-text-secondary capitalize">{a.tipo}</span>
        </div>
      )
    },
    {
      key: "ficha",
      header: "Ficha",
      render: (a) => <span className="text-sm font-medium">{a.ficha}</span>
    },
    {
      key: "fechaVencimiento",
      header: "Vencimiento",
      render: (a) => (
        <span className={`text-sm ${new Date(a.fechaVencimiento) < new Date() && a.estado !== 'cerrada' ? 'text-danger-600 font-medium' : ''}`}>
          {formatDateShort(a.fechaVencimiento)}
        </span>
      )
    },
    {
      key: "entregas",
      header: "Progreso Entregas",
      align: "center",
      render: (a) => {
        const porcentaje = Math.round((a.entregas / a.totalAprendices) * 100);
        return (
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium">{a.entregas} / {a.totalAprendices}</span>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
              <div 
                className={`h-full ${porcentaje >= 80 ? 'bg-success-500' : porcentaje >= 50 ? 'bg-warning-500' : 'bg-danger-500'}`} 
                style={{ width: `${porcentaje}%` }}
              />
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
          ${a.estado === 'activa' ? 'bg-info-50 text-info-700' : 
            a.estado === 'cerrada' ? 'bg-slate-100 text-slate-700' : 
            'bg-warning-50 text-warning-700'}`}
        >
          {a.estado}
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
              placeholder="Buscar actividad..." 
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
            <Plus size={16} className="mr-2" /> Nueva Actividad
          </Button>
        </div>
      </div>

      <DataTable 
        data={actividades} 
        columnas={columnas} 
        isLoading={loading} 
      />
    </div>
  );
}
