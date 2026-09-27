"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCriterioEvaluacion } from "@/actions/criterios.actions";
import { toast } from "sonner";
import { X, CheckCircle } from "lucide-react";

interface CriterioFormDialogProps {
  resultadoAprendizajeId: string;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

export function CriterioEvaluacionFormDialog({ resultadoAprendizajeId, onClose, onSuccess }: CriterioFormDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      codigo: formData.get("codigo") as string,
      descripcion: formData.get("descripcion") as string,
      resultadoAprendizajeId,
    };

    try {
      const res = await createCriterioEvaluacion(data);
      if (res.error) throw new Error(res.error);
      toast.success("Criterio de Evaluación registrado correctamente");
      
      if (onSuccess) await onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-orange-50">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-orange-900">
            <CheckCircle className="w-5 h-5" />
            Nuevo Criterio de Evaluación
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-orange-100 text-orange-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Código (Opcional)</label>
            <Input name="codigo" placeholder="Ej: CE01" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Descripción <span className="text-red-500">*</span></label>
            <textarea
              name="descripcion"
              required
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describa el criterio de evaluación..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? "Guardando..." : "Guardar Criterio"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
