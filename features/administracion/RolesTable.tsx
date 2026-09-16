"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Shield, Users, Lock } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { RolFormDialog } from "./RolFormDialog";
import type { RolConConteo } from "@/actions/roles.actions";

interface RolesTableProps {
  initialRoles?: RolConConteo[];
}

export function RolesTable({ initialRoles = [] }: RolesTableProps) {
  const [roles, setRoles] = useState<RolConConteo[]>(initialRoles);
  const [busqueda, setBusqueda] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rolesFiltrados = roles.filter((r) => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      r.nombre.toLowerCase().includes(q) ||
      (r.descripcion && r.descripcion.toLowerCase().includes(q))
    );
  });

  const columnas: ColumnaDef<RolConConteo>[] = [
    {
      key: "nombre",
      header: "Perfil de Seguridad",
      render: (r) => (
        <div className="flex items-center gap-2.5 py-1">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#003F8C] shrink-0">
            <Shield size={16} />
          </div>
          <div>
            <span className="font-semibold text-slate-900 block leading-tight">
              {r.nombre}
            </span>
            <span className="text-[11px] text-slate-400">
              ID: {r.id.slice(0, 10)}...
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "descripcion",
      header: "Descripción y Alcance",
      render: (r) => (
        <span className="text-sm text-slate-600 line-clamp-2 max-w-md">
          {r.descripcion || "Sin descripción asignada"}
        </span>
      ),
    },
    {
      key: "usuariosAsignados",
      header: "Usuarios Vinculados",
      align: "center",
      render: (r) => (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-700 text-xs font-semibold border border-slate-200/60">
          <Users size={13} className="text-slate-500" />
          <span>{r.usuariosAsignados} {r.usuariosAsignados === 1 ? "usuario" : "usuarios"}</span>
        </div>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (r) => (
        <div className="flex justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-[#003F8C] flex items-center gap-1"
          >
            <Lock size={12} className="text-slate-400" />
            <span>Permisos</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Barra superior de búsqueda y acciones */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            placeholder="Buscar por nombre o descripción de rol..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="bg-slate-50/70 border-slate-200 pl-9.5 text-sm h-9.5 placeholder:text-slate-400 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <span className="text-xs text-slate-500 font-medium hidden md:inline">
            {rolesFiltrados.length} {rolesFiltrados.length === 1 ? "rol registrado" : "roles registrados"}
          </span>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#003F8C] hover:bg-[#002d66] text-white text-xs font-semibold px-4 h-9.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Crear Rol</span>
          </Button>
        </div>
      </div>

      {/* Tabla con la información */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <DataTable data={rolesFiltrados} columnas={columnas} />
      </div>

      {/* Modal profesional para Crear Rol */}
      <RolFormDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(nuevoRol) => {
          setRoles((prev) => [
            {
              id: nuevoRol.id,
              nombre: nuevoRol.nombre,
              descripcion: nuevoRol.descripcion,
              usuariosAsignados: 0,
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
}
