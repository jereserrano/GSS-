"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPrograma, updatePrograma } from "@/actions/programas.actions";
import { toast } from "sonner";
import { X, GraduationCap } from "lucide-react";

interface ProgramaFormDialogProps {
  programa?: any;
  onClose: () => void;
}

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500";
const inputClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500";
const textareaClass =
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500";

const NIVELES = [
  { value: "TECNICO", label: "Técnico" },
  { value: "TECNOLOGO", label: "Tecnólogo" },
  { value: "OPERARIO", label: "Operario" },
];

const MODALIDADES = [
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "VIRTUAL", label: "Virtual" },
  { value: "DISTANCIA", label: "A Distancia" },
  { value: "COMBINADO", label: "Combinado (Blended)" },
];

export function ProgramaFormDialog({ programa, onClose }: ProgramaFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!programa;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      codigo:         formData.get("codigo") as string,
      nombre:         formData.get("nombre") as string,
      nivelFormacion: formData.get("nivelFormacion") as "TECNICO" | "TECNOLOGO" | "OPERARIO",
      estado:         (formData.get("estado") as "ACTIVO" | "INACTIVO") || "ACTIVO",
      version:        (formData.get("version") as string) || null,
      duracion:       formData.get("duracion") ? Number(formData.get("duracion")) : null,
      modalidad:      (formData.get("modalidad") as "PRESENCIAL" | "VIRTUAL" | "DISTANCIA" | "COMBINADO") || null,
      area:           (formData.get("area") as string) || null,
      areaDesempeno:  (formData.get("areaDesempeno") as string) || null,
      titulacion:     (formData.get("titulacion") as string) || null,
      descripcion:    (formData.get("descripcion") as string) || null,
      perfilIngreso:  (formData.get("perfilIngreso") as string) || null,
      perfilEgresado: (formData.get("perfilEgresado") as string) || null,
    };

    try {
      if (isEditing) {
        const res = await updatePrograma(programa.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Programa actualizado correctamente");
      } else {
        const res = await createPrograma(data);
        if (res.error) throw new Error(res.error);
        toast.success("Programa registrado correctamente");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 p-4" style={{ zIndex: 99999 }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-verde-50 rounded-lg">
              <GraduationCap size={20} className="text-verde-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEditing ? "Editar Programa" : "Nuevo Programa"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing ? `Editando: ${programa.nombre}` : "Registrar un programa de formación SENA"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
            
            {/* Sección 1: Identificación */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b pb-1">1. Identificación</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Código SENA *</label>
                  <input name="codigo" defaultValue={programa?.codigo} required placeholder="Ej: 228106" className={inputClass + " font-mono"} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Nombre del Programa *</label>
                  <input name="nombre" defaultValue={programa?.nombre} required placeholder="Ej: Técnico en Sistemas" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Nivel de Formación</label>
                  <select name="nivelFormacion" defaultValue={programa?.nivelFormacion || "TECNICO"} className={selectClass}>
                    {NIVELES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                  </select>
                </div>
                {isEditing && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Estado</label>
                    <select name="estado" defaultValue={programa?.estado || "ACTIVO"} className={selectClass}>
                      <option value="ACTIVO">Activo</option>
                      <option value="INACTIVO">Inactivo</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Sección 2: Estructura Curricular */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b pb-1">2. Estructura Curricular</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Versión</label>
                  <input name="version" defaultValue={programa?.version || ""} placeholder="Ej: 3" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Duración (Horas)</label>
                  <input name="duracion" type="number" defaultValue={programa?.duracion || ""} placeholder="Ej: 2200" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Modalidad</label>
                  <select name="modalidad" defaultValue={programa?.modalidad || ""} className={selectClass}>
                    <option value="">Seleccione...</option>
                    {MODALIDADES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Área de Conocimiento</label>
                  <input name="area" defaultValue={programa?.area || ""} placeholder="Ej: Tecnologías de la Información" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Titulación</label>
                  <input name="titulacion" defaultValue={programa?.titulacion || ""} placeholder="Ej: Técnico en..." className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Área de Desempeño</label>
                  <input name="areaDesempeno" defaultValue={programa?.areaDesempeno || ""} placeholder="Sector productivo" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Sección 3: Perfiles y Descripción */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b pb-1">3. Perfiles y Descripción</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Descripción General</label>
                  <textarea name="descripcion" defaultValue={programa?.descripcion || ""} placeholder="Descripción del programa..." className={textareaClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Perfil de Ingreso</label>
                  <textarea name="perfilIngreso" defaultValue={programa?.perfilIngreso || ""} placeholder="Requisitos y competencias de ingreso..." className={textareaClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Perfil del Egresado</label>
                  <textarea name="perfilEgresado" defaultValue={programa?.perfilEgresado || ""} placeholder="Capacidades al finalizar la formación..." className={textareaClass} />
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-slate-50 flex justify-end gap-3 shrink-0 rounded-b-xl">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar Programa" : "Registrar Programa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
