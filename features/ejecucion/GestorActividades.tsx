"use client";

import { useState, useEffect } from "react";
import { getFichasSelectAction } from "@/actions/fichas.actions";
import { getActividadesByFichaAction } from "@/actions/actividades.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Calendar, FileText, CheckCircle, Clock, Users, BookCheck, FolderOpen } from "lucide-react";
import { useSession } from "next-auth/react";
import { ActividadFormDialog } from "./ActividadFormDialog";
import { EntregaFormDialog } from "./EntregaFormDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GestorActividadesProps {
  initialFichaId?: string;
  hideSelector?: boolean;
}

export function GestorActividades({ initialFichaId = "", hideSelector = false }: GestorActividadesProps = {}) {
  const { data: session, status } = useSession();
  const isAprendiz = session?.user?.role === "APRENDIZ";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [fichas, setFichas] = useState<any[]>([]);
  const [fichaId, setFichaId] = useState(initialFichaId);
  const [actividades, setActividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showActividadForm, setShowActividadForm] = useState(false);
  const [searchActividad, setSearchActividad] = useState("");

  // States for expanding an activity
  const [expandedActividadId, setExpandedActividadId] = useState<string | null>(null);
  const [gradingEntrega, setGradingEntrega] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("");

  // Fetch Fichas on load
  useEffect(() => {
    if (hideSelector && initialFichaId) {
      setFichaId(initialFichaId);
      return;
    }
    getFichasSelectAction().then(res => {
      if (res.success && res.data) {
        setFichas(res.data);
        if (isAprendiz && res.data.length > 0) {
          // If Apprentice, auto-select their first/only Ficha
          setFichaId(res.data[0]?.id || "");
        }
      }
    });
  }, [isAprendiz, hideSelector, initialFichaId]);

  // Fetch Actividades when Ficha changes
  const fetchActividades = async (fId: string) => {
    if (!fId) return;
    setLoading(true);
    // getActividadesByFichaAction should ideally include entregas
    const res = await getActividadesByFichaAction(fId);
    if (res.success && res.data) setActividades(res.data);
    setLoading(false);
  };

  useEffect(() => {
    if (mounted) {
      fetchActividades(fichaId);
    }
  }, [fichaId, mounted]);

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
          <CardTitle>Gestor de Actividades</CardTitle>
          <CardDescription>
            {hideSelector
              ? "Administra las actividades y entregas de la ficha."
              : (isAprendiz ? "Revisa tus actividades asignadas y sube tus evidencias." : "Administra las actividades de la ficha y califica las entregas en un solo lugar.")}
          </CardDescription>
        </CardHeader>
        {!hideSelector && (
          <CardContent>
            {!isAprendiz && (
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Tus Fichas Asignadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {fichas.map(f => (
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

      {!loading && fichaId && actividades.length === 0 && (
        <div className="p-12 text-center text-gray-500 border rounded-lg bg-gray-50">
          No hay actividades registradas en esta ficha.
          {!isAprendiz && (
            <div className="mt-4">
              <Button onClick={() => setShowActividadForm(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" /> Crear Primera Actividad
              </Button>
            </div>
          )}
        </div>
      )}

      {!loading && fichaId && actividades.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-1/2">
              <input 
                type="text" 
                placeholder="Buscar actividad por nombre..." 
                value={searchActividad}
                onChange={(e) => setSearchActividad(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            {!isAprendiz && (
              <div className="flex justify-end w-full sm:w-auto">
                <Button onClick={() => setShowActividadForm(true)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" /> Nueva Actividad
                </Button>
              </div>
            )}
          </div>
          
          {(() => {
            const miEmail = session?.user?.email;
            
            // Filter by search string
            const filteredActividades = actividades.filter(act => 
              act.nombre.toLowerCase().includes(searchActividad.toLowerCase())
            );

            // If not apprentice, show instructor/admin smart tabs
            if (!isAprendiz) {
              const requiresAttention = filteredActividades.filter(act => 
                act.entregas?.some((e: any) => e.estado === "PENDIENTE" || e.estado === "TARDIA")
              );
              
              const now = new Date();
              const activas = filteredActividades.filter(act => {
                const hasPending = act.entregas?.some((e: any) => e.estado === "PENDIENTE" || e.estado === "TARDIA");
                const vencimiento = new Date(act.fechaVencimiento || act.fechaFin);
                return !hasPending && vencimiento >= now;
              });

              const finalizadas = filteredActividades.filter(act => {
                const hasPending = act.entregas?.some((e: any) => e.estado === "PENDIENTE" || e.estado === "TARDIA");
                const vencimiento = new Date(act.fechaVencimiento || act.fechaFin);
                return !hasPending && vencimiento < now;
              });

              const currentTab = activeTab || (requiresAttention.length > 0 ? "atencion" : "activas");

              return (
                <Tabs className="w-full mt-4">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger active={currentTab === "atencion"} onClick={() => setActiveTab("atencion")} className="relative flex items-center justify-center gap-1.5">
                      Por Calificar
                      {requiresAttention.length > 0 && (
                        <span className="bg-red-600 text-white text-[10px] min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center font-bold shadow-md animate-pulse">
                          {requiresAttention.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger active={currentTab === "activas"} onClick={() => setActiveTab("activas")}>En Curso</TabsTrigger>
                    <TabsTrigger active={currentTab === "finalizadas"} onClick={() => setActiveTab("finalizadas")}>Finalizadas</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent active={currentTab === "atencion"} className="space-y-4">
                    {requiresAttention.length > 0 ? renderActividadesList(requiresAttention) : (
                      <div className="text-center py-8 text-slate-500 border rounded-lg bg-green-50/50">¡Todo al día! No hay entregas pendientes de calificación.</div>
                    )}
                  </TabsContent>
                  
                  <TabsContent active={currentTab === "activas"} className="space-y-4">
                    {activas.length > 0 ? renderActividadesList(activas) : (
                      <div className="text-center py-8 text-slate-500 border rounded-lg bg-slate-50">No hay actividades activas en este momento.</div>
                    )}
                  </TabsContent>

                  <TabsContent active={currentTab === "finalizadas"} className="space-y-4">
                    {finalizadas.length > 0 ? renderActividadesList(finalizadas) : (
                      <div className="text-center py-8 text-slate-500 border rounded-lg bg-slate-50">Aún no hay actividades finalizadas.</div>
                    )}
                  </TabsContent>
                </Tabs>
              );
            }

            // If apprentice, split into Pendientes and Entregadas
            const pendientes = filteredActividades.filter(act => {
              const miEntrega = act.entregas?.find((e: any) => e.aprendiz?.user?.email === miEmail);
              // It's pending if there's no submission or the submission is "DEVUELTA"
              return !miEntrega || miEntrega.estado === "NO_APROBADA" || miEntrega.estado === "DEVUELTA";
            });

            const entregadas = filteredActividades.filter(act => {
              const miEntrega = act.entregas?.find((e: any) => e.aprendiz?.user?.email === miEmail);
              // It's delivered if there's a submission and it's not rejected
              return miEntrega && miEntrega.estado !== "NO_APROBADA" && miEntrega.estado !== "DEVUELTA";
            });

            const currentTab = activeTab || "pendientes";

            return (
              <Tabs className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger active={currentTab === "pendientes"} onClick={() => setActiveTab("pendientes")}>Pendientes por Entregar</TabsTrigger>
                  <TabsTrigger active={currentTab === "entregadas"} onClick={() => setActiveTab("entregadas")}>Historial de Entregas</TabsTrigger>
                </TabsList>
                
                <TabsContent active={currentTab === "pendientes"} className="space-y-4">
                  {pendientes.length > 0 ? renderActividadesList(pendientes) : (
                    <div className="text-center py-8 text-slate-500 border rounded-lg bg-slate-50">No tienes actividades pendientes. ¡Excelente trabajo!</div>
                  )}
                </TabsContent>
                
                <TabsContent active={currentTab === "entregadas"} className="space-y-4">
                  {entregadas.length > 0 ? renderActividadesList(entregadas) : (
                    <div className="text-center py-8 text-slate-500 border rounded-lg bg-slate-50">Aún no has entregado ninguna actividad.</div>
                  )}
                </TabsContent>
              </Tabs>
            );

            function renderActividadesList(list: any[]) {
              return list.map((act) => {
                const totalEntregas = act.entregas?.length || 0;
                const pendientesEval = act.entregas?.filter((e: any) => e.estado === "PENDIENTE" || e.estado === "TARDIA").length || 0;
                const miEntrega = isAprendiz ? act.entregas?.find((e: any) => e.aprendiz?.user?.email === miEmail) : null;

                return (
            <Card key={act.id} className="overflow-hidden border shadow-sm">
              <div 
                className="p-4 bg-white cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                onClick={() => setExpandedActividadId(expandedActividadId === act.id ? null : act.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{act.nombre}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Vence: {new Date(act.fechaVencimiento || act.fechaFin).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Estado: {act.estado}</span>
                      
                      {!isAprendiz && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-medium bg-slate-50 text-slate-600">
                          📦 {totalEntregas} entregas {pendientesEval > 0 && <span className="text-red-500 font-bold ml-1">({pendientesEval} sin calificar)</span>}
                        </span>
                      )}

                      {act.resultadoAprendizaje && (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 font-medium shrink-0">
                            RA: {act.resultadoAprendizaje.codigo}
                          </span>
                          {act.resultadoAprendizaje.competencia && (
                            <span className="text-[11px] text-purple-600/80 font-medium line-clamp-1 max-w-[300px]" title={act.resultadoAprendizaje.competencia.nombre}>
                              {act.resultadoAprendizaje.competencia.nombre}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                   <Button variant="outline" size="sm">
                     {expandedActividadId === act.id ? "Ocultar Detalles" : "Ver Detalles / Entregas"}
                   </Button>
                </div>
              </div>

              {expandedActividadId === act.id && (
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {act.resultadoAprendizaje?.competencia && (
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <span className="block text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">Competencia Asociada</span>
                        <p className="text-sm text-purple-900 leading-snug">{act.resultadoAprendizaje.competencia.nombre}</p>
                      </div>
                    )}
                    {act.resultadoAprendizaje && (
                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                        <span className="block text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Resultado de Aprendizaje (RA)</span>
                        <p className="text-sm text-indigo-900 leading-snug">{act.resultadoAprendizaje.descripcion || act.resultadoAprendizaje.nombre}</p>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Instrucciones:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm bg-white p-4 rounded border">{act.instrucciones || act.descripcion}</p>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" /> 
                      {isAprendiz ? "Mi Entrega" : "Entregas de los Aprendices"}
                    </h4>
                    
                    {isAprendiz ? (
                      miEntrega && miEntrega.estado !== "NO_APROBADA" && miEntrega.estado !== "DEVUELTA" ? (
                        <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col items-start text-left animate-in fade-in">
                           <div className="flex items-center gap-2 mb-4">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                              <h5 className="font-semibold text-green-700 text-lg">Evidencia Subida Exitosamente</h5>
                           </div>
                           <div className="w-full bg-slate-50 p-4 rounded-md border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                             <div>
                               <p className="text-sm text-slate-500 mb-1">Estado de Calificación</p>
                               <span className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-700">
                                 {miEntrega.estado}
                               </span>
                             </div>
                             {miEntrega.urlArchivo && (
                               <a href={miEntrega.urlArchivo} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md text-sm font-medium transition-colors">
                                  <FileText size={16} /> Ver evidencia entregada
                               </a>
                             )}
                           </div>
                           
                           {miEntrega.calificacion && (
                             <div className="mb-4">
                               <p className="text-sm text-slate-500">Nota / Calificación asignada:</p>
                               <p className="text-xl font-black text-slate-800">{miEntrega.calificacion}</p>
                             </div>
                           )}

                           {miEntrega.retroalimentacion && (
                             <div className="mt-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200 w-full">
                               <span className="text-xs font-bold text-yellow-800 uppercase tracking-wider">Retroalimentación del Instructor:</span>
                               <p className="text-sm text-yellow-900 mt-2 whitespace-pre-wrap">{miEntrega.retroalimentacion}</p>
                             </div>
                           )}
                        </div>
                      ) : (
                        <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col items-center text-center">
                           <p className="text-gray-500 mb-4">
                             {miEntrega?.estado === "NO_APROBADA" || miEntrega?.estado === "DEVUELTA" 
                               ? "Tu entrega anterior requiere mejoras o fue devuelta. Por favor sube la evidencia corregida:" 
                               : "Haz clic abajo para subir tu evidencia para esta actividad."}
                           </p>
                           <EntregaFormDialog actividadId={act.id} inlineMode={true} onClose={() => {}} onSuccess={() => fetchActividades(fichaId)} />
                        </div>
                      )
                    ) : (
                      <div className="bg-white p-4 rounded-lg border text-sm text-gray-500">
                        {act.entregas && act.entregas.length > 0 ? (
                          <div className="space-y-2">
                             {act.entregas.map((entrega: any) => (
                               <div key={entrega.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                                  <div>
                                    <span className="font-medium text-gray-900">{entrega.aprendiz?.nombres} {entrega.aprendiz?.apellidos}</span>
                                    <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-100">{entrega.estado}</span>
                                  </div>
                                  <Button size="sm" variant="outline" onClick={() => setGradingEntrega(entrega)}>Calificar / Ver</Button>
                               </div>
                             ))}
                          </div>
                        ) : (
                          <p>Aún no hay entregas para esta actividad.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
                );
              });
            }
          })()}
        </div>
      )}

      {showActividadForm && !isAprendiz && (
         <ActividadFormDialog 
           fichas={fichas}
           fichaIdFijo={fichaId} 
           onClose={() => setShowActividadForm(false)} 
           onSuccess={() => fetchActividades(fichaId)} 
         />
      )}

      {gradingEntrega && (
         <EntregaFormDialog 
           entrega={gradingEntrega}
           actividadId={gradingEntrega.actividadId}
           actividades={[{ id: gradingEntrega.actividadId, nombre: actividades.find(a => a.id === gradingEntrega.actividadId)?.nombre || "Actividad Seleccionada" }]}
           aprendices={gradingEntrega.aprendiz ? [gradingEntrega.aprendiz] : []}
           inlineMode={false}
           onClose={() => setGradingEntrega(null)}
           onSuccess={() => {
             setGradingEntrega(null);
             fetchActividades(fichaId);
           }}
         />
      )}
    </div>
  );
}
