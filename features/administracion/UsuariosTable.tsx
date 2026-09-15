"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Download } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { formatDateShort } from "@/lib/utils";
import { UsuarioFormDialog } from "./UsuarioFormDialog";
import { deleteUser, exportUsuariosCSV } from "@/actions/user.actions";
import { toast } from "sonner";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  ultimoAcceso: string;
  estado: "activo" | "inactivo" | "bloqueado";
}

interface UsuariosTableProps {
  initialUsers: any[];
  roles: any[];
}

export function UsuariosTable({ initialUsers, roles }: UsuariosTableProps) {
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleEdit = (user: any) => {
    // Find the raw user object with rolId and other exact fields
    const rawUser = initialUsers.find(u => u.id === user.id);
    setSelectedUser(rawUser || user);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.")) {
      setLoading(true);
      try {
        const res = await deleteUser(id);
        if (res.error) throw new Error(res.error);
        toast.success("Usuario eliminado correctamente");
      } catch (error: any) {
        toast.error(error.message || "Error al eliminar usuario");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportUsuariosCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "usuarios_export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Listado exportado correctamente");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setExporting(false);
    }
  };

  const usuarios: Usuario[] = initialUsers.map(u => ({
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    rol: u.rol?.nombre || "Sin Rol",
    ultimoAcceso: u.ultimoAcceso ? new Date(u.ultimoAcceso).toISOString() : new Date().toISOString(),
    estado: u.estado.toLowerCase() as any
  }));
  // Los usuarios se inyectan desde las props

  const columnas: ColumnaDef<Usuario>[] = [
    {
      key: "nombre",
      header: "Usuario",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-sena-100 text-sena-700 flex items-center justify-center font-bold text-xs">
            {u.nombre.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-text-primary">{u.nombre}</span>
            <span className="text-xs text-text-secondary">{u.email}</span>
          </div>
        </div>
      )
    },
    {
      key: "rol",
      header: "Rol de Acceso",
      render: (u) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {u.rol}
        </span>
      )
    },
    {
      key: "ultimoAcceso",
      header: "Último Acceso",
      render: (u) => <span className="text-sm">{formatDateShort(u.ultimoAcceso)}</span>
    },
    {
      key: "estado",
      header: "Estado",
      render: (u) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
          ${u.estado === 'activo' ? 'bg-success-50 text-success-700' : 
            u.estado === 'inactivo' ? 'bg-slate-100 text-slate-500' : 'bg-danger-50 text-danger-700'}`}
        >
          {u.estado}
        </span>
      )
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      render: (u) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => handleEdit(u)}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" className="text-danger-600 hover:text-danger-700 hover:bg-danger-50" onClick={() => handleDelete(u.id)}>
            Eliminar
          </Button>
        </div>
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
              placeholder="Buscar usuario..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-surface pl-9"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-surface" onClick={handleExport} disabled={exporting}>
            <Download size={16} className="mr-2" /> {exporting ? "Exportando..." : "Exportar"}
          </Button>
          <Button onClick={handleNew}>
            <Plus size={16} className="mr-2" /> Nuevo Usuario
          </Button>
        </div>
      </div>
      <DataTable data={usuarios} columnas={columnas} isLoading={loading} />
      
      {dialogOpen && (
        <UsuarioFormDialog 
          user={selectedUser} 
          roles={roles} 
          onClose={() => setDialogOpen(false)} 
        />
      )}
    </div>
  );
}
