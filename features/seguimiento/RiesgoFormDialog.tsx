"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createRiesgo, updateRiesgo } from "@/actions/riesgos.actions";
import { toast } from "sonner";
import { X, AlertTriangle } from "lucide-react";

interface RiesgoFormDialogProps {
  riesgo?: any;
  aprendices: { id: string; nombres: string; apellidos: string; numeroDocumento: string; ficha: { codigo: string } }[];
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const TIPOS_RIESGO = [
  { value: "ACADEMICO", label: "Académico" },
  { value: "DISCIPLINARIO", label: "Disciplinario" },
  { value: "DESERCION", label: "Deserción" },
  { value: "PSICOSOCIAL", label: "Psicosocial" },
];

const NIVELES = [
  { value: "BAJO", label: "Bajo" },
  { value: "MEDIO", label: "Medio" },
  { value: "ALTO", label: "Alto" },
];

const ESTADOS = [
  { value: "DETECTADO", label: "Detectado" },
  { value: "EN_SEGUIMIENTO", label: "En Seguimiento" },
  { value: "CERRADO", label: "Cerrado" },
];

export function RiesgoFormDialog({ riesgo, aprendices, onClose, onSuccess }: RiesgoFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!riesgo;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      aprendizId: formData.get("aprendizId") as string,
      tipo: formData.get("tipo") as string,
      nivel: formData.get("nivel") as string,
      descripcion: formData.get("descripcion") as string,
      fechaDeteccion: formData.get("fechaDeteccion") as string,
      estado: formData.get("estado") as string,
      planAccion: formData.get("planAccion") as string,
    };

    try {
      if (isEditing) {
        const res = await updateRiesgo(riesgo.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Riesgo actualizado correctamente");
      } else {
        const res = await createRiesgo(data);
        if (res.error) throw new Error(res.error);
        toast.success("Alerta de riesgo registrada correctamente");
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
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEditing ? "Editar Alerta de Riesgo" : "Registrar Alerta de Riesgo"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing ? `Editando riesgo de: ${riesgo.aprendiz.nombres}` : "Reportar situación de riesgo de un aprendiz"}
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
            <select name="aprendizId" defaultValue={riesgo?.aprendizId || ""} required className={selectClass} disabled={isEditing}>
              <option value="" disabled>Seleccione un aprendiz</option>
              {aprendices.map(a => (
                <option key={a.id} value={a.id}>{a.nombres} {a.apellidos} - {a.numeroDocumento} (Ficha: {a.ficha.codigo})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Tipo de Riesgo *</label>
              <select name="tipo" defaultValue={riesgo?.tipo || "ACADEMICO"} className={selectClass}>
                {TIPOS_RIESGO.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Nivel de Riesgo *</label>
              <select name="nivel" defaultValue={riesgo?.nivel || "MEDIO"} className={selectClass}>
                {NIVELES.map(n => (
                  <option key={n.value} value={n.value}>{n.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Descripción del Problema / Motivo *</label>
            <textarea
              name="descripcion"
              defaultValue={riesgo?.descripcion}
              required
              rows={3}
              placeholder="Describa el motivo de la alerta..."
              className={selectClass + " h-auto resize-none"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Fecha de Detección *</label>
              <Input
                name="fechaDeteccion"
                type="datetime-local"
                defaultValue={formatDateForInput(riesgo?.fechaDeteccion) || formatDateForInput(new Date().toISOString())}
                required
              />
            </div>
            {isEditing && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Estado *</label>
                <select name="estado" defaultValue={riesgo?.estado || "DETECTADO"} className={selectClass}>
                  {ESTADOS.map(e => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Plan de Acción / Compromisos</label>
            <textarea
              name="planAccion"
              defaultValue={riesgo?.planAccion}
              rows={3}
              placeholder="Medidas a tomar, remisión a bienestar, compromisos del aprendiz..."
              className={selectClass + " h-auto resize-none"}
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-3 border-t mt-6 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar Alerta" : "Registrar Alerta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
