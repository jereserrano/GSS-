"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createEvaluacion, updateEvaluacion } from "@/actions/evaluaciones.actions";
import { toast } from "sonner";
import { X, Award } from "lucide-react";

interface EvaluacionFormDialogProps {
  evaluacion?: any;
  raps: { id: string; codigo: string; nombre: string }[];
  aprendices: { id: string; nombres: string; apellidos: string; numeroDocumento: string; ficha: { codigo: string } }[];

  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const JUICIOS = [
  { value: "POR_EVALUAR", label: "Por Evaluar" },
  { value: "APROBADO", label: "A (Aprobado)" },
  { value: "DEFICIENTE", label: "D (Deficiente)" },
];

export function EvaluacionFormDialog({ evaluacion, raps, aprendices, onClose, onSuccess }: EvaluacionFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!evaluacion;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      resultadoAprendizajeId: formData.get("resultadoAprendizajeId") as string,
      aprendizId: formData.get("aprendizId") as string,
      juicio: formData.get("juicio") as string,
      fechaEvaluacion: formData.get("fechaEvaluacion") as string,
      observaciones: formData.get("observaciones") as string,
    };

    try {
      if (isEditing) {
        const res = await updateEvaluacion(evaluacion.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Juicio valorativo actualizado correctamente");
      } else {
        const res = await createEvaluacion(data);
        if (res.error) throw new Error(res.error);
        toast.success("Juicio valorativo registrado correctamente");
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
            <div className="p-2 bg-amber-50 rounded-lg">
              <Award size={20} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEditing ? "Editar Juicio Valorativo" : "Registrar Juicio Valorativo"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing ? `Editando evaluación de: ${evaluacion.aprendiz.nombres}` : "Evaluar un Resultado de Aprendizaje"}
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
            <label className="text-sm font-medium text-text-primary">Aprendiz *</label>
            <select name="aprendizId" defaultValue={evaluacion?.aprendizId || ""} required className={selectClass} disabled={isEditing}>
              <option value="" disabled>Seleccione un aprendiz</option>
              {aprendices.map(a => (
                <option key={a.id} value={a.id}>{a.nombres} {a.apellidos} - {a.numeroDocumento} (Ficha: {a.ficha.codigo})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Resultado de Aprendizaje (RAP) *</label>
            <select name="resultadoAprendizajeId" defaultValue={evaluacion?.resultadoAprendizajeId || ""} required className={selectClass} disabled={isEditing}>
              <option value="" disabled>Seleccione un RAP</option>
              {raps.map(r => (
                <option key={r.id} value={r.id}>{r.codigo} - {r.nombre}</option>
              ))}
            </select>
          </div>



          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Juicio Valorativo</label>
              <select name="juicio" defaultValue={evaluacion?.juicio || "POR_EVALUAR"} className={selectClass}>
                {JUICIOS.map(j => (
                  <option key={j.value} value={j.value}>{j.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Fecha de Evaluación</label>
              <Input
                name="fechaEvaluacion"
                type="datetime-local"
                defaultValue={formatDateForInput(evaluacion?.fechaEvaluacion) || formatDateForInput(new Date().toISOString())}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Observaciones</label>
            <textarea
              name="observaciones"
              defaultValue={evaluacion?.observaciones}
              rows={3}
              placeholder="Comentarios adicionales sobre el desempeño..."
              className={selectClass + " h-auto resize-none"}
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-3 border-t mt-6 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar Juicio" : "Registrar Juicio"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
