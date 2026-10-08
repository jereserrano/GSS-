"use client";

import { useState, useEffect } from "react";
import { getFichasSelectAction } from "@/actions/fichas.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Activity, AlertTriangle, UserX, Loader2, FolderOpen, Users, BookCheck, Shield } from "lucide-react";
import { getRiesgosAction } from "@/actions/riesgos.actions";
import { getAprendizPropioAction } from "@/actions/aprendices.actions";

interface SeguimientoRiesgosConsolidadoProps {
  initialFichaId?: string;
  hideSelector?: boolean;
}

export function SeguimientoRiesgosConsolidado({ initialFichaId = "", hideSelector = false }: SeguimientoRiesgosConsolidadoProps = {}) {
  const { data: session, status } = useSession();
  const isAprendiz = session?.user?.role === "APRENDIZ";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [fichas, setFichas] = useState<any[]>([]);
  const [fichaId, setFichaId] = useState(initialFichaId);
  const [aprendizId, setAprendizId] = useState<string | null>(null);

  const [stats, setStats] = useState({ academico: 0, desercion: 0, general: 0 });
  const [riesgosList, setRiesgosList] = useState<any[]>([]);

  useEffect(() => {
    if (hideSelector && initialFichaId) {
      setFichaId(initialFichaId);
      return;
    }
    getFichasSelectAction().then(res => {
      if (res.success && res.data) {
        setFichas(res.data);
        if (isAprendiz && res.data.length > 0) {
          setFichaId(res.data[0]?.id || "");
        }
      }
    });
    // If aprendiz, load their own aprendizId so we can filter only their risks
    if (isAprendiz) {
      getAprendizPropioAction().then(res => {
        if (res.success && res.data?.id) {
          setAprendizId(res.data.id);
        }
      });
    }
  }, [isAprendiz, hideSelector, initialFichaId]);

  useEffect(() => {
    if (fichaId) {
      const filtros: any = { fichaIds: [fichaId], tamano: 1000 };
      // If viewing as aprendiz, only load their OWN risks (not other students')
      if (isAprendiz && aprendizId) {
        filtros.aprendizId = aprendizId;
      }
      getRiesgosAction(filtros).then(res => {
        if (res.success && res.data?.data) {
           const items = res.data.data;
           setRiesgosList(items);
           setStats({
             academico: items.filter((i: any) => i.motivo?.toLowerCase().includes("académico") || i.motivo?.toLowerCase().includes("académica") || (i.nivel === "ALTO" && !i.motivo?.toLowerCase().includes("inasistencia"))).length,
             desercion: items.filter((i: any) => i.motivo?.toLowerCase().includes("deserción") || i.motivo?.toLowerCase().includes("ausentismo") || i.motivo?.toLowerCase().includes("inasistencia")).length,
             general: items.filter((i: any) => !i.motivo?.toLowerCase().includes("académico") && !i.motivo?.toLowerCase().includes("académica") && !i.motivo?.toLowerCase().includes("deserción") && !i.motivo?.toLowerCase().includes("inasistencia")).length
           });
        }
      });
    } else {
      setStats({ academico: 0, desercion: 0, general: 0 });
      setRiesgosList([]);
    }
  }, [fichaId, isAprendiz, aprendizId]);

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
          <CardTitle>Seguimiento a Riesgos</CardTitle>
          <CardDescription>
            {hideSelector
              ? "Panel de alertas tempranas, inasistencias y riesgos para la ficha seleccionada."
              : (isAprendiz ? "Consulta si tienes alertas tempranas o seguimientos activos." : "Panel consolidado de inasistencias, bajo rendimiento y alertas conductuales.")}
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

      {fichaId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-red-200 bg-red-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-700 flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5" /> Riesgo Académico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-900 mb-4">Aprendices con 2 o más Resultados de Aprendizaje en estado "No Aprobado".</p>
              <div className="text-3xl font-bold text-red-700">{stats.academico}</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-orange-700 flex items-center gap-2 text-lg">
                <UserX className="w-5 h-5" /> Riesgo de Deserción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-900 mb-4">Aprendices con ausentismo superior al 15% en las últimas dos semanas.</p>
              <div className="text-3xl font-bold text-orange-700">{stats.desercion}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-700 flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5" /> Seguimiento General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-900 mb-4">Casos remitidos a Comité de Evaluación y Seguimiento.</p>
              <div className="text-3xl font-bold text-blue-700">{stats.general}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {fichaId && (
        <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-lg font-bold text-slate-800">Detalle de Alertas Activas</h3>
          {riesgosList.length > 0 ? (
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Aprendiz</th>
                      <th className="px-4 py-3 font-semibold">Nivel de Riesgo</th>
                      <th className="px-4 py-3 font-semibold">Motivo</th>
                      <th className="px-4 py-3 font-semibold">Descripción del Riesgo</th>
                      <th className="px-4 py-3 font-semibold">Fecha Detección</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {riesgosList.map((riesgo: any) => (
                      <tr key={riesgo.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {riesgo.aprendiz?.nombres} {riesgo.aprendiz?.apellidos}
                          <div className="text-xs text-slate-500 font-normal mt-0.5">{riesgo.aprendiz?.numeroDocumento}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border ${
                            riesgo.nivel === "ALTO" ? "bg-red-50 text-red-700 border-red-200" :
                            riesgo.nivel === "MEDIO" ? "bg-orange-50 text-orange-700 border-orange-200" :
                            "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}>
                            {riesgo.nivel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{riesgo.motivo}</td>
                        <td className="px-4 py-3 text-slate-600 max-w-sm">
                          <p className="line-clamp-2" title={riesgo.descripcion}>{riesgo.descripcion}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {new Date(riesgo.fechaDeteccion).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed rounded-xl bg-slate-50 text-slate-500 flex flex-col items-center">
              <BookCheck className="w-8 h-8 mb-2 text-slate-400" />
              <p>No hay alertas de riesgo registradas para esta ficha en este momento.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
