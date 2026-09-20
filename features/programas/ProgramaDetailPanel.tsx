"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  X, Pencil, BookOpen, Clock, GraduationCap, Monitor,
  User, Building2, FileText, Target, Layers, Award,
  ChevronRight, BookCheck
} from "lucide-react";

interface ProgramaDetailPanelProps {
  programa: any;
  onClose: () => void;
  onEdit: () => void;
}

const MODALIDAD_LABELS: Record<string, string> = {
  PRESENCIAL: "Presencial",
  VIRTUAL: "Virtual",
  DISTANCIA: "A Distancia",
  COMBINADO: "Combinado (Blended)",
};

const NIVEL_LABELS: Record<string, string> = {
  TECNICO: "Técnico",
  TECNOLOGO: "Tecnólogo",
  OPERARIO: "Operario",
};

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="mt-0.5 p-1.5 bg-emerald-50 rounded-md shrink-0">
        <Icon size={14} className="text-emerald-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-slate-700 font-medium mt-0.5 leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

function TextSection({ title, icon: Icon, content }: { title: string; icon: any; content?: string | null }) {
  if (!content) return null;
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} className="text-emerald-600" />
        <h4 className="text-sm font-bold text-slate-700">{title}</h4>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100 whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
}

export function ProgramaDetailPanel({ programa, onClose, onEdit }: ProgramaDetailPanelProps) {
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "").toUpperCase();
  const canEdit = role === "ADMINISTRADOR" || role === "COORDINADOR";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/5 transition-opacity"
        onClick={onClose}
      />

      {/* Panel Lateral */}
      <div className="relative w-full max-w-lg h-full flex flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
                {programa.codigo}
              </span>
              <StatusBadge estado={programa.estado?.toLowerCase()} />
            </div>
            <h2 className="text-lg font-bold text-white leading-tight mt-1 pr-8">
              {programa.nombre}
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-xs bg-white/15 border border-white/25 px-2 py-0.5 rounded-full font-medium">
                <GraduationCap size={11} />
                {NIVEL_LABELS[programa.nivelFormacion] ?? programa.nivelFormacion}
              </span>
              {programa.modalidad && (
                <span className="inline-flex items-center gap-1 text-xs bg-white/15 border border-white/25 px-2 py-0.5 rounded-full font-medium">
                  <Monitor size={11} />
                  {MODALIDAD_LABELS[programa.modalidad] ?? programa.modalidad}
                </span>
              )}
              {programa.version && (
                <span className="inline-flex items-center gap-1 text-xs bg-white/15 border border-white/25 px-2 py-0.5 rounded-full font-medium">
                  v{programa.version}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-2 p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">

          {/* Datos Curriculares Clave */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Layers size={13} />
              Estructura Curricular
            </h3>
            <div className="divide-y divide-slate-100">
              <InfoRow icon={Clock} label="Horas Totales" value={programa.duracion ? `${programa.duracion} horas` : null} />
              <InfoRow icon={Award} label="Titulación" value={programa.titulacion} />
              <InfoRow icon={Building2} label="Área de Conocimiento" value={programa.area} />
              <InfoRow icon={Target} label="Área de Desempeño / Sector" value={programa.areaDesempeno} />
              <InfoRow icon={BookCheck} label="Fichas Activas" value={programa._count?.fichas ?? 0} />
              <InfoRow icon={Target} label="Competencias Asociadas" value={programa._count?.competencias ?? 0} />
            </div>
          </div>

          {/* Descripción General */}
          {programa.descripcion && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <FileText size={13} />
                Descripción General
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {programa.descripcion}
              </p>
            </div>
          )}

          {/* Perfiles */}
          {(programa.perfilIngreso || programa.perfilEgresado) && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={13} />
                Perfiles de Formación
              </h3>
              <TextSection title="Perfil de Ingreso" icon={ChevronRight} content={programa.perfilIngreso} />
              <TextSection title="Perfil del Egresado" icon={ChevronRight} content={programa.perfilEgresado} />
            </div>
          )}

          {/* Sin datos curriculares */}
          {!programa.duracion && !programa.area && !programa.descripcion && !programa.perfilEgresado && canEdit && (
            <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
              <BookOpen size={28} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-500">Sin diseño curricular completo</p>
              <p className="text-xs text-slate-400 mt-1">
                Haz clic en "Editar" para completar la información curricular de este programa.
              </p>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="relative z-10 p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
          <Button variant="outline" onClick={onClose} size="sm">
            Cerrar
          </Button>
          {canEdit && (
            <Button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }} size="sm" className="gap-2">
              <Pencil size={14} />
              Editar Diseño Curricular
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
