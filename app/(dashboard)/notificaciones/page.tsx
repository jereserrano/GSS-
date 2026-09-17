"use client";

import React, { useEffect, useState } from "react";
import { CheckCheck, AlertTriangle, Info, Calendar, Bell, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMisNotificacionesAction, marcarTodasComoLeidasAction, marcarComoLeidaAction } from "@/actions/notificaciones.actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const ICONS: Record<string, any> = {
  ALERTA: AlertTriangle,
  INFO: Info,
  EXITO: CheckCheck,
  ERROR: XCircle,
};

const COLORS: Record<string, string> = {
  ALERTA: "text-warning-600 bg-warning-50",
  INFO: "text-info-600 bg-info-50",
  EXITO: "text-success-600 bg-success-50",
  ERROR: "text-danger-600 bg-danger-50",
};

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

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

  return (
    <div className="page-container space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Notificaciones</h1>
          <p className="text-text-secondary mt-1">
            Alertas y avisos del sistema en tiempo real.
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-surface" onClick={handleMarcarTodas} disabled={marking || loading || notificaciones.every(n => n.leida)}>
          <CheckCheck size={16} /> Marcar todas como leídas
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-text-secondary">Cargando notificaciones...</div>
        ) : notificaciones.length === 0 ? (
          <div className="text-center py-10 text-text-secondary flex flex-col items-center gap-2">
            <Bell size={40} className="text-slate-300" />
            <p>No tienes notificaciones por el momento.</p>
          </div>
        ) : (
          notificaciones.map((notif) => {
            const Icon = ICONS[notif.tipo] || Bell;
            const color = COLORS[notif.tipo] || COLORS.INFO;
            
            return (
              <Card 
                key={notif.id}
                onClick={() => handleMarcarLeida(notif.id, notif.leida)}
                className={`border-0 shadow-sm transition-all cursor-pointer hover:shadow-md ${!notif.leida ? "border-l-4 border-l-primary" : "opacity-70"}`}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl shrink-0 ${color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-semibold ${!notif.leida ? "text-text-primary" : "text-text-secondary"}`}>
                        {notif.titulo}
                      </h3>
                      {!notif.leida && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">{notif.mensaje}</p>
                    <span className="text-xs text-slate-400 mt-2 block">
                      {formatDistanceToNow(new Date(notif.creadoEn), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
