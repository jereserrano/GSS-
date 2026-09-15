"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";

interface Instructor {
  id: string;
  nombres: string;
  apellidos: string;
  documento: string;
  email: string;
  telefono: string;
  profesion: string;
  estado: "activo" | "inactivo";
  fichasAsignadas: number;
}

export function InstructoresTable() {
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const instructores: Instructor[] = [
    {
      id: "inst-1",
      nombres: "Andrés Felipe",
      apellidos: "Gómez Torres",
      documento: "1.082.345.678",
      email: "agomezt@sena.edu.co",
      telefono: "300 123 4567",
      profesion: "Ingeniero de Sistemas",
      estado: "activo",
      fichasAsignadas: 3
    },
    {
      id: "inst-2",
      nombres: "Diana Marcela",
      apellidos: "Rojas Silva",
      documento: "1.123.456.789",
      email: "drojas@sena.edu.co",
      telefono: "311 987 6543",
      profesion: "Administradora de Empresas",
      estado: "activo",
      fichasAsignadas: 5
    }
  ];

  const columnas: ColumnaDef<Instructor>[] = [
    {
      key: "nombres",
      header: "Instructor",
      render: (i) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{i.nombres} {i.apellidos}</span>
          <span className="text-xs text-text-secondary">{i.documento}</span>
        </div>
      )
    },
    {
      key: "contacto",
      header: "Contacto",
      render: (i) => (
        <div className="flex flex-col">
          <span className="text-sm">{i.email}</span>
          <span className="text-xs text-text-secondary">{i.telefono}</span>
        </div>
      )
    },
    {
      key: "profesion",
      header: "Perfil Profesional",
      render: (i) => <span className="text-sm">{i.profesion}</span>
    },
    {
      key: "fichasAsignadas",
      header: "Carga",
      align: "center",
      render: (i) => (
        <div className="flex flex-col items-center">
          <span className="font-medium">{i.fichasAsignadas}</span>
          <span className="text-[10px] text-text-secondary">Fichas</span>
        </div>
      )
    },
    {
      key: "estado",
      header: "Estado",
      render: (i) => <StatusBadge estado={i.estado} />
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1 input-with-icon">
            <Search size={16} className="input-icon" />
            <Input 
              placeholder="Buscar por nombre, documento o correo..." 
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
            <Plus size={16} className="mr-2" /> Nuevo Instructor
          </Button>
        </div>
      </div>

      <DataTable 
        data={instructores} 
        columnas={columnas} 
        isLoading={loading} 
      />
    </div>
  );
}
