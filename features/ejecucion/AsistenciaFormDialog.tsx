"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAsistencia, updateAsistencia } from "@/actions/asistencia.actions";
import { toast } from "sonner";
import { X, CalendarCheck } from "lucide-react";

interface AsistenciaFormDialogProps {
  asistencia?: any;
  fichas: { id: string; codigo: string; programa: { nombre: string } }[];
  instructores: { id: string; nombres: string; apellidos: string }[];
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const ESTADOS = [
  { value: "PROGRAMADA", label: "Programada" },
  { value: "EN_CURSO", label: "En Curso" },
  { value: "FINALIZADA", label: "Finalizada" },
  { value: "CANCELADA", label: "Cancelada" },
];

export function AsistenciaFormDialog({ asistencia, fichas, instructores, onClose, onSuccess }: AsistenciaFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!asistencia;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      fichaId: formData.get("fichaId") as string,
      instructorId: formData.get("instructorId") as string,
      fecha: formData.get("fecha") as string,
      tema: formData.get("tema") as string,
      estado: formData.get("estado") as string,
    };

    try {
      if (isEditing) {
        const res = await updateAsistencia(asistencia.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Sesión actualizada correctamente");
      } else {
        const res = await createAsistencia(data);
        if (res.error) throw new Error(res.error);
        toast.success("Sesión de asistencia programada correctamente");
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
            <div className="p-2 bg-teal-50 rounded-lg">
              <CalendarCheck size={20} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEditing ? "Editar Sesión de Asistencia" : "Programar Nueva Sesión"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing ? `Editando sesión del: ${new Date(asistencia.fecha).toLocaleDateString()}` : "Registrar una nueva clase para tomar asistencia"}
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
            <label className="text-sm font-medium text-text-primary">Ficha / Grupo *</label>
            <select name="fichaId" defaultValue={asistencia?.fichaId || ""} required className={selectClass} disabled={isEditing}>
              <option value="" disabled>Seleccione una ficha</option>
              {fichas.map(f => (
                <option key={f.id} value={f.id}>{f.codigo} - {f.programa.nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Instructor Asignado *</label>
            <select name="instructorId" defaultValue={asistencia?.instructorId || ""} required className={selectClass}>
              <option value="" disabled>Seleccione un instructor</option>
              {instructores.map(i => (
                <option key={i.id} value={i.id}>{i.nombres} {i.apellidos}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Fecha de la Sesión *</label>
              <Input
                name="fecha"
                type="datetime-local"
                defaultValue={formatDateForInput(asistencia?.fecha) || formatDateForInput(new Date().toISOString())}
                required
              />
            </div>
            {isEditing && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Estado</label>
                <select name="estado" defaultValue={asistencia?.estado || "PROGRAMADA"} className={selectClass}>
                  {ESTADOS.map(e => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Tema de la Sesión</label>
            <Input
              name="tema"
              defaultValue={asistencia?.tema}
              placeholder="Ej: Programación Orientada a Objetos"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-3 border-t mt-6 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar Sesión" : "Programar Sesión"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
