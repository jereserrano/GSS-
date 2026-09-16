"use client";

import React, { useState } from "react";
import { X, Shield, Check, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createRol } from "@/actions/roles.actions";

interface RolFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (rol: any) => void;
}

const MODULOS_DISPONIBLES = [
  { id: "academico", nombre: "Gestión Académica", desc: "Fichas, programas, competencias y resultados" },
  { id: "evaluaciones", nombre: "Evaluaciones & Asistencia", desc: "Registro de asistencia y juicios valorativos" },
  { id: "aprendices", nombre: "Aprendices & Matrículas", desc: "Expedientes de aprendices y novedades" },
  { id: "reportes", nombre: "Reportes & Analíticas", desc: "Generación y exportación de informes oficiales" },
  { id: "administracion", nombre: "Administración del Sistema", desc: "Usuarios, auditoría y parametrización" },
];

const PLANTILLAS_ROLES = [
  {
    nombre: "Coordinador de Sede",
    descripcion: "Supervisión general de fichas, sedes y seguimiento de formación en la institución.",
    modulos: ["academico", "aprendices", "reportes"]
  },
  {
    nombre: "Apoyo Administrativo",
    descripcion: "Registro de aprendices, control de novedades y generación de certificados.",
    modulos: ["aprendices", "reportes"]
  },
  {
    nombre: "Auditor de Calidad",
    descripcion: "Consulta de registros, bitácoras de auditoría e informes institucionales.",
    modulos: ["reportes", "administracion"]
  }
];

export function RolFormDialog({ isOpen, onClose, onSuccess }: RolFormDialogProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [modulosSeleccionados, setModulosSeleccionados] = useState<string[]>([
    "academico",
    "evaluaciones"
  ]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const toggleModulo = (id: string) => {
    setModulosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const aplicarPlantilla = (plantilla: typeof PLANTILLAS_ROLES[0]) => {
    setNombre(plantilla.nombre);
    setDescripcion(plantilla.descripcion);
    setModulosSeleccionados(plantilla.modulos);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nombre.trim()) {
      setErrorMsg("El nombre del rol es obligatorio.");
      return;
    }

    setLoading(true);

    try {
      // Guardar el rol en la base de datos
      const res = await createRol({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
      });

      if (res.error) {
        setErrorMsg(res.error);
        toast.error(res.error);
        return;
      }

      toast.success(`Rol "${nombre.trim()}" creado exitosamente`);
      onSuccess(res.rol);
      onClose();
    } catch (err: any) {
      const msg = err?.message || "Ocurrió un error inesperado al crear el rol.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado Institucional */}
        <div className="bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-6 py-4.5 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#003F8C] shadow-xs">
              <Shield className="w-5 h-5 text-[#003F8C]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Crear Nuevo Rol
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Define el perfil de seguridad y permisos de acceso para los usuarios del sistema.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Cerrar ventana"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Mensaje de error si existe */}
            {errorMsg && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Plantillas sugeridas */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <Sparkles size={12} className="text-amber-500" />
                <span>Sugerencias rápidas</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PLANTILLAS_ROLES.map((plantilla) => (
                  <button
                    key={plantilla.nombre}
                    type="button"
                    onClick={() => aplicarPlantilla(plantilla)}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-100/80 hover:bg-blue-50 text-slate-700 hover:text-[#003F8C] border border-slate-200/80 transition-colors cursor-pointer"
                  >
                    + {plantilla.nombre}
                  </button>
                ))}
              </div>
            </div>

            {/* Campo Nombre del Rol */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nombre del Rol <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="Ej. Coordinador de Sede, Auditor de Ficha..."
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#003F8C] focus:ring-2 focus:ring-[#003F8C]/15 h-10 shadow-xs"
                required
                autoFocus
              />
            </div>

            {/* Campo Descripción */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                placeholder="Describe las responsabilidades y el alcance que tendrán los usuarios con este rol..."
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#003F8C] focus:outline-none focus:ring-2 focus:ring-[#003F8C]/15 shadow-xs resize-none"
              />
            </div>

            {/* Módulos y permisos interactivos en Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Módulos y Permisos
                </label>
                <span className="text-[11px] text-slate-500">
                  {modulosSeleccionados.length} seleccionados
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                {MODULOS_DISPONIBLES.map((modulo) => {
                  const isChecked = modulosSeleccionados.includes(modulo.id);
                  return (
                    <div
                      key={modulo.id}
                      onClick={() => toggleModulo(modulo.id)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all border select-none ${
                        isChecked
                          ? "bg-white border-blue-400/80 shadow-xs ring-1 ring-blue-400/20"
                          : "bg-white/70 border-slate-200/70 hover:bg-white hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center transition-colors shrink-0 ${
                          isChecked
                            ? "bg-[#003F8C] text-white"
                            : "border border-slate-300 bg-white"
                        }`}
                      >
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-800 leading-tight">
                          {modulo.nombre}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-1">
                          {modulo.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pie del Modal con acciones */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-xs font-medium text-slate-600 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={loading || !nombre.trim()}
                className="bg-[#003F8C] hover:bg-[#002660] text-white text-xs font-semibold px-5 h-9 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Shield size={14} />
                    <span>Guardar Rol</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
