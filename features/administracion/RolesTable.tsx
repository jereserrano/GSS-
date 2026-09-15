"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Shield } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  usuariosAsignados: number;
}

export function RolesTable() {
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const roles: Rol[] = [
    {
      id: "rol-1",
      nombre: "Administrador Sistema",
      descripcion: "Acceso total a todos los módulos y configuraciones.",
      usuariosAsignados: 3
    },
    {
      id: "rol-2",
      nombre: "Coordinador Académico",
      descripcion: "Gestión de fichas, programas y reportes de seguimiento.",
      usuariosAsignados: 12
    },
    {
      id: "rol-3",
      nombre: "Instructor",
      descripcion: "Gestión de sus fichas asignadas, asistencia y evaluaciones.",
      usuariosAsignados: 145
    }
  ];

  const columnas: ColumnaDef<Rol>[] = [
    {
      key: "nombre",
      header: "Rol de Seguridad",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-sena-500" />
          <span className="font-bold text-text-primary">{r.nombre}</span>
        </div>
      )
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (r) => <span className="text-sm text-text-secondary">{r.descripcion}</span>
    },
    {
      key: "usuariosAsignados",
      header: "Usuarios con este rol",
      align: "center",
      render: (r) => (
        <span className="font-medium bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs">
          {r.usuariosAsignados} usuarios
        </span>
      )
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      render: (r) => (
        <Button variant="ghost" size="sm" className="text-primary">
          Permisos
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <Input 
              placeholder="Buscar rol..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-surface pl-9"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button>
            <Plus size={16} className="mr-2" /> Crear Rol
          </Button>
        </div>
      </div>
      <DataTable data={roles} columnas={columnas} isLoading={loading} />
    </div>
  );
}
