"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { formatDateShort } from "@/lib/utils";

interface LogAuditoria {
  id: string;
  fecha: string;
  usuario: string;
  modulo: string;
  accion: "crear" | "editar" | "eliminar" | "sistema";
  detalle: string;
  ip: string;
}

export function AuditoriaTable() {
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const logs: LogAuditoria[] = [
    {
      id: "log-1",
      fecha: new Date().toISOString(),
      usuario: "Carlos Admin (admin@sena.edu.co)",
      modulo: "Aprendices",
      accion: "editar",
      detalle: "Cambió el estado de 'Andrés Silva' a En Riesgo Alto",
      ip: "192.168.1.105"
    },
    {
      id: "log-2",
      fecha: new Date(Date.now() - 3600000).toISOString(),
      usuario: "Sistema",
      modulo: "Auth",
      accion: "sistema",
      detalle: "Login fallido para 'admin@sena.edu.co' (Contraseña incorrecta)",
      ip: "201.217.15.22"
    },
    {
      id: "log-3",
      fecha: new Date(Date.now() - 86400000).toISOString(),
      usuario: "María Coordinadora",
      modulo: "Fichas",
      accion: "crear",
      detalle: "Creó la Ficha 2987654 (Téc. Sistemas)",
      ip: "192.168.1.55"
    }
  ];

  const columnas: ColumnaDef<LogAuditoria>[] = [
    {
      key: "fecha",
      header: "Fecha / Hora",
      render: (l) => <span className="text-sm font-mono text-text-secondary">{formatDateShort(l.fecha)}</span>
    },
    {
      key: "usuario",
      header: "Usuario Responsable",
      render: (l) => <span className="font-medium text-sm">{l.usuario}</span>
    },
    {
      key: "accion",
      header: "Acción",
      render: (l) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
          ${l.accion === 'crear' ? 'bg-success-100 text-success-700' : 
            l.accion === 'editar' ? 'bg-warning-100 text-warning-700' :
            l.accion === 'eliminar' ? 'bg-danger-100 text-danger-700' :
            'bg-slate-200 text-slate-700'}`}
        >
          {l.accion}
        </span>
      )
    },
    {
      key: "detalle",
      header: "Detalle del Evento",
      render: (l) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-text-secondary">[{l.modulo}]</span>
          <span className="text-sm text-text-primary">{l.detalle}</span>
        </div>
      )
    },
    {
      key: "ip",
      header: "IP",
      render: (l) => <span className="text-xs font-mono text-slate-400">{l.ip}</span>
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1 input-with-icon">
            <Search size={16} className="input-icon" />
            <Input 
              placeholder="Buscar por usuario o evento..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-surface font-mono text-sm"
            />
          </div>
          <Button variant="outline" className="shrink-0 bg-surface">
            <Filter size={16} className="mr-2" /> Filtros
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-surface">
            <Download size={16} className="mr-2" /> Exportar CSV
          </Button>
        </div>
      </div>
      <DataTable data={logs} columnas={columnas} isLoading={loading} />
    </div>
  );
}
