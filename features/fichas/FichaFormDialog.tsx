"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFicha, updateFicha } from "@/actions/fichas.actions";
import { toast } from "sonner";
import { X, BookOpen } from "lucide-react";

interface FichaFormDialogProps {
  ficha?: any;
  programas: { id: string; codigo: string; nombre: string }[];
  instituciones: { id: string; nombre: string }[];
  sedes: { id: string; nombre: string; institucionId: string }[];
  onClose: () => void;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const JORNADAS = ["Mañana", "Tarde", "Noche", "Fines de Semana", "Completa"];

export function FichaFormDialog({ ficha, programas, instituciones, sedes, onClose }: FichaFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedInstitucionId, setSelectedInstitucionId] = useState<string>(ficha?.institucionId || "");
  const isEditing = !!ficha;

  // Filtrar sedes según institución seleccionada
  const sedesFiltradas = sedes.filter(s => s.institucionId === selectedInstitucionId);

  const toDateInput = (iso?: string) =>
    iso ? new Date(iso).toISOString().split("T")[0] : "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      codigo:        formData.get("codigo") as string,
      programaId:    formData.get("programaId") as string,
      institucionId: formData.get("institucionId") as string,
      sedeId:        formData.get("sedeId") as string,
      fechaInicio:   formData.get("fechaInicio") as string,
      fechaFin:      formData.get("fechaFin") as string,
      jornada:       formData.get("jornada") as string,
      estado:        formData.get("estado") as string,
    };

    try {
      if (isEditing) {
        const res = await updateFicha(ficha.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Ficha actualizada correctamente");
      } else {
        const res = await createFicha(data);
        if (res.error) throw new Error(res.error);
        toast.success("Ficha creada correctamente");
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sena-50 rounded-lg">
              <BookOpen size={20} className="text-sena-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEditing ? "Editar Ficha" : "Nueva Ficha"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing ? `Editando ficha: ${ficha.codigo}` : "Registrar un nuevo grupo de formación"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* Código */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Número de Ficha *</label>
            <Input
              name="codigo"
              defaultValue={ficha?.codigo}
              required
              placeholder="Ej: 2987654"
              className="font-mono"
            />
          </div>

          {/* Programa */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Programa de Formación *</label>
            <select name="programaId" defaultValue={ficha?.programaId || ""} required className={selectClass}>
              <option value="">Seleccione un programa</option>
              {programas.map(p => (
                <option key={p.id} value={p.id}>{p.codigo} — {p.nombre}</option>
              ))}
            </select>
          </div>

          {/* Institución */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Institución Educativa *</label>
            <select
              name="institucionId"
              defaultValue={ficha?.institucionId || ""}
              required
              className={selectClass}
              onChange={(e) => setSelectedInstitucionId(e.target.value)}
            >
              <option value="">Seleccione una institución</option>
              {instituciones.map(i => (
                <option key={i.id} value={i.id}>{i.nombre}</option>
              ))}
            </select>
          </div>

          {/* Sede — filtrada por institución */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Sede *</label>
            <select
              name="sedeId"
              defaultValue={ficha?.sedeId || ""}
              required
              className={selectClass}
              disabled={!selectedInstitucionId}
            >
              <option value="">
                {selectedInstitucionId ? "Seleccione una sede" : "Primero seleccione una institución"}
              </option>
              {sedesFiltradas.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Fecha de Inicio *</label>
              <Input
                type="date"
                name="fechaInicio"
                defaultValue={toDateInput(ficha?.fechaInicio)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Fecha de Fin *</label>
              <Input
                type="date"
                name="fechaFin"
                defaultValue={toDateInput(ficha?.fechaFin)}
                required
              />
            </div>
          </div>

          {/* Jornada y Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Jornada</label>
              <select name="jornada" defaultValue={ficha?.jornada || ""} className={selectClass}>
                <option value="">Sin especificar</option>
                {JORNADAS.map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
            {isEditing && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Estado</label>
                <select name="estado" defaultValue={ficha?.estado || "ACTIVO"} className={selectClass}>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            disabled={loading}
            onClick={() => {
              const form = document.querySelector<HTMLFormElement>("form");
              form?.requestSubmit();
            }}
          >
            {loading ? "Guardando..." : isEditing ? "Actualizar Ficha" : "Crear Ficha"}
          </Button>
        </div>
      </div>
    </div>
  );
}
