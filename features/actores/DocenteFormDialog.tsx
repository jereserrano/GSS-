"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDocente, updateDocente } from "@/actions/docentes.actions";
import { toast } from "sonner";
import { X, Users } from "lucide-react";

interface DocenteFormDialogProps {
  docente?: any;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

export function DocenteFormDialog({ docente, onClose, onSuccess }: DocenteFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!docente;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nombres: formData.get("nombres") as string,
      apellidos: formData.get("apellidos") as string,
      email: formData.get("email") as string,
      telefono: formData.get("telefono") as string,
      asignatura: formData.get("asignatura") as string,
      institucionNombre: formData.get("institucionNombre") as string,
      sedeNombre: formData.get("sedeNombre") as string,
      estado: formData.get("estado") as string,
    };

    try {
      if (isEditing) {
        const res = await updateDocente(docente.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Docente actualizado correctamente");
      } else {
        const res = await createDocente(data);
        if (res.error) throw new Error(res.error);
        toast.success("Docente registrado correctamente");
      }
      
      if (onSuccess) await onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col my-8">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEditing ? "Editar Docente Par" : "Nuevo Docente Par"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing ? `Editando: ${docente.nombres} ${docente.apellidos}` : "Registrar un docente de colegio"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Nombres *</label>
              <Input
                name="nombres"
                defaultValue={docente?.nombres}
                required
                placeholder="Ej: Marta Lucía"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Apellidos *</label>
              <Input
                name="apellidos"
                defaultValue={docente?.apellidos}
                required
                placeholder="Ej: Ramírez"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Correo Electrónico *</label>
              <Input
                name="email"
                type="email"
                defaultValue={docente?.email}
                required
                placeholder="Ej: mramirez@colegio.edu.co"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Teléfono</label>
              <Input
                name="telefono"
                defaultValue={docente?.telefono}
                placeholder="Ej: 320 555 4433"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Asignatura</label>
            <Input
              name="asignatura"
              defaultValue={docente?.asignatura}
              placeholder="Ej: Tecnología e Informática"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Institución Educativa</label>
              <Input
                name="institucionNombre"
                defaultValue={docente?.institucionNombre}
                placeholder="Ej: IED Liceo Celedón"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Sede</label>
              <Input
                name="sedeNombre"
                defaultValue={docente?.sedeNombre}
                placeholder="Ej: Sede Principal"
              />
            </div>
          </div>

          {isEditing && (
            <div className="space-y-1.5 w-1/2">
              <label className="text-sm font-medium text-text-primary">Estado</label>
              <select name="estado" defaultValue={docente?.estado || "ACTIVO"} className={selectClass}>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-3 border-t mt-6 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar Docente" : "Registrar Docente"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
