"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInstitucion, updateInstitucion } from "@/actions/institucion.actions";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { Institucion } from "@/types/institucion.types";

interface InstitucionFormDialogProps {
  institucion?: Institucion;
  onClose: () => void;
  onSuccess: () => void;
}

export function InstitucionFormDialog({ institucion, onClose, onSuccess }: InstitucionFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!institucion;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nit: formData.get("nit") as string,
      nombre: formData.get("nombre") as string,
      municipio: formData.get("municipio") as string,
      departamento: formData.get("departamento") as string,
      direccion: formData.get("direccion") as string,
      telefono: formData.get("telefono") as string,
      email: formData.get("email") as string,
      rector: formData.get("rector") as string,
      estado: formData.get("estado") as string,
    };

    try {
      if (isEditing && institucion) {
        const res = await updateInstitucion(institucion.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Institución actualizada correctamente");
      } else {
        const res = await createInstitucion(data);
        if (res.error) throw new Error(res.error);
        toast.success("Institución creada correctamente");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{isEditing ? "Editar Institución" : "Nueva Institución"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">NIT</label>
              <Input name="nit" defaultValue={institucion?.nit} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre de la Institución</label>
              <Input name="nombre" defaultValue={institucion?.nombre} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Departamento</label>
              <Input name="departamento" defaultValue={institucion?.departamento || "Magdalena"} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Municipio</label>
              <Input name="municipio" defaultValue={institucion?.municipio} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dirección</label>
              <Input name="direccion" defaultValue={institucion?.direccion} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono</label>
              <Input name="telefono" defaultValue={institucion?.telefono || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Correo Electrónico</label>
              <Input type="email" name="email" defaultValue={institucion?.email || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Rector</label>
              <Input name="rector" defaultValue={institucion?.rector || ""} />
            </div>

            {isEditing && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <select 
                  name="estado" 
                  defaultValue={institucion?.estado}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Institución"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
