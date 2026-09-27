"use client";

import { useEffect, useState } from "react";
import { getProgramasSelectAction, getJerarquiaByProgramaAction, getJerarquiaAcademicaAction } from "@/actions/jerarquia.actions";
import { getFichasSelectAction } from "@/actions/fichas.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, FileText, CheckCircle, PenTool, Loader2, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";

// Import Modals
import { CompetenciaFormDialog } from "./CompetenciaFormDialog";
import { ResultadoAprendizajeFormDialog } from "./ResultadoAprendizajeFormDialog";
import { CriterioEvaluacionFormDialog } from "./CriterioEvaluacionFormDialog";
import { InstrumentoEvaluacionFormDialog } from "./InstrumentoEvaluacionFormDialog";

interface DisenoCurricularTreeProps {
  initialProgramaId?: string;
  hideSelector?: boolean;
}

export function DisenoCurricularTree({ initialProgramaId = "", hideSelector = false }: DisenoCurricularTreeProps = {}) {
  const { data: session, status } = useSession();
  const isAprendiz = session?.user?.role?.toUpperCase() === "APRENDIZ";
  const isApoyo = session?.user?.role?.toUpperCase() === "APOYO_COORDINACION";
  const readOnly = isAprendiz || isApoyo;
  const [mounted, setMounted] = useState(false);
  
  const [programas, setProgramas] = useState<any[]>([]);
  const [programaId, setProgramaId] = useState(initialProgramaId);
  const [searchProgram, setSearchProgram] = useState("");
  const [jerarquia, setJerarquia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showCompetenciaModal, setShowCompetenciaModal] = useState(false);
  const [activeCompetenciaId, setActiveCompetenciaId] = useState<string | null>(null);
  const [showRAModal, setShowRAModal] = useState(false);
  const [activeRAId, setActiveRAId] = useState<string | null>(null);
  const [showCriterioModal, setShowCriterioModal] = useState(false);
  const [activeCriterioId, setActiveCriterioId] = useState<string | null>(null);
  const [showInstrumentoModal, setShowInstrumentoModal] = useState(false);

  const fetchJerarquia = async (id: string) => {
    if (!id) {
      setJerarquia([]);
      return;
    }
    setLoading(true);
    const res = await getJerarquiaByProgramaAction(id);
    if (res.success && res.data) setJerarquia(res.data);
    setLoading(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (isAprendiz) {
      setLoading(true);
      getFichasSelectAction().then(res => {
        if (res.success && res.data && res.data.length > 0 && res.data[0]?.id) {
          const fichaId = res.data[0].id;
          getJerarquiaAcademicaAction(fichaId).then(jerRes => {
            if (jerRes.success && jerRes.data) {
              setJerarquia(jerRes.data);
            }
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    } else {
      if (initialProgramaId) {
        // If an initial program is given, just fetch that hierarchy right away
        fetchJerarquia(initialProgramaId);
      }
      if (!hideSelector) {
        getProgramasSelectAction().then(res => {
          if (res.success && res.data) setProgramas(res.data);
        });
      }
    }
  }, [isAprendiz, mounted, initialProgramaId, hideSelector]);

  useEffect(() => {
    if (!isAprendiz) {
      fetchJerarquia(programaId);
    }
  }, [programaId, isAprendiz]);

  const handleRefresh = () => {
    fetchJerarquia(programaId);
  };

  if (!mounted || status === "loading") {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diseño Curricular</CardTitle>
          <CardDescription>
            {hideSelector 
              ? "Visualiza o edita la estructura jerárquica (Competencias ➔ RA ➔ Criterios ➔ Instrumentos)." 
              : "Seleccione un Programa de Formación para visualizar o editar su estructura jerárquica."}
          </CardDescription>
        </CardHeader>
        
        {(!hideSelector || isAprendiz) && (
          <CardContent>
            {!readOnly ? (
              <div className="space-y-4">
                <div className="max-w-md">
                  <Input 
                    placeholder="Buscar programa por código o nombre..." 
                    value={searchProgram}
                    onChange={(e) => setSearchProgram(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 pb-2">
                  {programas
                    .filter(p => p.nombre.toLowerCase().includes(searchProgram.toLowerCase()) || p.codigo.includes(searchProgram))
                    .map(p => (
                      <div 
                        key={p.id}
                        onClick={() => setProgramaId(prev => prev === p.id ? "" : p.id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border ${programaId === p.id ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/50' : 'border-border bg-surface hover:shadow-md hover:border-primary/30'}`}
                      >
                        <h3 className="font-semibold text-text-primary line-clamp-2 leading-tight mb-1">{p.nombre}</h3>
                        <p className="text-xs text-text-secondary">Cód: {p.codigo}</p>
                      </div>
                  ))}
                  {programas.length > 0 && programas.filter(p => p.nombre.toLowerCase().includes(searchProgram.toLowerCase()) || p.codigo.includes(searchProgram)).length === 0 && (
                    <div className="col-span-full py-8 text-center text-slate-500 text-sm">
                      No se encontraron programas con ese criterio.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-100">
                Estás viendo la estructura curricular correspondiente a tu programa de formación matriculado.
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {loading && (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      )}

      {!loading && (programaId || isAprendiz) && jerarquia.length === 0 && (
        <div className="p-12 text-center text-gray-500 border rounded-lg bg-gray-50">
          Este programa aún no tiene competencias registradas.
          {!readOnly && (
            <div className="mt-4">
              <Button variant="outline" className="text-green-700 border-green-600 hover:bg-green-50" onClick={() => setShowCompetenciaModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Agregar Competencia
              </Button>
            </div>
          )}
        </div>
      )}

      {!loading && (programaId || isAprendiz) && jerarquia.length > 0 && (
        <div className="space-y-4">
          {!readOnly && (
            <div className="flex justify-end">
              <Button size="sm" variant="outline" className="text-green-700 border-green-600 hover:bg-green-50" onClick={() => setShowCompetenciaModal(true)}>
                <Plus className="w-4 h-4 mr-1" /> Añadir Competencia
              </Button>
            </div>
          )}
          {jerarquia.map((comp: any) => (
            <details key={comp.id} className="group border rounded-lg bg-white overflow-hidden shadow-sm" open>
              <summary className="flex items-center gap-2 p-4 cursor-pointer bg-green-50/50 hover:bg-green-50 transition-colors list-none font-medium text-green-900 border-b relative">
                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                <Target className="w-5 h-5 text-green-600" />
                <span>[{comp.codigo}] {comp.nombre}</span>
                {!readOnly && (
                  <button 
                    onClick={(e) => { e.preventDefault(); setActiveCompetenciaId(comp.id); setShowRAModal(true); }}
                    className="absolute right-4 text-sm text-green-700 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Añadir RA
                  </button>
                )}
              </summary>
              <div className="p-4 pl-6 space-y-4 bg-gray-50/30">
                {comp.resultadosAprendizaje?.length === 0 && (
                  <div className="text-sm text-gray-500 italic">No hay resultados de aprendizaje. {!readOnly && <button className="text-green-600 hover:underline" onClick={() => { setActiveCompetenciaId(comp.id); setShowRAModal(true); }}>Añadir RA</button>}</div>
                )}
                {comp.resultadosAprendizaje?.map((ra: any) => (
                  <details key={ra.id} className="group/ra border rounded-md bg-white overflow-hidden shadow-sm" open>
                    <summary className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 transition-colors list-none text-sm font-semibold border-b relative">
                      <ChevronRight className="w-4 h-4 transition-transform group-open/ra:rotate-90" />
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>{ra.codigo ? `[${ra.codigo}] ` : ''}{ra.nombre || ra.descripcion}</span>
                      {!readOnly && (
                        <button 
                          onClick={(e) => { e.preventDefault(); setActiveRAId(ra.id); setShowCriterioModal(true); }}
                          className="absolute right-3 text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Añadir Criterio
                        </button>
                      )}
                    </summary>
                    <div className="p-3 pl-8 space-y-3 bg-gray-50">
                      {ra.criteriosEvaluacion?.length === 0 && (
                        <div className="text-xs text-gray-500 italic">No hay criterios de evaluación. {!readOnly && <button className="text-blue-600 hover:underline" onClick={() => { setActiveRAId(ra.id); setShowCriterioModal(true); }}>Añadir Criterio</button>}</div>
                      )}
                      {ra.criteriosEvaluacion?.map((ce: any) => (
                        <div key={ce.id} className="border rounded bg-white p-3 shadow-sm text-sm">
                          <div className="flex items-start justify-between gap-2 font-medium">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                              <span>{ce.codigo ? `[${ce.codigo}] ` : ''}{ce.descripcion}</span>
                            </div>
                            {!readOnly && (
                              <button 
                                onClick={() => { setActiveCriterioId(ce.id); setShowInstrumentoModal(true); }}
                                className="text-xs text-orange-600 hover:underline flex items-center gap-1 shrink-0"
                              >
                                <Plus className="w-3 h-3" /> Añadir Instrumento
                              </button>
                            )}
                          </div>
                          <div className="mt-2 pl-6">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                              <PenTool className="w-3 h-3" /> Instrumentos
                            </h4>
                            {ce.instrumentosEvaluacion?.length === 0 ? (
                               <p className="text-xs text-gray-400 italic">Sin instrumentos.</p>
                            ) : (
                              <ul className="list-disc list-inside text-xs space-y-1 text-gray-700">
                                {ce.instrumentosEvaluacion?.map((ie: any) => (
                                  <li key={ie.id}>{ie.nombre} ({ie.tipo})</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCompetenciaModal && (
        <CompetenciaFormDialog 
          programas={programas}
          onClose={() => setShowCompetenciaModal(false)}
          onSuccess={handleRefresh}
        />
      )}

      {showRAModal && activeCompetenciaId && (
        <ResultadoAprendizajeFormDialog 
          competencias={jerarquia.map(c => ({ id: c.id, codigo: c.codigo, nombre: c.nombre }))}
          onClose={() => { setShowRAModal(false); setActiveCompetenciaId(null); }}
          onSuccess={handleRefresh}
        />
      )}

      {showCriterioModal && activeRAId && (
        <CriterioEvaluacionFormDialog 
          resultadoAprendizajeId={activeRAId}
          onClose={() => { setShowCriterioModal(false); setActiveRAId(null); }}
          onSuccess={handleRefresh}
        />
      )}

      {showInstrumentoModal && activeCriterioId && (
        <InstrumentoEvaluacionFormDialog 
          criterioEvaluacionId={activeCriterioId}
          onClose={() => { setShowInstrumentoModal(false); setActiveCriterioId(null); }}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}
