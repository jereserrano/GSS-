"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ArrowRight, X, List, ChevronRight } from "lucide-react";
import { getProgramaCompleto } from "@/actions/programas.actions";
import { toast } from "sonner";

interface Props {
  programas: any[];
}

export function PlanFormacionTimeline({ programas }: Props) {
  const [selectedProgramaId, setSelectedProgramaId] = useState<string>(programas[0]?.id || "");
  const [programaDetail, setProgramaDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ tipo: "competencia" | "rap", data: any } | null>(null);

  useEffect(() => {
    if (!selectedProgramaId) return;
    
    async function loadData() {
      setLoading(true);
      const res = await getProgramaCompleto(selectedProgramaId);
      if (res.success && res.data) {
        setProgramaDetail(res.data);
      } else {
        toast.error("Error al cargar detalles del programa");
      }
      setLoading(false);
    }
    loadData();
  }, [selectedProgramaId]);

  if (!programas || programas.length === 0) {
    return (
      <div className="flex justify-center py-12 text-text-secondary text-sm">
        No hay programas registrados.
      </div>
    );
  }

  const handleSelectPrograma = (id: string) => {
    setSelectedProgramaId(id);
    setSelectorOpen(false);
  };

  const currentProgStr = programas.find((p) => p.id === selectedProgramaId);
  const competencias = programaDetail?.competencias || [];

  return (
    <div className="space-y-6">
      {/* Selector superior */}
      <Card className="border-0 shadow-sm bg-surface">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h3 className="font-semibold text-text-primary">
              Programa: {programaDetail ? programaDetail.nombre : currentProgStr?.nombre || "Cargando..."}
            </h3>
            <p className="text-sm text-text-secondary">
              Código: {programaDetail ? programaDetail.codigo : currentProgStr?.codigo}
            </p>
          </div>
          <Button variant="outline" onClick={() => setSelectorOpen(true)}>Cambiar Programa</Button>
        </CardContent>
      </Card>

      {/* Timeline / Competencias */}
      {loading ? (
        <div className="py-12 flex justify-center text-sm text-text-secondary">Cargando competencias...</div>
      ) : competencias.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-sm text-text-secondary">
          <List className="opacity-30 mb-2" size={32} />
          Este programa no tiene competencias registradas.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {competencias.map((comp: any) => (
            <Card 
              key={comp.id} 
              className="border-0 shadow-sm relative overflow-hidden border-t-4 border-t-slate-300 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedItem({ tipo: "competencia", data: comp })}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between leading-tight">
                  <span className="line-clamp-2" title={comp.nombre}>{comp.codigo}</span>
                  <ChevronRight className="text-slate-400 shrink-0" size={16} />
                </CardTitle>
                <CardDescription className="text-xs text-text-secondary line-clamp-1">{comp.nombre}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {comp.resultadosAprendizaje?.slice(0, 3).map((rap: any) => (
                    <li 
                      key={rap.id} 
                      className="flex gap-2 items-start p-1 -mx-1 rounded-md hover:bg-slate-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem({ tipo: "rap", data: rap });
                      }}
                    >
                      <Circle size={14} className="text-slate-300 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-text-primary block leading-tight">{rap.codigo}</span>
                        <span className="text-[11px] text-text-secondary line-clamp-1 leading-tight">{rap.descripcion}</span>
                      </div>
                    </li>
                  ))}
                  {comp.resultadosAprendizaje?.length > 3 && (
                    <li className="text-[11px] font-medium text-primary mt-2 flex justify-center">
                      + {comp.resultadosAprendizaje.length - 3} resultados más
                    </li>
                  )}
                  {(!comp.resultadosAprendizaje || comp.resultadosAprendizaje.length === 0) && (
                    <li className="text-[11px] text-text-secondary italic">Sin resultados registrados</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Selector de Programa */}
      {selectorOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-lg w-full max-w-md max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Seleccionar Programa</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSelectorOpen(false)}>
                <X size={18} />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {programas.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => handleSelectPrograma(p.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedProgramaId === p.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-slate-50'
                  }`}
                >
                  <p className="font-semibold text-sm text-text-primary">{p.nombre}</p>
                  <p className="text-xs text-text-secondary mt-1">Código: {p.codigo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalles */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">
                {selectedItem.tipo === "competencia" ? "Detalle de la Competencia" : "Detalle del RAP"}
              </h2>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSelectedItem(null)}>
                <X size={18} />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4">
                <span className="text-xs font-bold text-sena-600 bg-sena-50 px-2 py-1 rounded-full uppercase tracking-wide">
                  {selectedItem.data.codigo}
                </span>
              </div>
              <h3 className="text-base font-medium text-text-primary mb-4 leading-relaxed">
                {selectedItem.tipo === "competencia" ? selectedItem.data.nombre : selectedItem.data.descripcion}
              </h3>
              
              {selectedItem.tipo === "competencia" && (
                <div className="mt-8 border-t pt-4">
                  <h4 className="text-sm font-bold text-text-primary mb-3">Resultados de Aprendizaje ({selectedItem.data.resultadosAprendizaje?.length || 0})</h4>
                  <ul className="space-y-3">
                    {selectedItem.data.resultadosAprendizaje?.map((rap: any) => (
                      <li key={rap.id} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <Circle size={16} className="text-slate-300 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-bold text-text-primary block">{rap.codigo}</span>
                          <span className="text-xs text-text-secondary block mt-1">{rap.descripcion}</span>
                        </div>
                      </li>
                    ))}
                    {(!selectedItem.data.resultadosAprendizaje || selectedItem.data.resultadosAprendizaje.length === 0) && (
                      <p className="text-sm text-text-secondary italic">No hay RAPs asociados a esta competencia.</p>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
