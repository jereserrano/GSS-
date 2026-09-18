"use client";

import React, { useEffect, useState } from "react";
import { 
  CheckCheck, AlertTriangle, Info, Calendar, Bell, XCircle, 
  BookCheck, FileSignature, Filter, CheckCircle2 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMisNotificacionesAction, marcarTodasComoLeidasAction, marcarComoLeidaAction } from "@/actions/notificaciones.actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [filtro, setFiltro] = useState<"TODAS" | "NO_LEIDAS" | "LEIDAS">("TODAS");

  const fetchNotificaciones = async () => {
    setLoading(true);
    const res = await getMisNotificacionesAction();
    if (res.success) {
      setNotificaciones(res.data || []);
    } else {
      toast.error(res.error || "Error al cargar notificaciones");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const handleMarcarTodas = async () => {
    setMarking(true);
    const res = await marcarTodasComoLeidasAction();
    if (res.success) {
      toast.success("Todas las notificaciones marcadas como leídas");
      fetchNotificaciones();
    } else {
      toast.error(res.error || "Error al marcar");
    }
    setMarking(false);
  };

  const handleMarcarLeida = async (id: string, leida: boolean) => {
    if (leida) return;
    const res = await marcarComoLeidaAction(id);
    if (res.success) {
      fetchNotificaciones();
    }
  };

  const notificacionesFiltradas = notificaciones.filter((n) => {
    if (filtro === "NO_LEIDAS") return !n.leida;
    if (filtro === "LEIDAS") return n.leida;
    return true;
  });

  const unreadTotal = notificaciones.filter((n) => !n.leida).length;

  const getIconAndStyle = (notif: any) => {
    const tipo = (notif.tipo || "").toUpperCase();
    const titulo = (notif.titulo || "").toLowerCase();

    if (titulo.includes("aprob") || tipo === "EXITO") {
      return {
        icon: CheckCircle2,
        style: "text-[#267000] bg-[#f0fdf4] border-[#bbf7d0]"
      };
    }
    if (titulo.includes("no aprob") || tipo === "ERROR") {
      return {
        icon: XCircle,
        style: "text-red-600 bg-red-50 border-red-200"
      };
    }
    if (titulo.includes("entrega") || tipo.includes("ENTREGA")) {
      return {
        icon: FileSignature,
        style: "text-amber-700 bg-amber-50 border-amber-200"
      };
    }
    if (titulo.includes("actividad") || tipo.includes("ACTIVIDAD")) {
      return {
        icon: BookCheck,
        style: "text-[#39A900] bg-[#f0fdf4] border-[#bbf7d0]"
      };
    }
    if (tipo === "ALERTA" || titulo.includes("riesgo")) {
      return {
        icon: AlertTriangle,
        style: "text-amber-600 bg-amber-50 border-amber-200"
      };
    }
    return {
      icon: Info,
      style: "text-slate-600 bg-slate-100 border-slate-200"
    };
  };

  return (
    <div className="page-container space-y-6 page-enter pb-10">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Centro de Notificaciones</h1>
            {unreadTotal > 0 && (
              <span className="text-xs font-semibold bg-[#f0fdf4] text-[#267000] border border-[#bbf7d0] px-2 py-0.5 rounded-full">
                {unreadTotal} pendientes
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Avisos de actividades, entregas, evaluaciones y novedades académicas en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs gap-1.5 bg-white border-slate-200 hover:border-[#39A900] hover:text-[#267000]" 
            onClick={handleMarcarTodas} 
            disabled={marking || loading || unreadTotal === 0}
          >
            <CheckCheck size={14} className="text-[#39A900]" />
            <span>Marcar todo como leído</span>
          </Button>
        </div>
      </div>

      {/* Filtros de pestañas */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setFiltro("TODAS")}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            filtro === "TODAS" 
              ? "bg-[#39A900] text-white shadow-2xs" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Todas ({notificaciones.length})
        </button>
        <button
          onClick={() => setFiltro("NO_LEIDAS")}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            filtro === "NO_LEIDAS" 
              ? "bg-[#39A900] text-white shadow-2xs" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          No leídas ({unreadTotal})
        </button>
        <button
          onClick={() => setFiltro("LEIDAS")}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            filtro === "LEIDAS" 
              ? "bg-[#39A900] text-white shadow-2xs" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Leídas ({notificaciones.length - unreadTotal})
        </button>
      </div>

      {/* Lista de Notificaciones */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Cargando avisos del sistema...</div>
        ) : notificacionesFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
              <Bell size={22} />
            </div>
            <p className="text-sm font-semibold text-slate-700">No hay notificaciones</p>
            <p className="text-xs text-slate-400 mt-1">
              {filtro === "NO_LEIDAS" ? "Has revisado todos tus avisos pendientes." : "Tu bandeja de notificaciones está limpia."}
            </p>
          </div>
        ) : (
          notificacionesFiltradas.map((notif) => {
            const { icon: Icon, style } = getIconAndStyle(notif);
            
            return (
              <div 
                key={notif.id}
                onClick={() => handleMarcarLeida(notif.id, notif.leida)}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 bg-white ${
                  !notif.leida 
                    ? "border-l-4 border-l-[#39A900] border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300" 
                    : "border-slate-200 opacity-75 hover:opacity-100"
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 border ${style}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className={`text-xs font-bold leading-tight ${!notif.leida ? "text-slate-900" : "text-slate-600"}`}>
                      {notif.titulo}
                    </h2>
                    {!notif.leida && (
                      <span className="h-2 w-2 rounded-full bg-[#39A900] shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.mensaje}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                    {formatDistanceToNow(new Date(notif.creadoEn), { addSuffix: true, locale: es })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
