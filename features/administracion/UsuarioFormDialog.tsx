"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUser, updateUser } from "@/actions/user.actions";
import { toast } from "sonner";
import { X, ShieldAlert } from "lucide-react";
import { getHierarchyLevel } from "@/lib/hierarchy";

interface UsuarioFormDialogProps {
  user?: any;
  roles: any[];
  instituciones?: any[];
  /** Sesión del usuario en sesión, para filtrar roles asignables. */
  currentUserSession: {
    id: string;
    role: string;
    hierarchyLevel: number;
  };
  onClose: () => void;
}

export function UsuarioFormDialog({ user, roles, instituciones = [], currentUserSession, onClose }: UsuarioFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!user;

  /**
   * Filtra los roles que el usuario en sesión puede asignar.
   * Solo se muestran roles con jerarquía ESTRICTAMENTE INFERIOR a la del solicitante.
   */
  const assignableRoles = roles.filter((rol) => {
    const rolLevel = getHierarchyLevel(rol.nombre);
    return rolLevel > currentUserSession.hierarchyLevel && rolLevel !== 99;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nombre: formData.get("nombre") as string,
      email: formData.get("email") as string,
      rolId: formData.get("rolId") as string,
      institucionId: formData.get("institucionId") as string || null,
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
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
            <Input id="input-nombre-usuario" name="nombre" defaultValue={user?.nombre} required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Correo electrónico</label>
            <Input id="input-email-usuario" type="email" name="email" defaultValue={user?.email} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rol</label>
            {assignableRoles.length === 0 ? (
              <div className="flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700">
                <ShieldAlert size={16} />
                <span>No tiene permisos para asignar roles desde este nivel.</span>
              </div>
            ) : (
              <select 
                id="select-rol-usuario"
                name="rolId" 
                defaultValue={user?.rolId} 
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Seleccione un rol</option>
                {assignableRoles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Institución (Opcional)</label>
            <select 
              id="select-institucion-usuario"
              name="institucionId" 
              defaultValue={user?.institucionId || ""} 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Ninguna / Global</option>
              {instituciones.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.nombre}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500">Útil para Subdirectores, Coordinadores y roles limitados por sede.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Contraseña {isEditing && <span className="text-gray-400 font-normal">(Dejar en blanco para mantener actual)</span>}
            </label>
            <Input id="input-password-usuario" type="password" name="password" required={!isEditing} />
          </div>

          {isEditing && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <select 
                id="select-estado-usuario"
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
            <Button id="btn-cancelar-usuario" type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button
              id="btn-guardar-usuario"
              type="submit"
              disabled={loading || assignableRoles.length === 0}
            >
              {loading ? "Guardando..." : "Guardar Usuario"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
