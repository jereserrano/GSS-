"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInstructor, updateInstructor } from "@/actions/instructores.actions";
import { toast } from "sonner";
import { X, UserCheck } from "lucide-react";

interface InstructorFormDialogProps {
  instructor?: any;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const TIPOS_DOC = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "PP", label: "Pasaporte" },
];

export function InstructorFormDialog({ instructor, onClose, onSuccess }: InstructorFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!instructor;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      tipoDocumento: formData.get("tipoDocumento") as string,
      numeroDocumento: formData.get("numeroDocumento") as string,
      nombres: formData.get("nombres") as string,
      apellidos: formData.get("apellidos") as string,
      email: formData.get("email") as string,
      telefono: formData.get("telefono") as string,
      profesion: formData.get("profesion") as string,
      estado: formData.get("estado") as string,
    };

    try {
      if (isEditing) {
        const res = await updateInstructor(instructor.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Instructor actualizado correctamente");
      } else {
        const res = await createInstructor(data);
        if (res.error) throw new Error(res.error);
        toast.success("Instructor registrado correctamente");
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
            <div className="p-2 bg-orange-50 rounded-lg">
              <UserCheck size={20} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEditing ? "Editar Instructor" : "Nuevo Instructor"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing ? `Editando: ${instructor.nombres} ${instructor.apellidos}` : "Registrar un nuevo instructor SENA"}
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
              <label className="text-sm font-medium text-text-primary">Tipo de Doc.</label>
              <select name="tipoDocumento" defaultValue={instructor?.tipoDocumento || "CC"} className={selectClass}>
                {TIPOS_DOC.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Número de Documento *</label>
              <Input
                name="numeroDocumento"
                defaultValue={instructor?.numeroDocumento}
                required
                placeholder="Ej: 1082345678"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Nombres *</label>
              <Input
                name="nombres"
                defaultValue={instructor?.nombres}
                required
                placeholder="Ej: Andrés Felipe"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Apellidos *</label>
              <Input
                name="apellidos"
                defaultValue={instructor?.apellidos}
                required
                placeholder="Ej: Gómez Torres"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Correo Electrónico *</label>
              <Input
                name="email"
                type="email"
                defaultValue={instructor?.email}
                required
                placeholder="Ej: agomezt@sena.edu.co"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Teléfono</label>
              <Input
                name="telefono"
                defaultValue={instructor?.telefono}
                placeholder="Ej: 300 123 4567"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Perfil Profesional</label>
            <Input
              name="profesion"
              defaultValue={instructor?.profesion}
              placeholder="Ej: Ingeniero de Sistemas"
            />
          </div>

          {isEditing && (
            <div className="space-y-1.5 w-1/2">
              <label className="text-sm font-medium text-text-primary">Estado</label>
              <select name="estado" defaultValue={instructor?.estado || "ACTIVO"} className={selectClass}>
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
              {loading ? "Guardando..." : isEditing ? "Actualizar Instructor" : "Registrar Instructor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
