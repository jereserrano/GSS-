"use client";

import { useState, useEffect } from "react";
import { getActividadesAction } from "@/actions/actividades.actions";
import { getSedesAction } from "@/actions/sedes.actions";
import { getInstructoresAction } from "@/actions/instructores.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

export function GestorActividadesGlobal() {
  const { data: session } = useSession();
  const [actividades, setActividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [sedeId, setSedeId] = useState("ALL");
  const [instructorId, setInstructorId] = useState("ALL");
  
  const [sedes, setSedes] = useState<any[]>([]);
  const [instructores, setInstructores] = useState<any[]>([]);

  useEffect(() => {
    getSedesAction().then(res => {
      if(res.success && res.data) setSedes(res.data.data || []);
    });
    getInstructoresAction({ tamano: 100 }).then(res => {
      if(res.success && res.data) setInstructores(res.data.data || []);
    });
  }, []);

  const fetchActividades = async () => {
    setLoading(true);
    const filtros: any = { tamano: 50 };
    if (busqueda) filtros.busqueda = busqueda;
    if (sedeId !== "ALL") filtros.sedeId = sedeId;
    if (instructorId !== "ALL") filtros.instructorId = instructorId;

    const res = await getActividadesAction(filtros);
    if (res.success && res.data) {
      setActividades(res.data.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchActividades();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [busqueda, sedeId, instructorId]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestor Global de Actividades</CardTitle>
          <CardDescription>
            Vista administrativa para coordinadores. Filtra actividades de múltiples fichas, sedes e instructores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar actividad..."
                className="pl-9"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            
            <select 
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={sedeId} 
              onChange={(e) => setSedeId(e.target.value)}
            >
              <option value="ALL">Todas las Sedes</option>
              {sedes.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>

            <select 
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={instructorId} 
              onChange={(e) => setInstructorId(e.target.value)}
            >
              <option value="ALL">Todos los Instructores</option>
              {instructores.map(i => (
                <option key={i.id} value={i.id}>{i.nombres} {i.apellidos}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#39A900]" /></div>
          ) : actividades.length === 0 ? (
            <div className="text-center p-8 text-slate-500 border rounded-lg bg-slate-50">
              No se encontraron actividades con los filtros actuales.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b">
                  <tr>
                    <th className="p-3">Actividad</th>
                    <th className="p-3">Ficha</th>
                    <th className="p-3">Instructor</th>
                    <th className="p-3">Vencimiento</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-center">Entregas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {actividades.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="font-medium text-slate-800">{act.nombre}</div>
                        <div className="text-xs text-slate-500">{act.tipo}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-700">{act.ficha?.codigo}</div>
                        <div className="text-[10px] text-slate-500 max-w-[150px] truncate" title={act.ficha?.programa?.nombre}>
                          {act.ficha?.programa?.nombre}
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">
                        {act.instructor?.nombres} {act.instructor?.apellidos}
                      </td>
                      <td className="p-3 text-slate-600">
                        {format(new Date(act.fechaVencimiento), "dd/MM/yyyy HH:mm")}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide
                          ${act.estado === 'ACTIVA' || act.estado === 'PUBLICADA' ? 'bg-green-50 text-green-700 border-green-200' : 
                            act.estado === 'CERRADA' ? 'bg-slate-100 text-slate-600 border-slate-200' : 
                            'bg-amber-50 text-amber-700 border-amber-200'}
                        `}>
                          {act.estado}
                        </span>
                      </td>
                      <td className="p-3 text-center text-slate-600 font-medium">
                        {act._count?.entregas || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
