const fs = require('fs');

const content = `"use client";

import { useEffect, useState } from "react";
import { getProgramasSelectAction, getJerarquiaByProgramaAction } from "@/actions/jerarquia.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, FileText, CheckCircle, PenTool, Loader2, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import Modals
import { CompetenciaFormDialog } from "./CompetenciaFormDialog";
import { ResultadoAprendizajeFormDialog } from "./ResultadoAprendizajeFormDialog";
import { CriterioEvaluacionFormDialog } from "./CriterioEvaluacionFormDialog";
import { InstrumentoEvaluacionFormDialog } from "./InstrumentoEvaluacionFormDialog";

export function DisenoCurricularTree() {
  const [programas, setProgramas] = useState<any[]>([]);
  const [programaId, setProgramaId] = useState("");
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
    if (!id) return;
    setLoading(true);
    const res = await getJerarquiaByProgramaAction(id);
    if (res.success) setJerarquia(res.data);
    setLoading(false);
  };

  useEffect(() => {
    getProgramasSelectAction().then(res => {
      if (res.success) setProgramas(res.data);
    });
  }, []);

  useEffect(() => {
    fetchJerarquia(programaId);
  }, [programaId]);

  const handleRefresh = () => {
    fetchJerarquia(programaId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diseño Curricular</CardTitle>
          <CardDescription>
            Seleccione un Programa de Formación para visualizar o editar su estructura jerárquica (Competencias ➔ RA ➔ Criterios ➔ Instrumentos).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full md:w-1/2">
            <label className="text-sm font-medium mb-2 block">Programa de Formación</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={programaId}
              onChange={(e) => setProgramaId(e.target.value)}
            >
              <option value="">Seleccione un programa...</option>
              {programas.map(p => (
                <option key={p.id} value={p.id}>
                  {p.codigo} - {p.nombre}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      )}

      {!loading && programaId && jerarquia.length === 0 && (
        <div className="p-12 text-center text-gray-500 border rounded-lg bg-gray-50">
          Este programa aún no tiene competencias registradas.
          <div className="mt-4">
            <Button variant="outline" className="text-green-700 border-green-600 hover:bg-green-50" onClick={() => setShowCompetenciaModal(true)}>
              <Plus className="w-4 h-4 mr-2" /> Agregar Competencia
            </Button>
          </div>
        </div>
      )}

      {!loading && jerarquia.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" className="text-green-700 border-green-600 hover:bg-green-50" onClick={() => setShowCompetenciaModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Añadir Competencia
            </Button>
          </div>
          {jerarquia.map((comp: any) => (
            <details key={comp.id} className="group border rounded-lg bg-white overflow-hidden shadow-sm" open>
              <summary className="flex items-center gap-2 p-4 cursor-pointer bg-green-50/50 hover:bg-green-50 transition-colors list-none font-medium text-green-900 border-b relative">
                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                <Target className="w-5 h-5 text-green-600" />
                <span>[{comp.codigo}] {comp.nombre}</span>
                <button 
                  onClick={(e) => { e.preventDefault(); setActiveCompetenciaId(comp.id); setShowRAModal(true); }}
                  className="absolute right-4 text-sm text-green-700 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Añadir RA
                </button>
              </summary>
              <div className="p-4 pl-6 space-y-4 bg-gray-50/30">
                {comp.resultadosAprendizaje?.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No hay resultados de aprendizaje. <button className="text-green-600 hover:underline" onClick={() => { setActiveCompetenciaId(comp.id); setShowRAModal(true); }}>Añadir RA</button></p>
                )}
                {comp.resultadosAprendizaje?.map((ra: any) => (
                  <details key={ra.id} className="group/ra border rounded-md bg-white overflow-hidden shadow-sm" open>
                    <summary className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 transition-colors list-none text-sm font-semibold border-b relative">
                      <ChevronRight className="w-4 h-4 transition-transform group-open/ra:rotate-90" />
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>{ra.codigo ? \`[\${ra.codigo}] \` : ''}{ra.nombre || ra.descripcion}</span>
                      <button 
                        onClick={(e) => { e.preventDefault(); setActiveRAId(ra.id); setShowCriterioModal(true); }}
                        className="absolute right-3 text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Añadir Criterio
                      </button>
                    </summary>
                    <div className="p-3 pl-8 space-y-3 bg-gray-50">
                      {ra.criteriosEvaluacion?.length === 0 && (
                        <p className="text-xs text-gray-500 italic">No hay criterios de evaluación. <button className="text-blue-600 hover:underline" onClick={() => { setActiveRAId(ra.id); setShowCriterioModal(true); }}>Añadir Criterio</button></p>
                      )}
                      {ra.criteriosEvaluacion?.map((ce: any) => (
                        <div key={ce.id} className="border rounded bg-white p-3 shadow-sm text-sm">
                          <div className="flex items-start justify-between gap-2 font-medium">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                              <span>{ce.codigo ? \`[\${ce.codigo}] \` : ''}{ce.descripcion}</span>
                            </div>
                            <button 
                              onClick={() => { setActiveCriterioId(ce.id); setShowInstrumentoModal(true); }}
                              className="text-xs text-orange-600 hover:underline flex items-center gap-1 shrink-0"
                            >
                              <Plus className="w-3 h-3" /> Añadir Instrumento
                            </button>
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
`;

fs.writeFileSync('features/academico/DisenoCurricularTree.tsx', content);
console.log('DisenoCurricularTree.tsx rewritten');
