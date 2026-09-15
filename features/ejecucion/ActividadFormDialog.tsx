"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createActividad, updateActividad } from "@/actions/actividades.actions";
import { toast } from "sonner";
import { X, ClipboardList } from "lucide-react";

interface ActividadFormDialogProps {
  actividad?: any;
  fichas: { id: string; codigo: string; programa: { nombre: string } }[];
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const TIPOS_ACT = [
  { value: "TALLER", label: "Taller" },
  { value: "PROYECTO", label: "Proyecto" },
  { value: "FORO", label: "Foro" },
  { value: "EVALUACION", label: "Evaluación" },
];

export function ActividadFormDialog({ actividad, fichas, onClose, onSuccess }: ActividadFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!actividad;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      codigo: formData.get("codigo") as string,
      nombre: formData.get("nombre") as string,
      descripcion: formData.get("descripcion") as string,
      tipo: formData.get("tipo") as string,
      fichaId: formData.get("fichaId") as string,
      fechaInicio: formData.get("fechaInicio") as string,
      fechaFin: formData.get("fechaFin") as string,
    };

    try {
      if (isEditing) {
        const res = await updateActividad(actividad.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Actividad actualizada correctamente");
      } else {
        const res = await createActividad(data);
        if (res.error) throw new Error(res.error);
        toast.success("Actividad registrada correctamente");
      }
      
      if (onSuccess) await onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col my-8">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-50 rounded-lg">
              <ClipboardList size={20} className="text-pink-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEditing ? "Editar Actividad" : "Nueva Actividad"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing ? `Editando: ${actividad.nombre}` : "Crear una nueva actividad para una ficha"}
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
              <label className="text-sm font-medium text-text-primary">Código *</label>
              <Input
                name="codigo"
                defaultValue={actividad?.codigo}
                required
                placeholder="Ej: ACT-01"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Tipo de Actividad *</label>
              <select name="tipo" defaultValue={actividad?.tipo || "TALLER"} className={selectClass}>
                {TIPOS_ACT.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Nombre de la Actividad *</label>
            <Input
              name="nombre"
              defaultValue={actividad?.nombre}
              required
              placeholder="Ej: Taller Modelo Entidad Relación"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Descripción</label>
            <textarea
              name="descripcion"
              defaultValue={actividad?.descripcion}
              rows={3}
              placeholder="Instrucciones o detalles de la actividad..."
              className={selectClass + " h-auto resize-none"}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Ficha Asignada *</label>
            <select name="fichaId" defaultValue={actividad?.fichaId || ""} required className={selectClass}>
              <option value="" disabled>Seleccione una ficha</option>
              {fichas.map(f => (
                <option key={f.id} value={f.id}>{f.codigo} - {f.programa.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Fecha de Inicio *</label>
              <Input
                name="fechaInicio"
                type="datetime-local"
                defaultValue={formatDateForInput(actividad?.fechaInicio)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Fecha de Vencimiento *</label>
              <Input
                name="fechaFin"
                type="datetime-local"
                defaultValue={formatDateForInput(actividad?.fechaFin)}
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-3 border-t mt-6 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar Actividad" : "Crear Actividad"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
