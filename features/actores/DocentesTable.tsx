"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";

interface Docente {
  id: string;
  nombres: string;
  apellidos: string;
  institucion: string;
  sede: string;
  email: string;
  telefono: string;
  asignatura: string;
  estado: "activo" | "inactivo";
}

export function DocentesTable() {
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const docentes: Docente[] = [
    {
      id: "doc-1",
      nombres: "Marta Lucía",
      apellidos: "Ramírez",
      institucion: "IED Liceo Celedón",
      sede: "Sede Principal",
      email: "mramirez@liceoceledon.edu.co",
      telefono: "320 555 4433",
      asignatura: "Tecnología e Informática",
      estado: "activo"
    },
    {
      id: "doc-2",
      nombres: "Carlos Arturo",
      apellidos: "López",
      institucion: "IED Normal Superior",
      sede: "Sede Principal",
      email: "clopez@normalsuperior.edu.co",
      telefono: "315 777 8899",
      asignatura: "Matemáticas",
      estado: "activo"
    }
  ];

  const columnas: ColumnaDef<Docente>[] = [
    {
      key: "nombres",
      header: "Docente Par",
      render: (d) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{d.nombres} {d.apellidos}</span>
          <span className="text-xs text-text-secondary">{d.email}</span>
        </div>
      )
    },
    {
      key: "institucion",
      header: "Institución / Sede",
      render: (d) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{d.institucion}</span>
          <span className="text-xs text-text-secondary">{d.sede}</span>
        </div>
      )
    },
    {
      key: "asignatura",
      header: "Asignatura",
      render: (d) => <span className="text-sm">{d.asignatura}</span>
    },
    {
      key: "telefono",
      header: "Teléfono",
      render: (d) => <span className="text-sm">{d.telefono}</span>
    },
    {
      key: "estado",
      header: "Estado",
      render: (d) => <StatusBadge estado={d.estado} />
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1 input-with-icon">
            <Search size={16} className="input-icon" />
            <Input 
              placeholder="Buscar por nombre, colegio o asignatura..." 
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
            <Plus size={16} className="mr-2" /> Nuevo Docente
          </Button>
        </div>
      </div>

      <DataTable 
        data={docentes} 
        columnas={columnas} 
        isLoading={loading} 
      />
    </div>
  );
}
