"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X, FileText, Download, CheckCircle, Clock, MessageSquare, AlertCircle } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

interface EntregaDetalleDialogProps {
  entrega: any;
  onClose: () => void;
  canEdit?: boolean;
  onEdit?: () => void;
}

export function EntregaDetalleDialog({ entrega, onClose, canEdit, onEdit }: EntregaDetalleDialogProps) {
  if (!entrega) return null;

  const est = (entrega.estado || "").toUpperCase();
  const esAprobada = est === "APROBADA" || est === "CALIFICADA";
  const esRechazada = est === "NO_APROBADA" || est === "RECHAZADO";

  const getFileUrl = (url: any) => {
    if (!url || typeof url !== 'string') return "";
    try {
      const normalizedUrl = url.replace(/\\/g, "/");
      const safeUrl = normalizedUrl.startsWith("/") ? normalizedUrl : `/${normalizedUrl}`;
      if (safeUrl.startsWith("/uploads/")) return `/api${safeUrl}`;
      return url;
    } catch (e) {
      return "";
    }
  };
  
  const fileUrl = getFileUrl(entrega.urlArchivo);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Detalle de Entrega
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {entrega.actividad?.nombre || "Actividad"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Info Status */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <Clock size={16} className="text-slate-500" />
              <div>
                <span className="block text-[10px] uppercase text-slate-500 font-bold">Fecha Entregado</span>
                <span className="font-medium text-slate-800">{entrega.fechaEntrega ? formatDateShort(entrega.fechaEntrega) : "No registrada"}</span>
              </div>
            </div>

            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${esAprobada ? 'bg-green-50 border-green-200' : esRechazada ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
              {esAprobada ? <CheckCircle size={16} className="text-green-600" /> : esRechazada ? <AlertCircle size={16} className="text-red-500" /> : <Clock size={16} className="text-amber-500" />}
              <div>
                <span className={`block text-[10px] uppercase font-bold ${esAprobada ? 'text-green-600' : esRechazada ? 'text-red-600' : 'text-amber-600'}`}>
                  Estado de Evaluación
                </span>
                <span className={`font-medium ${esAprobada ? 'text-green-700' : esRechazada ? 'text-red-700' : 'text-amber-700'}`}>
                  {est || "PENDIENTE"}
                </span>
              </div>
            </div>

            {entrega.calificacion && (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <div className="font-black text-lg text-slate-700">{String(entrega.calificacion)}</div>
                <div>
                  <span className="block text-[10px] uppercase text-slate-500 font-bold">Nota</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Archivo Adjunto</h3>
              {entrega.urlArchivo ? (
                <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-indigo-600" />
                    <div>
                      <p className="text-sm font-semibold text-indigo-900">Evidencia Subida</p>
                      <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">
                        {String(entrega.urlArchivo)}
                      </a>
                    </div>
                  </div>
                  <a href={fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-700 text-xs font-semibold rounded shadow-sm hover:bg-indigo-50 border border-indigo-200 transition-colors">
                    <Download size={14} /> Descargar / Abrir
                  </a>
                </div>
              ) : (
                <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  No se ha adjuntado ningún archivo o enlace.
                </div>
              )}
            </div>

            {entrega.comentario && (
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1.5"><MessageSquare size={14} className="text-slate-500"/> Comentario del Aprendiz</h3>
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                  {String(entrega.comentario)}
                </div>
              </div>
            )}

            {entrega.retroalimentacion && (
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1.5"><MessageSquare size={14} className="text-amber-500"/> Retroalimentación del Instructor</h3>
                <div className="text-sm text-slate-800 bg-amber-50 p-3 rounded-lg border border-amber-100 whitespace-pre-wrap">
                  {String(entrega.retroalimentacion)}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={onClose}>Cerrar Detalle</Button>
          {canEdit && onEdit && (
            <Button onClick={() => { onClose(); onEdit(); }}>
              Evaluar / Calificar
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
