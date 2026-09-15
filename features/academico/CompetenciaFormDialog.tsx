"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCompetencia, updateCompetencia } from "@/actions/competencias.actions";
import { toast } from "sonner";
import { X, BookOpen } from "lucide-react";

interface CompetenciaFormDialogProps {
  competencia?: any;
  programas: { id: string; codigo: string; nombre: string }[];
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const TIPOS = [
  { value: "TECNICA", label: "Técnica" },
  { value: "TRANSVERSAL", label: "Transversal" },
  { value: "BASICA", label: "Básica" },
];

export function CompetenciaFormDialog({ competencia, programas, onClose, onSuccess }: CompetenciaFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!competencia;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      codigo: formData.get("codigo") as string,
      nombre: formData.get("nombre") as string,
      programaId: formData.get("programaId") as string,
      tipo: formData.get("tipo") as string,
      duracionHoras: formData.get("duracionHoras") as string,
      estado: formData.get("estado") as string,
    };

    try {
      if (isEditing) {
        const res = await updateCompetencia(competencia.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Competencia actualizada correctamente");
      } else {
        const res = await createCompetencia(data);
        if (res.error) throw new Error(res.error);
        toast.success("Competencia registrada correctamente");
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
            <div className="p-2 bg-indigo-50 rounded-lg">
              <BookOpen size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEditing ? "Editar Competencia" : "Nueva Competencia"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing ? `Editando: ${competencia.codigo}` : "Registrar una competencia de formación"}
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
                defaultValue={competencia?.codigo}
                required
                placeholder="Ej: 220501096"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Duración (Horas) *</label>
              <Input
                name="duracionHoras"
                type="number"
                min="1"
                defaultValue={competencia?.duracionHoras}
                required
                placeholder="Ej: 180"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Nombre de la Competencia *</label>
            <textarea
              name="nombre"
              defaultValue={competencia?.nombre}
              required
              rows={3}
              placeholder="Ej: Implementar la arquitectura del software..."
              className={selectClass + " h-auto resize-none"}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Programa Asociado *</label>
            <select name="programaId" defaultValue={competencia?.programaId || ""} required className={selectClass}>
              <option value="" disabled>Seleccione un programa</option>
              {programas.map(p => (
                <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Tipo</label>
              <select name="tipo" defaultValue={competencia?.tipo || "TECNICA"} className={selectClass}>
                {TIPOS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            {isEditing && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Estado</label>
                <select name="estado" defaultValue={competencia?.estado || "ACTIVO"} className={selectClass}>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-3 border-t mt-6 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar Competencia" : "Registrar Competencia"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
