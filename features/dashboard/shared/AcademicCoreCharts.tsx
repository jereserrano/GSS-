"use client";

import React, { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronDown, ChevronRight, CheckCircle2, AlertTriangle } from "lucide-react";

const COLOR_PRIMARY = "#00304D";
const COLOR_GOOD = "#007832";
const COLOR_WARN = "#f59e0b";
const COLOR_DANGER = "#ef4444";

export function CompetenceRadarChart({ competencias }: { competencias: any[] }) {
  if (!competencias || competencias.length === 0) return (
    <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-5 h-full flex items-center justify-center min-h-[350px]">
      <span className="text-[#00304D]/50 text-sm">No hay datos de competencias.</span>
    </div>
  );
  
  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-5 h-full flex flex-col min-h-[350px]">
      <h3 className="text-[#00304D] font-bold text-sm mb-1">Dominio por Competencias</h3>
      <p className="text-[#00304D]/70 text-xs mb-4">Promedio general de aprobación del grupo en cada área del saber.</p>
      
      <div className="flex-1 w-full relative min-h-[250px]">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={competencias}>
              <PolarGrid stroke={COLOR_PRIMARY} strokeOpacity={0.15} />
              <PolarAngleAxis 
                dataKey="nombre" 
                tick={{ fill: COLOR_PRIMARY, fontSize: 10, fontWeight: 600 }}
                tickFormatter={(value) => value.length > 25 ? value.substring(0, 25) + "..." : value}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: COLOR_PRIMARY }} tickCount={5} />
              <Tooltip 
                content={({active, payload}) => {
                  if(active && payload && payload.length) {
                    const data = payload[0]?.payload;
                    if (!data) return null;
                    return (
                      <div className="bg-white/95 backdrop-blur-md border border-[#00304D]/20 p-3 rounded-xl shadow-xl text-sm max-w-[250px] z-50 relative">
                        <p className="font-bold text-[#00304D] mb-1">{data.nombre}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[#00304D]/70 text-xs">Aprobación Grupo:</span>
                          <span className="font-bold text-[#007832]">{data.promedio}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Radar
                name="Promedio Ficha"
                dataKey="promedio"
                stroke={COLOR_PRIMARY}
                strokeWidth={2}
                fill={COLOR_PRIMARY}
                fillOpacity={0.15}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function DrillDownBarChart({ competencias, resultadosAprendizaje }: { competencias: any[], resultadosAprendizaje: any[] }) {
  const [expandedComp, setExpandedComp] = useState<string | null>(null);

  const toggleExpand = (compId: string) => {
    setExpandedComp(expandedComp === compId ? null : compId);
  };

  const getStatusColor = (val: number) => {
    if (val >= 80) return COLOR_GOOD;
    if (val >= 60) return COLOR_WARN;
    return COLOR_DANGER;
  };

  if (!competencias || competencias.length === 0) return null;

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-5 h-full flex flex-col min-h-[350px]">
      <h3 className="text-[#00304D] font-bold text-sm mb-1">Desglose de Resultados de Aprendizaje (RA)</h3>
      <p className="text-[#00304D]/70 text-xs mb-4">Haz clic en una competencia para desplegar el detalle de sus RAs.</p>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {competencias.map(comp => {
          const isExpanded = expandedComp === comp.id;
          const ras = resultadosAprendizaje?.filter(ra => ra.competenciaId === comp.id) || [];
          
          return (
            <div key={comp.id} className={`border ${isExpanded ? 'border-[#00304D]/20 shadow-sm' : 'border-[#00304D]/10'} rounded-xl overflow-hidden bg-white/40 transition-all`}>
              {/* Encabezado Competencia (Clickeable) */}
              <button 
                onClick={() => toggleExpand(comp.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-white/70 transition-colors text-left"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-start gap-2 mb-1.5">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-[#00304D] shrink-0 mt-0.5" /> : <ChevronRight className="w-4 h-4 text-[#00304D] shrink-0 mt-0.5" />}
                    <h4 className="text-sm font-semibold text-[#00304D] leading-tight text-left">{comp.nombre}</h4>
                  </div>
                  {/* Barra de progreso de la competencia */}
                  <div className="w-full bg-[#00304D]/10 h-1.5 rounded-full overflow-hidden flex items-center ml-6" style={{ width: 'calc(100% - 24px)' }}>
                    <div 
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${comp.promedio}%`, backgroundColor: getStatusColor(comp.promedio) }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-[#00304D]">{comp.promedio}%</span>
                </div>
              </button>

              {/* RAs Expandidos */}
              {isExpanded && ras.length > 0 && (
                <div className="p-3 bg-white/50 border-t border-[#00304D]/10 space-y-3">
                  {ras.map(ra => (
                    <div key={ra.id} className="flex items-center justify-between group pl-2">
                      <div className="flex-1 pr-4">
                        <div className="flex items-start gap-2 mb-1 text-xs text-[#00304D]/80 font-medium">
                          {ra.aprobacion >= 80 ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#007832] shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444] shrink-0 mt-0.5" />
                          )}
                          <span className="leading-tight text-left">{ra.nombre}</span>
                        </div>
                        {/* Barra secundaria del RA */}
                        <div className="w-full bg-[#00304D]/10 h-1 rounded-full overflow-hidden ml-5.5" style={{ width: 'calc(100% - 22px)' }}>
                          <div 
                            className="h-full rounded-full transition-all duration-700 opacity-80 group-hover:opacity-100"
                            style={{ width: `${ra.aprobacion}%`, backgroundColor: getStatusColor(ra.aprobacion) }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold" style={{ color: getStatusColor(ra.aprobacion) }}>
                        {ra.aprobacion}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {isExpanded && ras.length === 0 && (
                <div className="p-3 text-xs text-[#00304D]/50 text-center bg-white/30 border-t border-[#00304D]/10">
                  No hay RAs registrados para esta competencia.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
