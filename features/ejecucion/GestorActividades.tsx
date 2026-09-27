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
          
          {actividades
            .filter(act => act.nombre.toLowerCase().includes(searchActividad.toLowerCase()))
            .map((act) => (
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
                      {act.resultadoAprendizaje && (
                        <span className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 font-medium">
                          RA: {act.resultadoAprendizaje.codigo}
                        </span>
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
                      <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col items-center text-center">
                         <p className="text-gray-500 mb-4">Haz clic abajo para subir tu evidencia para esta actividad.</p>
                         <EntregaFormDialog actividadId={act.id} inlineMode={true} onClose={() => {}} onSuccess={() => fetchActividades(fichaId)} />
                      </div>
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
          ))}
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
