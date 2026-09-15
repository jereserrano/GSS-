"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, FileText, Download } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { formatDateShort } from "@/lib/utils";

interface Documento {
  id: string;
  nombre: string;
  tipo: "Acta" | "Acuerdo" | "Resolución" | "Otro";
  institucion: string;
  fechaSubida: string;
  tamano: string;
}

export function DocumentosTable() {
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const documentos: Documento[] = [
    {
      id: "doc-1",
      nombre: "Acta de Compromiso 2026.pdf",
      tipo: "Acta",
      institucion: "IED Liceo Celedón",
      fechaSubida: new Date().toISOString(),
      tamano: "2.4 MB"
    },
    {
      id: "doc-2",
      nombre: "Acuerdo Marco Articulación.pdf",
      tipo: "Acuerdo",
      institucion: "Todas",
      fechaSubida: new Date(Date.now() - 86400000 * 30).toISOString(),
      tamano: "5.1 MB"
    }
  ];

  const columnas: ColumnaDef<Documento>[] = [
    {
      key: "nombre",
      header: "Documento",
      render: (d) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sena-50 text-sena-600 rounded-lg">
            <FileText size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-text-primary">{d.nombre}</span>
            <span className="text-xs text-text-secondary">{d.tamano}</span>
          </div>
        </div>
      )
    },
    {
      key: "tipo",
      header: "Tipo",
      render: (d) => <span className="text-sm font-medium">{d.tipo}</span>
    },
    {
      key: "institucion",
      header: "Institución Asociada",
      render: (d) => <span className="text-sm">{d.institucion}</span>
    },
    {
      key: "fechaSubida",
      header: "Fecha de Subida",
      render: (d) => <span className="text-sm">{formatDateShort(d.fechaSubida)}</span>
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      render: (d) => (
        <Button variant="ghost" size="icon">
          <Download size={18} className="text-text-secondary" />
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
              placeholder="Buscar documento..." 
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
          <Button>
            <Plus size={16} className="mr-2" /> Subir Archivo
          </Button>
        </div>
      </div>

      <DataTable data={documentos} columnas={columnas} isLoading={loading} />
    </div>
  );
}
