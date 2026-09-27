"use client";

import React, { useState, useEffect } from "react";
import { getProgramasConFichasAction } from "@/actions/programas.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ChevronDown, ChevronUp, FolderOpen, Users, MapPin, ArrowRight, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExploradorProgramasProps {
  basePath: string; // ej: "/asistencia/ficha", "/aprendices/ficha"
  moduloName: string; // ej: "Asistencia", "Aprendices"
}

export function ExploradorProgramas({ basePath, moduloName }: ExploradorProgramasProps) {
  const [programas, setProgramas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getProgramasConFichasAction().then(res => {
      if (res.success && res.data) {
        setProgramas(res.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (programas.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center text-slate-500">
          No hay programas de formación registrados o no tienes acceso.
        </CardContent>
      </Card>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Explorador de Fichas</h2>
          <p className="text-sm text-slate-500 mt-1">
            Selecciona un programa para ver sus fichas e ingresar al módulo de <span className="font-semibold text-emerald-700">{moduloName}</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
        {programas.map((programa) => {
          const isExpanded = expandedId === programa.id;
          const totalFichas = programa.fichas?.length || 0;

          return (
            <div key={programa.id} className="flex flex-col">
              {/* Tarjeta del Programa */}
              <div 
                onClick={() => toggleExpand(programa.id)}
                className={`group relative bg-white border rounded-xl p-5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md z-10
                  ${isExpanded ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-300'}
                  ${isExpanded ? 'rounded-b-none border-b-transparent' : ''}
                `}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-bl-full -z-0 pointer-events-none" />
                
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="p-2.5 bg-emerald-100/50 rounded-xl shrink-0 text-emerald-700">
                    <BookOpen size={22} strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shrink-0 bg-slate-100 text-slate-600 border border-slate-200/50">
                    {programa.nivelFormacion}
                  </span>
                </div>

                <div className="mt-4 relative z-10">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {programa.nombre}
                  </h3>
                  <p className="text-sm font-mono text-slate-500 mt-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    Código: {programa.codigo}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 relative z-10">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 font-medium">
                      <FolderOpen size={14} className="text-slate-400" /> 
                      {totalFichas} {totalFichas === 1 ? 'Ficha' : 'Fichas'}
                    </span>
                  </div>
                  <div className="text-emerald-600 font-medium flex items-center gap-1">
                    {isExpanded ? (
                      <><ChevronUp size={16} /> Cerrar</>
                    ) : (
                      <><ChevronDown size={16} /> Ver Fichas</>
                    )}
                  </div>
                </div>
              </div>

              {/* Acordeón: Tabla de Fichas */}
              {isExpanded && (
                <div className="bg-slate-50 border border-t-0 border-emerald-500 rounded-b-xl overflow-hidden shadow-sm animate-in slide-in-from-top-2 z-0 relative">
                  {totalFichas === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500 italic">
                      Este programa no tiene fichas activas asociadas.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-100/50 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Ficha / Sede</th>
                            <th className="px-4 py-3 font-semibold text-center w-24">Aprendices</th>
                            <th className="px-4 py-3 font-semibold text-right w-40">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/60">
                          {programa.fichas.map((ficha: any) => (
                            <tr key={ficha.id} className="hover:bg-white transition-colors group/row">
                              <td className="px-4 py-3">
                                <div className="font-bold text-slate-800 text-[15px]">{ficha.codigo}</div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <MapPin size={10} />
                                  <span className="truncate max-w-[150px]" title={ficha.institucion?.nombre}>
                                    {ficha.institucion?.nombre}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                                  <Users size={12} />
                                  {ficha._count?.aprendices || 0}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => router.push(`${basePath}/${ficha.id}`)}
                                  className="inline-flex items-center gap-1.5 bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm"
                                >
                                  Ingresar
                                  <ArrowRight size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
