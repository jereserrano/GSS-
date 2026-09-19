"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPrograma, updatePrograma } from "@/actions/programas.actions";
import { toast } from "sonner";
import { X, GraduationCap } from "lucide-react";

interface ProgramaFormDialogProps {
  programa?: any;
  onClose: () => void;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const NIVELES = [
  { value: "TECNICO", label: "Técnico" },
  { value: "TECNOLOGO", label: "Tecnólogo" },
  { value: "OPERARIO", label: "Operario" },
];

export function ProgramaFormDialog({ programa, onClose }: ProgramaFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!programa;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      codigo:         formData.get("codigo") as string,
      nombre:         formData.get("nombre") as string,
      nivelFormacion: formData.get("nivelFormacion") as string,
      estado:         (formData.get("estado") as string) || "ACTIVO",
    };

    try {
      if (isEditing) {
        const res = await updatePrograma(programa.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Programa actualizado correctamente");
      } else {
        const res = await createPrograma(data);
        if (res.error) throw new Error(res.error);
        toast.success("Programa registrado correctamente");
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-verde-50 rounded-lg">
              <GraduationCap size={20} className="text-verde-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEditing ? "Editar Programa" : "Nuevo Programa"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing ? `Editando: ${programa.nombre}` : "Registrar un programa de formación SENA"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Código SENA *</label>
            <Input
              name="codigo"
              defaultValue={programa?.codigo}
              required
              placeholder="Ej: 228106"
              className="font-mono"
            />
            <p className="text-xs text-text-secondary">Código oficial del programa en el SENA.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Nombre del Programa *</label>
            <Input
              name="nombre"
              defaultValue={programa?.nombre}
              required
              placeholder="Ej: Técnico en Sistemas"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Nivel de Formación</label>
              <select name="nivelFormacion" defaultValue={programa?.nivelFormacion || "TECNICO"} className={selectClass}>
                {NIVELES.map(n => (
                  <option key={n.value} value={n.value}>{n.label}</option>
                ))}
              </select>
            </div>
            {isEditing && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Estado</label>
                <select name="estado" defaultValue={programa?.estado || "ACTIVO"} className={selectClass}>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar Programa" : "Registrar Programa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
