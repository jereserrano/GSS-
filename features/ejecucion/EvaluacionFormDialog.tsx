"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createEvaluacion, updateEvaluacion } from "@/actions/evaluaciones.actions";
import { toast } from "sonner";
import { X, Award, CheckSquare, Square } from "lucide-react";

interface Ficha {
  id: string;
  codigo: string;
  programa: { nombre: string };
}

interface Aprendiz {
  id: string;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  fichaId?: string;
  ficha: { id?: string; codigo: string };
}

interface Rap {
  id: string;
  codigo: string;
  nombre: string;
  competencia?: { programaId: string };
}

interface EvaluacionFormDialogProps {
  evaluacion?: any;
  raps: Rap[];
  aprendices: Aprendiz[];
  fichas: Ficha[];
  rapIdFijo?: string;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const JUICIOS = [
  { value: "PENDIENTE", label: "Pendiente (Por Evaluar)" },
  { value: "APROBADO", label: "A (Aprobado)" },
  { value: "DEFICIENTE", label: "D (Deficiente)" },
];

export function EvaluacionFormDialog({ evaluacion, raps, aprendices, fichas, rapIdFijo, onClose, onSuccess }: EvaluacionFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!evaluacion;

  // Estado para el modo creación múltiple
  const [fichaSeleccionada, setFichaSeleccionada] = useState(evaluacion ? (aprendices.find(a => a.id === evaluacion.aprendizId)?.fichaId || "") : "");
  const [aprendicesSeleccionados, setAprendicesSeleccionados] = useState<string[]>(
    evaluacion ? [evaluacion.aprendizId] : []
  );
  const [rapId, setRapId] = useState(rapIdFijo || evaluacion?.resultadoAprendizajeId || "");
  const [juicio, setJuicio] = useState(evaluacion?.juicio || "PENDIENTE");
  const [fecha, setFecha] = useState(() => {
    if (evaluacion?.fechaEvaluacion) return new Date(evaluacion.fechaEvaluacion).toISOString().slice(0, 16);
    return new Date().toISOString().slice(0, 16);
  });
  const [observaciones, setObservaciones] = useState(evaluacion?.observaciones || "");

  // Aprendices filtrados por ficha seleccionada
  const aprendicesFiltrados = useMemo(() => {
    if (!fichaSeleccionada) return aprendices;
    return aprendices.filter(a => a.fichaId === fichaSeleccionada || a.ficha?.id === fichaSeleccionada);
  }, [fichaSeleccionada, aprendices]);

  const toggleAprendiz = (id: string) => {
    if (isEditing) return; // En edición no se puede cambiar
    setAprendicesSeleccionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setAprendicesSeleccionados(aprendicesFiltrados.map(a => a.id));
  };

  const clearAll = () => {
    setAprendicesSeleccionados([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rapId) { toast.error("Selecciona un RAP"); return; }
    if (aprendicesSeleccionados.length === 0) { toast.error("Selecciona al menos un aprendiz"); return; }

    setLoading(true);
    try {
      if (isEditing) {
        const res = await updateEvaluacion(evaluacion.id, {
          resultadoAprendizajeId: rapId,
          aprendizId: aprendicesSeleccionados[0],
          juicio,
          fechaEvaluacion: fecha,
          observaciones,
        });
        if (res.error) throw new Error(res.error);
        toast.success("Juicio valorativo actualizado correctamente");
      } else {
        // Crear uno por cada aprendiz seleccionado
        let errores = 0;
        for (const aprendizId of aprendicesSeleccionados) {
          const res = await createEvaluacion({
            resultadoAprendizajeId: rapId,
            aprendizId,
            juicio,
            fechaEvaluacion: fecha,
            observaciones,
          });
          if (res.error) errores++;
        }
        if (errores === 0) {
          toast.success(`${aprendicesSeleccionados.length} juicio(s) valorativo(s) registrado(s) correctamente`);
        } else {
          toast.warning(`Se registraron ${aprendicesSeleccionados.length - errores} de ${aprendicesSeleccionados.length}. Algunos ya existían.`);
        }
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col my-8">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Award size={20} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEditing ? "Editar Juicio Valorativo" : "Registrar Juicio Valorativo"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing ? `Editando evaluación de: ${evaluacion.aprendiz?.nombres}` : "Evaluar un Resultado de Aprendizaje"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* PASO 1: Seleccionar Ficha */}
          {!isEditing && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">
                Ficha / Grupo <span className="text-text-secondary font-normal">(filtra los aprendices)</span>
              </label>
              <select
                value={fichaSeleccionada}
                onChange={e => { setFichaSeleccionada(e.target.value); setAprendicesSeleccionados([]); }}
                className={selectClass}
              >
                <option value="">— Todas las fichas —</option>
                {fichas.map(f => (
                  <option key={f.id} value={f.id}>{f.codigo} - {f.programa.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* PASO 2: Selección múltiple de aprendices */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-primary">
                Aprendices * {!isEditing && aprendicesSeleccionados.length > 0 && (
                  <span className="ml-2 text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {aprendicesSeleccionados.length} seleccionados
                  </span>
                )}
              </label>
              {!isEditing && (
                <div className="flex gap-2">
                  <button type="button" onClick={selectAll} className="text-xs text-primary hover:underline">Seleccionar todos</button>
                  <span className="text-slate-300">|</span>
                  <button type="button" onClick={clearAll} className="text-xs text-slate-500 hover:underline">Limpiar</button>
                </div>
              )}
            </div>

            {isEditing ? (
              <select className={selectClass} disabled>
                <option>{aprendices.find(a => a.id === evaluacion?.aprendizId)?.nombres} {aprendices.find(a => a.id === evaluacion?.aprendizId)?.apellidos}</option>
              </select>
            ) : (
              <div className="border border-input rounded-md max-h-48 overflow-y-auto divide-y divide-slate-100">
                {aprendicesFiltrados.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-6">
                    {fichaSeleccionada ? "No hay aprendices en esta ficha" : "Selecciona una ficha para filtrar"}
                  </p>
                ) : (
                  aprendicesFiltrados.map(a => {
                    const isSelected = aprendicesSeleccionados.includes(a.id);
                    return (
                      <div
                        key={a.id}
                        onClick={() => toggleAprendiz(a.id)}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors select-none ${
                          isSelected ? "bg-primary/5" : "hover:bg-slate-50"
                        }`}
                      >
                        {isSelected
                          ? <CheckSquare size={16} className="text-primary shrink-0" />
                          : <Square size={16} className="text-slate-300 shrink-0" />
                        }
                        <span className="text-sm flex-1">
                          <span className="font-medium">{a.apellidos}, {a.nombres}</span>
                          <span className="text-slate-400 ml-2 text-xs">{a.numeroDocumento}</span>
                        </span>
                        <span className="text-xs text-slate-400">Ficha {a.ficha.codigo}</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* RAP */}
          {!rapIdFijo && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Resultado de Aprendizaje (RAP) *</label>
              <select
                value={rapId}
                onChange={e => setRapId(e.target.value)}
                required
                className={selectClass}
                disabled={isEditing}
              >
                <option value="" disabled>Seleccione un RAP</option>
                {raps.map(r => (
                  <option key={r.id} value={r.id}>{r.codigo} - {r.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* Juicio y Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Juicio Valorativo</label>
              <select value={juicio} onChange={e => setJuicio(e.target.value)} className={selectClass}>
                {JUICIOS.map(j => (
                  <option key={j.value} value={j.value}>{j.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Fecha de Evaluación</label>
              <Input
                type="datetime-local"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              rows={3}
              placeholder="Comentarios adicionales sobre el desempeño..."
              className={selectClass + " h-auto resize-none"}
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-3 border-t mt-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || aprendicesSeleccionados.length === 0}>
              {loading
                ? "Guardando..."
                : isEditing
                  ? "Actualizar Juicio"
                  : `Registrar ${aprendicesSeleccionados.length > 1 ? `${aprendicesSeleccionados.length} Juicios` : "Juicio"}`
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
