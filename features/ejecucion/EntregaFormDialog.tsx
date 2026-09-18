"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createEntrega, updateEntrega, evaluarEntregaAction } from "@/actions/entregas.actions";
import { toast } from "sonner";
import { X, UploadCloud } from "lucide-react";

interface EntregaFormDialogProps {
  entrega?: any;
  actividades: { id: string; nombre: string }[];
  aprendices: { id: string; nombres: string; apellidos: string; numeroDocumento: string }[];
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const ESTADOS = [
  { value: "PENDIENTE", label: "Pendiente de Calificación" },
  { value: "APROBADA", label: "Aprobada (Juicio Positivo)" },
  { value: "NO_APROBADA", label: "No Aprobada (Requiere Mejora)" },
  { value: "CALIFICADA", label: "Calificada" },
  { value: "TARDIA", label: "Entrega Tardía" },
];

export function EntregaFormDialog({ entrega, actividades, aprendices, onClose, onSuccess }: EntregaFormDialogProps) {
  const { data: session } = useSession();
  const userRole = ((session?.user as any)?.role || "").toUpperCase();
  const isAprendiz = userRole.includes("APRENDIZ");

  const [loading, setLoading] = useState(false);
  const isEditing = !!entrega;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const estado = formData.get("estado") as string;
    const data = {
      actividadId: formData.get("actividadId") as string,
      aprendizId: formData.get("aprendizId") as string,
      estado: estado as any,
      fechaEntrega: formData.get("fechaEntrega") as string,
      calificacion: formData.get("calificacion") as string,
      urlArchivo: formData.get("urlArchivo") as string,
      comentario: formData.get("comentario") as string,
      retroalimentacion: formData.get("retroalimentacion") as string,
    };

    try {
      if (isEditing) {
        // Si el instructor califica o evalúa
        const res = await evaluarEntregaAction(entrega.id, {
          estado: (estado === "APROBADA" || estado === "NO_APROBADA" ? estado : "CALIFICADA") as any,
          calificacion: data.calificacion,
          retroalimentacion: data.retroalimentacion,
        });
        if (res.error) throw new Error(res.error);
        toast.success("Evaluación y retroalimentación guardadas");
      } else {
        const res = await createEntrega(data);
        if (res.error) throw new Error(res.error);
        toast.success("Entrega registrada correctamente");
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
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f0fdf4] text-[#267000] rounded-lg border border-[#bbf7d0]">
              <UploadCloud size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? "Calificar / Evaluar Evidencia" : "Registrar Entrega de Evidencia"}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing ? `Evaluación formativa para: ${entrega.aprendiz?.nombres || "Aprendiz"}` : "Adjuntar evidencia de aprendizaje"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Actividad *</label>
            <select name="actividadId" defaultValue={entrega?.actividadId || ""} required className={selectClass} disabled={isEditing}>
              <option value="" disabled>Seleccione una actividad</option>
              {actividades.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Aprendiz *</label>
            <select name="aprendizId" defaultValue={entrega?.aprendizId || ""} required className={selectClass} disabled={isEditing}>
              <option value="" disabled>Seleccione un aprendiz</option>
              {aprendices.map(a => (
                <option key={a.id} value={a.id}>{a.nombres} {a.apellidos} - {a.numeroDocumento}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {!isAprendiz && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Estado</label>
                <select name="estado" defaultValue={entrega?.estado || "PENDIENTE"} className={selectClass}>
                  {ESTADOS.map(e => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div className={`space-y-1.5 ${isAprendiz ? 'col-span-2' : ''}`}>
              <label className="text-sm font-medium text-text-primary">Fecha de Entrega</label>
              <Input
                name="fechaEntrega"
                type="datetime-local"
                defaultValue={formatDateForInput(entrega?.fechaEntrega)}
                disabled={isAprendiz}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">URL / Enlace de la Evidencia *</label>
            <Input
              name="urlArchivo"
              type="url"
              required
              defaultValue={entrega?.urlArchivo || ""}
              placeholder="https://drive.google.com/... o enlace de repositorio"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Comentarios del Aprendiz</label>
            <Input
              name="comentario"
              defaultValue={entrega?.comentario || ""}
              placeholder="Observaciones o notas sobre la evidencia..."
            />
          </div>

          {!isAprendiz && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">Calificación (0 - 5.0)</label>
                  <Input
                    name="calificacion"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    defaultValue={entrega?.calificacion}
                    placeholder="Ej: 4.5"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Retroalimentación</label>
                <textarea
                  name="retroalimentacion"
                  defaultValue={entrega?.retroalimentacion}
                  rows={3}
                  placeholder="Comentarios sobre la entrega..."
                  className={selectClass + " h-auto resize-none"}
                />
              </div>
            </>
          )}

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-3 border-t mt-6 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Registrar Entrega"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
