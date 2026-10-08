"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getAprendizPropioAction } from "@/actions/aprendices.actions";
import {
  ShieldCheck, ShieldAlert, ShieldX, Loader2, BookOpen,
  TrendingUp, Calendar, ClipboardList, CheckCircle2, AlertCircle,
  ChevronRight, Sparkles, BadgeCheck
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color, sublabel }: {
  icon: any; label: string; value: string | number; color: string; sublabel?: string;
}) {
  return (
    <div className={`rounded-2xl p-5 border ${color} flex flex-col gap-3`}>
      <div className="flex items-center gap-2 text-sm font-semibold opacity-80">
        <Icon size={16} />
        {label}
      </div>
      <div className="text-4xl font-black tracking-tight leading-none">{value}</div>
      {sublabel && <p className="text-xs opacity-60 leading-snug">{sublabel}</p>}
    </div>
  );
}

const RECOMMENDATIONS: Record<string, { title: string; tips: string[] }> = {
  BAJO: {
    title: "¡Vas por buen camino! 🎉",
    tips: [
      "Sigue manteniendo tu asistencia constante.",
      "Entrega tus actividades antes de la fecha límite.",
      "Participa activamente en clases para reforzar tu aprendizaje.",
    ],
  },
  MEDIO: {
    title: "Tienes oportunidades de mejora 🔶",
    tips: [
      "Revisa tus resultados de aprendizaje pendientes.",
      "Si tienes inasistencias justificadas, radícalas en 'Mis Excusas'.",
      "Habla con tu instructor si tienes dificultades con alguna competencia.",
      "Ponerte al día ahora evita que el riesgo escale.",
    ],
  },
  ALTO: {
    title: "Se requiere acción inmediata ⚠️",
    tips: [
      "Comunícate con tu instructor o coordinador cuanto antes.",
      "Revisa cuáles actividades están pendientes y entrégalas.",
      "Verifica tu porcentaje de asistencia — el mínimo SENA es 80%.",
      "Si hay un problema personal que afecta tu formación, pide orientación al SENA.",
    ],
  },
};

const NIVEL_CONFIG = {
  ALTO: {
    bg: "bg-gradient-to-br from-red-50 to-rose-100",
    border: "border-red-200",
    icon: ShieldX,
    iconColor: "text-red-600",
    badgeBg: "bg-red-600",
    label: "Riesgo Alto",
    textColor: "text-red-700",
    ringColor: "ring-red-400",
  },
  MEDIO: {
    bg: "bg-gradient-to-br from-amber-50 to-orange-100",
    border: "border-amber-200",
    icon: ShieldAlert,
    iconColor: "text-amber-600",
    badgeBg: "bg-amber-500",
    label: "Riesgo Medio",
    textColor: "text-amber-700",
    ringColor: "ring-amber-400",
  },
  BAJO: {
    bg: "bg-gradient-to-br from-emerald-50 to-green-100",
    border: "border-emerald-200",
    icon: ShieldCheck,
    iconColor: "text-emerald-600",
    badgeBg: "bg-emerald-600",
    label: "Sin Riesgo Activo",
    textColor: "text-emerald-700",
    ringColor: "ring-emerald-400",
  },
};

