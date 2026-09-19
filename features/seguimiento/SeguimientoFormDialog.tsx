"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSeguimiento, updateSeguimiento } from "@/actions/seguimientos.actions";
import { toast } from "sonner";
import { X, MapPin } from "lucide-react";

interface SeguimientoFormDialogProps {
  seguimiento?: any;
  fichas: any[];
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const ESTADOS = [
  { value: "PROGRAMADA", label: "Programada" },
  { value: "REALIZADA", label: "Realizada" },
  { value: "APLAZADA", label: "Aplazada" },
  { value: "CANCELADA", label: "Cancelada" },
];

export function SeguimientoFormDialog({ seguimiento, fichas, onClose, onSuccess }: SeguimientoFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<string>(seguimiento?.fichaId || "");
  const isEditing = !!seguimiento;

  const currentFicha = fichas.find(f => f.id === selectedFicha);
  const aprendices = currentFicha?.aprendices || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: any = {
      fichaId: formData.get("fichaId") as string,
      aprendizId: formData.get("aprendizId") as string,
      fecha: formData.get("fecha") as string,
      responsable: formData.get("responsable") as string,
    };
    
    // We don't send institucionId anymore since it's derived from Ficha in the backend.
    
    const nov = formData.get("novedades");
    if (nov) data.novedades = Number(nov);
    
    const obs = formData.get("observaciones");
    if (obs) data.observaciones = obs;
    
    const est = formData.get("estado");
    if (est) data.estado = est;

    console.log("Submitting data:", data);

    try {
      if (isEditing) {
        const res = await updateSeguimiento(seguimiento.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Visita actualizada correctamente");
      } else {
        const res = await createSeguimiento(data);
        if (res.error) throw new Error(res.error);
        toast.success("Visita de seguimiento programada correctamente");
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
    return new Date(dateString).toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col my-8">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-50 rounded-lg">
              <MapPin size={20} className="text-cyan-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEditing ? "Editar Visita de Seguimiento" : "Programar Visita de Seguimiento"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing ? `Editando visita a: ${seguimiento.aprendiz?.nombres || 'Aprendiz'}` : "Registrar visita técnica a un aprendiz"}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Ficha *</label>
              <select 
                name="fichaId" 
                value={selectedFicha} 
                onChange={(e) => setSelectedFicha(e.target.value)}
                required 
                className={selectClass}
              >
                <option value="" disabled>Seleccione una ficha</option>
                {fichas.map(f => (
                  <option key={f.id} value={f.id}>{f.codigo} - {f.programa?.nombre}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Aprendiz *</label>
              <select name="aprendizId" defaultValue={seguimiento?.aprendizId || ""} required className={selectClass} disabled={!selectedFicha}>
                <option value="" disabled>Seleccione un aprendiz</option>
                {aprendices.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.nombres} {a.apellidos}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Fecha de Visita *</label>
              <Input
                name="fecha"
                type="datetime-local"
                defaultValue={formatDateForInput(seguimiento?.fecha) || formatDateForInput(new Date().toISOString())}
                required
              />
            </div>
            {isEditing && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Estado</label>
                <select name="estado" defaultValue={seguimiento?.estado || "PROGRAMADA"} className={selectClass}>
                  {ESTADOS.map(e => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Responsable *</label>
              <Input
                name="responsable"
                defaultValue={seguimiento?.responsable}
                required
                placeholder="Ej: Enlace SENA / Coordinador Académico"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Cant. de Novedades</label>
              <Input
                name="novedades"
                type="number"
                min="0"
                defaultValue={seguimiento?.novedades || 0}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Observaciones</label>
            <textarea
              name="observaciones"
              defaultValue={seguimiento?.observaciones}
              rows={4}
              placeholder="Registre las observaciones encontradas durante la visita..."
              className={selectClass + " h-auto resize-none"}
            />
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar Visita" : "Programar Visita"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
