"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSede, updateSede } from "@/actions/sedes.actions";
import { toast } from "sonner";
import { X, MapPin } from "lucide-react";

interface Institucion {
  id: string;
  nombre: string;
}

interface SedeFormDialogProps {
  sede?: any;
  instituciones: Institucion[];
  onClose: () => void;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

export function SedeFormDialog({ sede, instituciones, onClose }: SedeFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!sede;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nombre:         formData.get("nombre") as string,
      institucionId:  formData.get("institucionId") as string,
      direccion:      formData.get("direccion") as string,
      barrio:         formData.get("barrio") as string,
      municipio:      formData.get("municipio") as string,
      esPrincipal:    formData.get("esPrincipal") as string,
      coordinador:    formData.get("coordinador") as string,
      telefono:       formData.get("telefono") as string,
      estado:         formData.get("estado") as string,
    };

    try {
      if (isEditing) {
        const res = await updateSede(sede.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Sede actualizada correctamente");
      } else {
        const res = await createSede(data);
        if (res.error) throw new Error(res.error);
        toast.success("Sede registrada correctamente");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info-50 rounded-lg">
              <MapPin size={20} className="text-info-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEditing ? "Editar Sede" : "Nueva Sede"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing ? `Editando: ${sede.nombre}` : "Registrar una nueva sede educativa"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Institución *</label>
            <select name="institucionId" defaultValue={sede?.institucionId || ""} required className={selectClass}>
              <option value="">Seleccione una institución</option>
              {instituciones.map(i => (
                <option key={i.id} value={i.id}>{i.nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Nombre de la Sede *</label>
            <Input name="nombre" defaultValue={sede?.nombre} required placeholder="Ej: Sede Principal / Sede Norte" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Municipio</label>
              <Input name="municipio" defaultValue={sede?.municipio} placeholder="Ej: Santa Marta" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Barrio</label>
              <Input name="barrio" defaultValue={sede?.barrio} placeholder="Ej: El Pando" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Dirección</label>
            <Input name="direccion" defaultValue={sede?.direccion} placeholder="Calle / Carrera / Avenida..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Coordinador</label>
              <Input name="coordinador" defaultValue={sede?.coordinador} placeholder="Nombre del coordinador" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Teléfono</label>
              <Input name="telefono" defaultValue={sede?.telefono} placeholder="300 000 0000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">¿Es sede principal?</label>
              <select name="esPrincipal" defaultValue={sede?.esPrincipal ? "true" : "false"} className={selectClass}>
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>
            {isEditing && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Estado</label>
                <select name="estado" defaultValue={sede?.estado || "ACTIVO"} className={selectClass}>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            disabled={loading}
            onClick={() => {
              const form = document.querySelector<HTMLFormElement>("form");
              form?.requestSubmit();
            }}
          >
            {loading ? "Guardando..." : isEditing ? "Actualizar Sede" : "Registrar Sede"}
          </Button>
        </div>
      </div>
    </div>
  );
}
