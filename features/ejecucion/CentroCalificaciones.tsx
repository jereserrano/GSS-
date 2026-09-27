"use client";

import React, { useState, useEffect } from "react";
import { getFichasSelectAction } from "@/actions/fichas.actions";
import { getSabanaNotasAction, calificarMasivoAction } from "@/actions/evaluaciones.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Clock, BookOpen, Target, ChevronRight, ChevronDown, Users, BookCheck, FolderOpen, Save, ListChecks, Table } from "lucide-react";
import { useSession } from "next-auth/react";

interface CentroCalificacionesProps {
  initialFichaId?: string;
  hideSelector?: boolean;
}

export function CentroCalificaciones({ initialFichaId = "", hideSelector = false }: CentroCalificacionesProps = {}) {
  const { data: session, status } = useSession();
  const isAprendiz = session?.user?.role?.toUpperCase() === "APRENDIZ";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [fichas, setFichas] = useState<{ id: string; codigo: string; programa: { nombre: string; } }[]>([]);
  const [fichaId, setFichaId] = useState(initialFichaId);
  const [loading, setLoading] = useState(false);
  const [sabanaData, setSabanaData] = useState<any>(null);
  
  // Accordion state for Aprendiz view
  const [expandedCompetencias, setExpandedCompetencias] = useState<Record<string, boolean>>({});
  const toggleCompetencia = (compId: string) => {
    setExpandedCompetencias(prev => ({ ...prev, [compId]: !prev[compId] }));
  };

  // Accordion state for Instructor view
  const [expandedAprendices, setExpandedAprendices] = useState<Record<string, boolean>>({});
  const toggleAprendiz = (apId: string) => {
    setExpandedAprendices(prev => ({ ...prev, [apId]: !prev[apId] }));
  };

  // --- NUEVOS ESTADOS PARA CALIFICACION MASIVA ---
  const [activeTab, setActiveTab] = useState<'sabana' | 'masiva'>('sabana');
  const [selectedCompetenciaId, setSelectedCompetenciaId] = useState("");
  const [selectedRaId, setSelectedRaId] = useState("");
  const [notaGlobal, setNotaGlobal] = useState("");
  const [calificacionesBorrador, setCalificacionesBorrador] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hideSelector && initialFichaId) {
      setFichaId(initialFichaId);
      return;
    }
    getFichasSelectAction().then(res => {
      if (res.success && res.data) {
        setFichas(res.data);
        if (isAprendiz && res.data.length > 0) {
          setFichaId(res.data[0]?.id ?? "");
        }
      }
    });
  }, [isAprendiz, hideSelector, initialFichaId]);

  useEffect(() => {
    if (fichaId) {
      setLoading(true);
      getSabanaNotasAction(fichaId).then(res => {
        if (res.success) {
          setSabanaData(res.data);
        }
        setLoading(false);
      });
    } else {
      setSabanaData(null);
    }
  }, [fichaId]);

  const handleAplicarMasivo = () => {
    if (!notaGlobal || isNaN(Number(notaGlobal))) return;
    const nuevosBorradores = { ...calificacionesBorrador };
    sabanaData?.aprendices?.forEach((ap: any) => {
      nuevosBorradores[ap.id] = notaGlobal;
    });
    setCalificacionesBorrador(nuevosBorradores);
  };

  const handleGuardarMasivas = async () => {
    if (!selectedRaId) return;
    
    // Transformar a formato esperado por action
    const payload = Object.entries(calificacionesBorrador).map(([aprendizId, nota]) => ({
      aprendizId,
      nota: parseFloat(nota)
    })).filter(x => !isNaN(x.nota));

    if (payload.length === 0) return;

    setSaving(true);
    const res = await calificarMasivoAction(fichaId, selectedRaId, payload);
    if (res?.success) {
      // Limpiar y refrescar
      setNotaGlobal("");
      setCalificacionesBorrador({});
      getSabanaNotasAction(fichaId).then(resData => {
        if (resData.success) setSabanaData(resData.data);
        setSaving(false);
      });
    } else {
      alert("Error al guardar calificaciones: " + (res?.error || ""));
      setSaving(false);
    }
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
          <CardTitle>Centro de Calificaciones</CardTitle>
          <CardDescription>
            {hideSelector
              ? "Sábana de notas consolidada por Resultados de Aprendizaje (RA) para la ficha."
              : (isAprendiz ? "Consulta tu sábana de notas y resultados de aprendizaje." : "Sábana de notas consolidada por Resultados de Aprendizaje (RA).")}
          </CardDescription>
        </CardHeader>
        {!hideSelector && (
          <CardContent>
            {!isAprendiz && (
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Tus Fichas Asignadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {fichas.map((f: any) => (
                    <div
                      key={f.id}
                      onClick={() => setFichaId(prev => prev === f.id ? "" : f.id)}
                      className={`group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer flex flex-col gap-4 relative overflow-hidden ${fichaId === f.id ? 'border-primary bg-primary/5 ring-1 ring-primary/50 shadow-sm' : ''}`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-0" />
                      <div className="flex items-start justify-between gap-3 relative z-10">
                        <div className="p-2 bg-green-50 rounded-lg shrink-0">
                          <FolderOpen size={20} className="text-green-600" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide shrink-0 bg-slate-100 text-slate-600">
                          {f.programa?.nivelFormacion || "FICHA"}
                        </span>
                      </div>

                      <div className="flex-1 relative z-10">
                        <h3 className="font-bold text-text-primary text-xl leading-snug group-hover:text-primary transition-colors">
                          {f.codigo}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-2" title={f.programa?.nombre}>
                          {f.programa?.nombre}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-2 relative z-10">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1.5"><Users size={14} /> {f._count?.aprendices || 0} aprendices</span>
                          <span className="flex items-center gap-1.5 text-primary font-medium"><BookCheck size={14} /> {f._count?.actividades || 0} actividades</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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

      {!loading && fichaId && sabanaData && (
        <div className="space-y-6">
          {isAprendiz ? renderAprendizView() : (
            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                <button
                  onClick={() => setActiveTab('sabana')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'sabana' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Table className="w-4 h-4" />
                  Sábana de Progreso
                </button>
                <button
                  onClick={() => setActiveTab('masiva')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'masiva' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <ListChecks className="w-4 h-4" />
                  Calificación Masiva
                </button>
              </div>
              {activeTab === 'sabana' ? renderInstructorView() : renderCalificacionMasivaView()}
            </div>
          )}
        </div>
      )}
    </div>
  );

  function renderJuicioBadge(juicio: string) {
    if (juicio === "APROBADO") {
      return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-200"><CheckCircle className="w-3 h-3" /> Aprobado</span>;
    }
    if (juicio === "DEFICIENTE") {
      return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full border border-red-200"><XCircle className="w-3 h-3" /> Aún no Aprobado</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full border border-yellow-200"><Clock className="w-3 h-3" /> Pendiente</span>;
  }

  function renderAprendizTable(miAprendiz: any, competencias: any[]) {
    return (
      <div className="bg-white border shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold w-12 text-center"></th>
                <th className="px-4 py-3 font-semibold w-32">Código</th>
                <th className="px-4 py-3 font-semibold">Competencia / Resultado de Aprendizaje</th>
                <th className="px-4 py-3 font-semibold text-center w-48">Estado / Progreso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {competencias.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500 italic">No hay competencias registradas.</td>
                </tr>
              ) : (
                competencias.map((comp: any) => {
                  const ras = comp.resultadosAprendizaje || [];
                  const totalRAs = ras.length;
                  const aprobados = ras.filter((ra: any) => {
                    const evaluacion = miAprendiz.evaluaciones?.find((e: any) => e.resultadoAprendizajeId === ra.id);
                    return evaluacion?.juicio === "APROBADO";
                  }).length;

                  // Make keys unique per student if used in Instructor view
                  const uniqueKey = `${miAprendiz.id}-${comp.id}`;
                  const isExpanded = !!expandedCompetencias[uniqueKey];

                  return (
                    <React.Fragment key={uniqueKey}>
                      {/* Fila Maestra (Competencia) */}
                      <tr
                        onClick={() => toggleCompetencia(uniqueKey)}
                        className="hover:bg-green-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-4 text-center">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors mx-auto" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-gray-500">{comp.codigo}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-green-700 shrink-0" />
                            <span className="font-bold text-gray-800">{comp.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {totalRAs > 0 ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{aprobados} de {totalRAs} RAs</span>
                              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                                  style={{ width: `${(aprobados / totalRAs) * 100}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Sin RAs</span>
                          )}
                        </td>
                      </tr>

                      {/* Sub-filas (Resultados de Aprendizaje) */}
                      {isExpanded && (
                        <>
                          {totalRAs === 0 ? (
                            <tr className="bg-gray-50">
                              <td colSpan={4} className="px-4 py-3 pl-20 text-xs text-gray-500 italic">No hay resultados de aprendizaje.</td>
                            </tr>
                          ) : (
                            ras.map((ra: any) => {
                              const evaluacion = miAprendiz.evaluaciones?.find((e: any) => e.resultadoAprendizajeId === ra.id);
                              const juicio = evaluacion?.juicio || "PENDIENTE";
                              return (
                                <tr key={ra.id} className="bg-gray-50/80 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-colors">
                                  <td className="px-4 py-3"></td>
                                  <td className="px-4 py-3 font-mono text-[11px] text-gray-500">{ra.codigo}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-start gap-2 min-w-0 pl-4 border-l-2 border-gray-200">
                                      <Target className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                                      <span className="text-xs font-medium text-gray-700 leading-snug">{ra.nombre}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {renderJuicioBadge(juicio)}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderAprendizView() {
    const miAprendiz = sabanaData.aprendices?.find((a: any) => a.userId === session?.user?.id);

    if (!miAprendiz) {
      return <div className="p-8 text-center text-gray-500 bg-gray-50 border rounded-lg">No se encontró tu registro en esta ficha.</div>;
    }

    const competencias = sabanaData.programa?.competencias || [];
    return renderAprendizTable(miAprendiz, competencias);
  }

  function renderInstructorView() {
    const competencias = sabanaData.programa?.competencias || [];
    const aprendices = sabanaData.aprendices || [];

    let totalRAs = 0;
    competencias.forEach((comp: any) => {
      totalRAs += comp.resultadosAprendizaje?.length || 0;
    });

    if (totalRAs === 0) {
      return (
        <Card className="p-12 text-center text-slate-500 bg-slate-50 rounded-xl border-dashed">
          El programa de esta ficha no tiene Resultados de Aprendizaje registrados.
        </Card>
      );
    }

    return (
      <div className="bg-white border shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-emerald-50 text-emerald-900 border-b border-emerald-100">
              <tr>
                <th className="px-4 py-3 font-bold w-12 text-center"></th>
                <th className="px-4 py-3 font-bold w-48">Documento</th>
                <th className="px-4 py-3 font-bold">Aprendiz</th>
                <th className="px-4 py-3 font-bold text-center w-64">Progreso Global de la Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {aprendices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500 italic">No hay aprendices matriculados.</td>
                </tr>
              ) : (
                aprendices.map((ap: any) => {
                  const isExpanded = !!expandedAprendices[ap.id];

                  // Calculate global progress
                  let aprobados = 0;
                  competencias.forEach((comp: any) => {
                    comp.resultadosAprendizaje?.forEach((ra: any) => {
                      const evaluacion = ap.evaluaciones?.find((e: any) => e.resultadoAprendizajeId === ra.id);
                      if (evaluacion?.juicio === "APROBADO") aprobados++;
                    });
                  });

                  return (
                    <React.Fragment key={ap.id}>
                      <tr
                        onClick={() => toggleAprendiz(ap.id)}
                        className={`transition-colors cursor-pointer group ${isExpanded ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}
                      >
                        <td className="px-4 py-4 text-center">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors mx-auto" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-slate-500">{ap.numeroDocumento}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold shrink-0 text-xs">
                              {ap.nombres.charAt(0)}{ap.apellidos.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-800">{ap.nombres} {ap.apellidos}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{aprobados} de {totalRAs} RAs Aprobados</span>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${(aprobados / totalRAs) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={4} className="p-0 border-b border-gray-100 bg-slate-50 shadow-inner">
                            <div className="p-4 sm:p-6 sm:pl-16">
                              {renderAprendizTable(ap, competencias)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderCalificacionMasivaView() {
    const competencias = sabanaData?.programa?.competencias || [];
    const aprendices = sabanaData?.aprendices || [];
    
    const selectedCompetencia = competencias.find((c: any) => c.id === selectedCompetenciaId);
    const ras = selectedCompetencia?.resultadosAprendizaje || [];

    return (
      <Card className="border-emerald-100 shadow-sm mt-4">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">1. Seleccionar Competencia</label>
              <select 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                value={selectedCompetenciaId}
                onChange={(e) => {
                  setSelectedCompetenciaId(e.target.value);
                  setSelectedRaId("");
                }}
              >
                <option value="">-- Seleccione una competencia --</option>
                {competencias.map((comp: any) => (
                  <option key={comp.id} value={comp.id}>{comp.codigo} - {comp.nombre}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">2. Resultado de Aprendizaje (RA)</label>
              <select 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                value={selectedRaId}
                onChange={(e) => setSelectedRaId(e.target.value)}
                disabled={!selectedCompetenciaId}
              >
                <option value="">-- Seleccione un RA --</option>
                {ras.map((ra: any) => (
                  <option key={ra.id} value={ra.id}>{ra.codigo} - {ra.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedRaId && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-emerald-600" />
                    Llenado Rápido (Bulk Fill)
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="Ej. 4.5"
                      className="w-24 p-2 border border-emerald-200 rounded-lg text-sm font-bold text-emerald-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                      value={notaGlobal}
                      onChange={(e) => setNotaGlobal(e.target.value)}
                    />
                    <button 
                      onClick={handleAplicarMasivo}
                      className="flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-colors shadow-sm"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Aplicar a Todos
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={handleGuardarMasivas}
                  disabled={saving}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Calificaciones
                </button>
              </div>

              <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-slate-50 text-slate-700 border-b">
                      <tr>
                        <th className="px-4 py-3 font-semibold w-48">Documento</th>
                        <th className="px-4 py-3 font-semibold">Aprendiz</th>
                        <th className="px-4 py-3 font-semibold text-center w-40">Nota Anterior</th>
                        <th className="px-4 py-3 font-semibold text-center w-48">Nueva Nota</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {aprendices.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-500 italic">No hay aprendices matriculados.</td>
                        </tr>
                      ) : (
                        aprendices.map((ap: any) => {
                          const evaluacionActual = ap.evaluaciones?.find((e: any) => e.resultadoAprendizajeId === selectedRaId);
                          const notaActualDb = evaluacionActual?.nota ?? "";
                          const notaEditada = calificacionesBorrador[ap.id] ?? notaActualDb;
                          
                          // Pre-calcular juicio para feedback visual
                          const numNota = parseFloat(notaEditada);
                          let badgeFeedback = null;
                          if (!isNaN(numNota)) {
                            if (numNota >= 3.5) {
                              badgeFeedback = <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> APROBADO</span>;
                            } else {
                              badgeFeedback = <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> DEFICIENTE</span>;
                            }
                          }

                          return (
                            <tr key={ap.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-mono text-xs text-slate-500">{ap.numeroDocumento}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold shrink-0 text-[10px]">
                                    {ap.nombres.charAt(0)}{ap.apellidos.charAt(0)}
                                  </div>
                                  <span className="font-semibold text-slate-800">{ap.nombres} {ap.apellidos}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {evaluacionActual ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="font-mono font-bold text-slate-700">{evaluacionActual.nota !== null ? evaluacionActual.nota : "-"}</span>
                                    {renderJuicioBadge(evaluacionActual.juicio)}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">Sin calificar</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex flex-col items-center justify-center gap-1.5 h-full">
                                  <input 
                                    type="number"
                                    step="0.1"
                                    className="w-20 p-1.5 border border-slate-300 rounded text-center font-bold text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                    value={notaEditada}
                                    onChange={(e) => setCalificacionesBorrador({ ...calificacionesBorrador, [ap.id]: e.target.value })}
                                  />
                                  <div className="h-4 flex items-center justify-center">
                                    {badgeFeedback}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
}
