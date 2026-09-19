"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Users, BookCheck, ArrowRight, Shield } from "lucide-react";

export function BusquedaPageClient({ query, resultados }: { query: string; resultados: any }) {
  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3 bg-white rounded-2xl border border-slate-200">
        <Shield size={40} className="opacity-30" />
        <p className="text-sm">Ingresa un término de búsqueda para comenzar.</p>
      </div>
    );
  }

  const { aprendices = [], fichas = [], actividades = [] } = resultados;
  const total = aprendices.length + fichas.length + actividades.length;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3 bg-white rounded-2xl border border-slate-200">
        <Shield size={40} className="opacity-30" />
        <p className="text-sm">No se encontraron resultados para "{query}".</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {aprendices.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="text-sena-600" /> Aprendices ({aprendices.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aprendices.map((ap: any) => (
              <div key={ap.id} className="card-institucional p-4 hover:border-sena-500 transition-colors">
                <h3 className="font-bold text-slate-900">{ap.nombres} {ap.apellidos}</h3>
                <p className="text-xs text-slate-500 mt-1">CC: {ap.numeroDocumento}</p>
                <p className="text-xs text-slate-500">Ficha: {ap.ficha?.codigo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {fichas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="text-blue-600" /> Fichas ({fichas.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fichas.map((f: any) => (
              <Link href={`/fichas/${f.id}`} key={f.id} className="card-institucional p-4 hover:border-blue-500 transition-colors block group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{f.codigo}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{f.programa?.nombre}</p>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {actividades.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookCheck className="text-purple-600" /> Actividades ({actividades.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actividades.map((act: any) => (
              <div key={act.id} className="card-institucional p-4 hover:border-purple-500 transition-colors">
                <h3 className="font-bold text-slate-900 line-clamp-1">{act.nombre}</h3>
                <p className="text-xs text-slate-500 mt-1">Ficha: {act.ficha?.codigo}</p>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full mt-2 inline-block">
                  {act.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
