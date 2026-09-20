"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X, Calendar, Clock, BookOpen, AlertCircle } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

interface ActividadDetalleDialogProps {
  actividad: any;
  onClose: () => void;
}

export function ActividadDetalleDialog({ actividad, onClose }: ActividadDetalleDialogProps) {
  if (!actividad) return null;

  const vencida = actividad.fechaVencimiento && new Date(actividad.fechaVencimiento) < new Date();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {actividad.nombre}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Detalle de la Actividad
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <Calendar size={16} className="text-slate-500" />
              <div>
                <span className="block text-[10px] uppercase text-slate-500 font-bold">Fecha de Inicio</span>
                <span className="font-medium text-slate-800">{actividad.fechaInicio ? formatDateShort(actividad.fechaInicio) : "No definida"}</span>
              </div>
            </div>

            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${vencida ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
              <Clock size={16} className={vencida ? 'text-red-500' : 'text-slate-500'} />
              <div>
                <span className={`block text-[10px] uppercase font-bold ${vencida ? 'text-red-500' : 'text-slate-500'}`}>
                  {vencida ? "Vencida" : "Fecha Límite"}
                </span>
                <span className={`font-medium ${vencida ? 'text-red-700' : 'text-slate-800'}`}>
                  {actividad.fechaVencimiento ? formatDateShort(actividad.fechaVencimiento) : "No definida"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <AlertCircle size={16} className="text-slate-500" />
              <div>
                <span className="block text-[10px] uppercase text-slate-500 font-bold">Tipo</span>
                <span className="font-medium text-slate-800 capitalize">{actividad.tipo?.toLowerCase()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-5">
            {actividad.descripcion && (
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Descripción</h3>
                <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-wrap">
                  {actividad.descripcion}
                </div>
              </div>
            )}

            {actividad.instrucciones && (
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Instrucciones</h3>
                <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-wrap">
                  {actividad.instrucciones}
                </div>
              </div>
            )}

            {!actividad.descripcion && !actividad.instrucciones && (
              <p className="text-sm text-slate-500 italic">No hay detalles adicionales provistos por el instructor.</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end shrink-0">
          <Button onClick={onClose}>Cerrar</Button>
        </div>

      </div>
    </div>
  );
}
