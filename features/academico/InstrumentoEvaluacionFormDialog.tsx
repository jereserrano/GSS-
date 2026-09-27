"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInstrumentoEvaluacion } from "@/actions/criterios.actions";
import { toast } from "sonner";
import { X, PenTool } from "lucide-react";

interface InstrumentoFormDialogProps {
  criterioEvaluacionId: string;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

export function InstrumentoEvaluacionFormDialog({ criterioEvaluacionId, onClose, onSuccess }: InstrumentoFormDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nombre: formData.get("nombre") as string,
      tipo: formData.get("tipo") as string,
      criterioEvaluacionId,
    };

    try {
      const res = await createInstrumentoEvaluacion(data);
      if (res.error) throw new Error(res.error);
      toast.success("Instrumento de Evaluación registrado correctamente");
      
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
        <div className="flex items-center justify-between p-4 border-b bg-gray-100">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <PenTool className="w-5 h-5" />
            Nuevo Instrumento
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Nombre del Instrumento <span className="text-red-500">*</span></label>
            <Input name="nombre" required placeholder="Ej: Cuestionario unidad 1" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Tipo de Instrumento <span className="text-red-500">*</span></label>
            <select name="tipo" className={selectClass} required>
              <option value="">Seleccione un tipo...</option>
              <option value="CONOCIMIENTO">Conocimiento (Examen, Prueba)</option>
              <option value="DESEMPENO">Desempeño (Observación directa)</option>
              <option value="PRODUCTO">Producto (Entregable, Proyecto)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-gray-800 hover:bg-gray-900 text-white">
              {loading ? "Guardando..." : "Añadir Instrumento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
