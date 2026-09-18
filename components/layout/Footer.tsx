import React from "react";
import Link from "next/link";
import { ShieldCheck, GraduationCap, Info } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 md:px-8 text-slate-600 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        
        {/* Identidad del Sistema y Contexto */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-wide text-sm">GSS</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-700 font-medium">
              Sistema de Información para el Seguimiento del Proceso de Integración con la Media Técnica
            </span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Proyecto académico desarrollado en el contexto de la formación del SENA.
          </p>
        </div>

        {/* Separación y Derechos de Autor / Aviso Institucional */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-2 text-slate-500 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600">
            <GraduationCap size={14} className="text-[#39A900]" />
            <span>Formación Profesional Integral</span>
          </div>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span>© {currentYear} Proyecto GSS</span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="text-slate-500 italic">
            Uso pedagógico e institucional
          </span>
        </div>
      </div>
    </footer>
  );
}
