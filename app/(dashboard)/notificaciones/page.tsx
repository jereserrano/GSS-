import React from "react";
import { CheckCheck, AlertTriangle, Info, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const notificaciones = [
  {
    id: "notif-1",
    tipo: "alerta",
    titulo: "Aprendiz en riesgo alto detectado",
    descripcion: "Andrés Felipe Silva Torres presenta 3 inasistencias consecutivas en la Ficha 2987654.",
    fecha: "Hace 2 horas",
    leida: false,
    icono: AlertTriangle,
    color: "text-danger-600 bg-danger-50"
  },
  {
    id: "notif-2",
    tipo: "info",
    titulo: "Actividad próxima a vencer",
    descripcion: "El taller 'Modelo Entidad-Relación' vence en 2 días. Hay 10 aprendices sin entregar.",
    fecha: "Hace 5 horas",
    leida: false,
    icono: Calendar,
    color: "text-warning-600 bg-warning-50"
  },
  {
    id: "notif-3",
    tipo: "sistema",
    titulo: "Seed completado exitosamente",
    descripcion: "La base de datos fue poblada con datos iniciales de prueba.",
    fecha: "Hace 1 día",
    leida: true,
    icono: Info,
    color: "text-info-600 bg-info-50"
  },
];

export default function NotificacionesPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Notificaciones</h1>
          <p className="text-text-secondary mt-1">
            Alertas y avisos del sistema en tiempo real.
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-surface">
          <CheckCheck size={16} /> Marcar todas como leídas
        </Button>
      </div>

      <div className="space-y-3">
        {notificaciones.map((notif) => {
          const Icon = notif.icono;
          return (
            <Card 
              key={notif.id}
              className={`border-0 shadow-sm transition-all ${!notif.leida ? "border-l-4 border-l-primary" : "opacity-70"}`}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`p-2.5 rounded-xl shrink-0 ${notif.color}`}>
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
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">{notif.descripcion}</p>
                  <span className="text-xs text-slate-400 mt-2 block">{notif.fecha}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
