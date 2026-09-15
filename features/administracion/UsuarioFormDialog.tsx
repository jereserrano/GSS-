"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUser, updateUser } from "@/actions/user.actions";
import { toast } from "sonner";
import { X } from "lucide-react";

interface UsuarioFormDialogProps {
  user?: any;
  roles: any[];
  onClose: () => void;
}

export function UsuarioFormDialog({ user, roles, onClose }: UsuarioFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!user;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nombre: formData.get("nombre") as string,
      email: formData.get("email") as string,
      rolId: formData.get("rolId") as string,
      password: formData.get("password") as string,
      estado: formData.get("estado") as string,
    };

    try {
      if (isEditing) {
        const res = await updateUser(user.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Usuario actualizado correctamente");
      } else {
        const res = await createUser(data);
        if (res.error) throw new Error(res.error);
        toast.success("Usuario creado correctamente");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre completo</label>
            <Input name="nombre" defaultValue={user?.nombre} required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Correo electrónico</label>
            <Input type="email" name="email" defaultValue={user?.email} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rol</label>
            <select 
              name="rolId" 
              defaultValue={user?.rolId} 
              required
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Seleccione un rol</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Contraseña {isEditing && <span className="text-gray-400 font-normal">(Dejar en blanco para mantener actual)</span>}
            </label>
            <Input type="password" name="password" required={!isEditing} />
          </div>

          {isEditing && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <select 
                name="estado" 
                defaultValue={user?.estado}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Usuario"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
