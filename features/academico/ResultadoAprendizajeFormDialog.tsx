"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createResultadoAprendizaje, updateResultadoAprendizaje } from "@/actions/resultados_aprendizaje.actions";
import { toast } from "sonner";
import { X, Target } from "lucide-react";

interface ResultadoAprendizajeFormDialogProps {
  resultado?: any;
  competencias: { id: string; codigo: string; nombre: string }[];
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const FASES = [
  { value: "ANALISIS", label: "Análisis" },
  { value: "PLANEACION", label: "Planeación" },
  { value: "EJECUCION", label: "Ejecución" },
  { value: "EVALUACION", label: "Evaluación" },
];

export function ResultadoAprendizajeFormDialog({ resultado, competencias, onClose, onSuccess }: ResultadoAprendizajeFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!resultado;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      codigo: formData.get("codigo") as string,
      nombre: formData.get("nombre") as string,
      competenciaId: formData.get("competenciaId") as string,
      fase: formData.get("fase") as string,
    };

    try {
      if (isEditing) {
        const res = await updateResultadoAprendizaje(resultado.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("RAP actualizado correctamente");
      } else {
        const res = await createResultadoAprendizaje(data);
        if (res.error) throw new Error(res.error);
        toast.success("RAP registrado correctamente");
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
            <div className="p-2 bg-blue-50 rounded-lg">
              <Target size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEditing ? "Editar Resultado de Aprendizaje" : "Nuevo Resultado de Aprendizaje"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing ? `Editando: ${resultado.codigo}` : "Registrar un RAP para una competencia"}
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
                defaultValue={resultado?.codigo}
                required
                placeholder="Ej: RAP1"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Fase del Proyecto *</label>
              <select name="fase" defaultValue={resultado?.fase || "ANALISIS"} className={selectClass}>
                {FASES.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Descripción del RAP *</label>
            <textarea
              name="nombre"
              defaultValue={resultado?.nombre}
              required
              rows={3}
              placeholder="Ej: Interpretar el informe de requisitos..."
              className={selectClass + " h-auto resize-none"}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Competencia Asociada *</label>
            <select name="competenciaId" defaultValue={resultado?.competenciaId || ""} required className={selectClass}>
              <option value="" disabled>Seleccione una competencia</option>
              {competencias.map(c => (
                <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-3 border-t mt-6 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar RAP" : "Registrar RAP"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