export function SaludAcademicaAprendiz() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aprendiz, setAprendiz] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    setLoading(true);
    getAprendizPropioAction().then(res => {
      if (res.success && res.data) {
        setAprendiz(res.data);
      } else {
        setError(res.error || "No se pudo cargar tu información.");
      }
      setLoading(false);
    });
  }, [mounted]);

  if (!mounted || status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <ShieldCheck size={28} className="text-emerald-500" />
          </div>
          <Loader2 size={20} className="absolute -top-1 -right-1 animate-spin text-emerald-600" />
        </div>
        <p className="text-sm text-slate-500 animate-pulse">Cargando tu estado académico…</p>
      </div>
    );
  }

  if (error || !aprendiz) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
        <ShieldAlert size={36} className="text-slate-300" />
        <p className="text-sm">{error || "No se encontró tu perfil de aprendiz."}</p>
      </div>
    );
  }

  const nivel = (aprendiz.nivelRiesgo as keyof typeof NIVEL_CONFIG) || "BAJO";
  const config = NIVEL_CONFIG[nivel] || NIVEL_CONFIG.BAJO;
  const StatusIcon = config.icon;
  const recs = RECOMMENDATIONS[nivel] || RECOMMENDATIONS.BAJO;

  const asistencia = Math.round(aprendiz.porcentajeAsistencia ?? 100);
  const promedio = (aprendiz.promedioAcumulado ?? 0).toFixed(1);
  const pendientes = aprendiz.entregas?.length ?? 0;
  
  // LOGIC: Filter out "ghost" alerts that were never closed by instructors
  // We only show alerts whose severity is <= the student's current risk level.
  // E.g., If the student is now MEDIO, hide old ALTO alerts. 
  // If the student is BAJO, hide all alerts.
  const NIVEL_WEIGHT: Record<string, number> = { BAJO: 0, MEDIO: 1, ALTO: 2 };
  const currentWeight = NIVEL_WEIGHT[nivel] ?? 0;
  
  const alertasActivas = (aprendiz.alertas ?? []).filter((alerta: any) => {
    const alertWeight = NIVEL_WEIGHT[alerta.nivel] ?? 0;
    return alertWeight <= currentWeight && alertWeight > 0;
  });
  const nombre = session?.user?.name?.split(" ")[0] || aprendiz.nombres;

  const asistenciaBg = asistencia >= 85 ? "bg-emerald-50 border-emerald-200 text-emerald-800"
    : asistencia >= 70 ? "bg-amber-50 border-amber-200 text-amber-800"
    : "bg-red-50 border-red-200 text-red-800";

  const promedioBg = Number(promedio) >= 3.5 ? "bg-emerald-50 border-emerald-200 text-emerald-800"
    : Number(promedio) >= 3 ? "bg-amber-50 border-amber-200 text-amber-800"
    : "bg-red-50 border-red-200 text-red-800";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Hero: Estado Principal */}
      <div className={`rounded-3xl p-7 border-2 ${config.bg} ${config.border} flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-sm`}>
        <div className={`p-4 rounded-2xl bg-white/60 ring-4 ring-white ${config.ringColor}/20 shrink-0`}>
          <StatusIcon size={40} className={config.iconColor} />
        </div>
        <div className="flex-1">
          <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white ${config.badgeBg} mb-2`}>
            {config.label}
          </span>
          <h2 className={`text-2xl font-black ${config.textColor} leading-tight`}>
            Hola, {nombre} 👋
          </h2>
          <p className={`text-sm mt-1 ${config.textColor} opacity-80`}>
            {nivel === "BAJO"
              ? "Tu situación académica está bajo control. ¡Sigue adelante!"
              : nivel === "MEDIO"
              ? "Tienes algunas alertas activas. Revisa los detalles y toma acción."
              : "Tu situación requiere atención urgente. Comunícate con tu instructor."}
          </p>
          {aprendiz.ficha && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`text-xs font-medium ${config.textColor} opacity-70 flex items-center gap-1`}>
                <BookOpen size={12} /> Ficha {aprendiz.ficha.codigo}
              </span>
              <span className={`text-xs font-medium ${config.textColor} opacity-70 flex items-center gap-1`}>
                <ChevronRight size={10} /> {aprendiz.ficha.programa?.nombre}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Métricas Clave */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Calendar}
          label="Asistencia"
          value={`${asistencia}%`}
          color={`border ${asistenciaBg}`}
          sublabel={asistencia >= 80 ? "Cumples el mínimo SENA" : "¡Atención! Mínimo requerido: 80%"}
        />
        <StatCard
          icon={TrendingUp}
          label="Promedio Acumulado"
          value={promedio}
          color={`border ${promedioBg}`}
          sublabel={Number(promedio) >= 3 ? "Aprobando el período" : "Promedio por debajo de 3.0"}
        />
        <StatCard
          icon={ClipboardList}
          label="Entregas Pendientes"
          value={pendientes}
          color={`border ${pendientes === 0 ? "bg-emerald-50 border-emerald-200 text-emerald-800" : pendientes <= 2 ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-red-50 border-red-200 text-red-800"}`}
          sublabel={pendientes === 0 ? "¡Todo al día! 🎉" : `Tienes ${pendientes} entrega${pendientes > 1 ? 's' : ''} sin hacer`}
        />
      </div>

      {/* Alertas Activas */}
      {alertasActivas.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle size={14} className="text-amber-500" />
            Alertas activas ({alertasActivas.length})
          </h3>
          {alertasActivas.map((alerta: any) => {
            const aCfg = NIVEL_CONFIG[alerta.nivel as keyof typeof NIVEL_CONFIG] || NIVEL_CONFIG.BAJO;
            return (
              <div key={alerta.id} className={`rounded-xl p-4 border ${aCfg.bg} ${aCfg.border} flex gap-3 items-start relative group cursor-default transition-all hover:shadow-md`}>
                <div className={`mt-0.5 p-1.5 rounded-lg bg-white/60 shrink-0`}>
                  <aCfg.icon size={16} className={aCfg.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold uppercase tracking-wide ${aCfg.textColor}`}>{alerta.nivel}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(alerta.fechaDeteccion).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <p className={`text-sm font-semibold mt-1 ${aCfg.textColor}`}>{alerta.motivo}</p>
                  {alerta.observaciones && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alerta.observaciones}</p>
                  )}
                  
                  {/* Tooltip con los items fallados */}
                  {aprendiz.fallas && aprendiz.fallas.length > 0 && (
                    <div className="absolute left-0 top-full mt-2 w-full z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className={`bg-white rounded-xl shadow-xl border ${aCfg.border} p-4 mx-4 relative`}>
                        <div className={`absolute -top-2 left-10 w-4 h-4 bg-white border-t border-l ${aCfg.border} transform rotate-45`}></div>
                        <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-widest">Actividades / RAPs perdidos:</p>
                        <ul className="space-y-1">
                          {aprendiz.fallas.map((falla: string, idx: number) => (
                            <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                              <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${aCfg.badgeBg}`}></span>
                              <span className="leading-snug">{falla}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 flex items-center gap-4">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <BadgeCheck size={24} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-emerald-800 text-sm">Sin alertas activas</p>
            <p className="text-xs text-emerald-700 opacity-75 mt-0.5">No tienes ninguna alerta de riesgo registrada en este momento.</p>
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Sparkles size={15} className="text-indigo-500" />
          {recs?.title || "Recomendaciones"}
        </h3>
        <ul className="space-y-2">
          {recs?.tips?.map((tip: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 size={15} className="text-indigo-400 mt-0.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
