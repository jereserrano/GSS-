"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getPortafolioAprendizAction, PortafolioData, CompetenciaConRAs, RAConEntrega } from "@/actions/portafolio.actions";
import {
  Folder, FolderOpen, FileText, FileCheck2, AlertCircle,
  Download, ChevronRight, Loader2,
  BookOpen, Target, Archive, ExternalLink, CheckCircle2,
  Clock, XCircle, GraduationCap, Building2, RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDateShort } from "@/lib/utils";

// ─── Badge helpers ────────────────────────────────────────────────────────────

const ESTADO_BADGE: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  APROBADA:    { label: "Aprobada",   cls: "bg-emerald-100 text-emerald-800 border-emerald-200",  icon: <CheckCircle2 size={11} /> },
  CALIFICADA:  { label: "Calificada", cls: "bg-blue-100 text-blue-800 border-blue-200",          icon: <CheckCircle2 size={11} /> },
  PENDIENTE:   { label: "Pendiente",  cls: "bg-amber-100 text-amber-800 border-amber-200",        icon: <Clock size={11} /> },
  NO_APROBADA: { label: "No aprobada",cls: "bg-red-100 text-red-800 border-red-200",             icon: <XCircle size={11} /> },
  TARDIA:      { label: "Tardía",     cls: "bg-orange-100 text-orange-800 border-orange-200",    icon: <AlertCircle size={11} /> },
};

function EstadoBadge({ estado }: { estado: string }) {
  const cfg = ESTADO_BADGE[estado] ?? { label: estado, cls: "bg-slate-100 text-slate-600 border-slate-200", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

const FASE_COLOR: Record<string, string> = {
  ANALISIS:   "bg-violet-100 text-violet-700",
  PLANEACION: "bg-sky-100 text-sky-700",
  EJECUCION:  "bg-teal-100 text-teal-700",
  EVALUACION: "bg-orange-100 text-orange-700",
};

// ─── RA Row ───────────────────────────────────────────────────────────────────

function RARow({ ra }: { ra: RAConEntrega }) {
  const hasFile = !!ra.entrega?.urlArchivo;
  const isExternal = hasFile && !ra.entrega!.urlArchivo!.startsWith("/");

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border transition-all ${
      hasFile
        ? "bg-emerald-50/60 border-emerald-200/70 hover:bg-emerald-50"
        : "bg-slate-50/60 border-slate-200/50 hover:bg-slate-50"
    }`}>
      {/* File icon */}
      <div className={`mt-0.5 shrink-0 p-1.5 rounded-md ${hasFile ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
        {hasFile ? <FileCheck2 size={14} /> : <FileText size={14} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{ra.codigo}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${FASE_COLOR[ra.fase] ?? "bg-slate-100 text-slate-600"}`}>
            {ra.fase}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-700 leading-snug line-clamp-2">{ra.nombre}</p>

        {ra.entrega ? (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <EstadoBadge estado={ra.entrega.estado} />
            {ra.entrega.calificacion && (
              <span className={`font-bold ${Number(ra.entrega.calificacion) >= 3.5 ? "text-emerald-600" : "text-red-600"}`}>
                Nota: {ra.entrega.calificacion}
              </span>
            )}
            <span className="text-slate-400">{formatDateShort(ra.entrega.fechaEntrega)}</span>
            <span className="text-slate-400 text-[11px] truncate max-w-[200px]">
              {ra.entrega.actividad.nombre}
            </span>
          </div>
        ) : (
          <p className="mt-1.5 text-xs text-slate-400 italic">Sin evidencia entregada aún</p>
        )}
      </div>

      {/* Action */}
      {hasFile && (
        <a
          href={ra.entrega!.urlArchivo!}
          target={isExternal ? "_blank" : "_self"}
          rel="noopener noreferrer"
          download={!isExternal}
          className="shrink-0 mt-0.5 p-1.5 rounded-md text-emerald-600 hover:bg-emerald-100 transition-colors"
          title="Descargar evidencia"
        >
          {isExternal ? <ExternalLink size={15} /> : <Download size={15} />}
        </a>
      )}
    </div>
  );
}

// ─── Competencia Accordion ────────────────────────────────────────────────────

function CompetenciaCard({ comp, index }: { comp: CompetenciaConRAs; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const total = comp.resultadosAprendizaje.length;
  const conEvidencia = comp.resultadosAprendizaje.filter(r => !!r.entrega?.urlArchivo).length;
  const pct = total > 0 ? Math.round((conEvidencia / total) * 100) : 0;

  const TIPO_COLOR: Record<string, string> = {
    TECNICA:     "bg-indigo-100 text-indigo-700",
    TRANSVERSAL: "bg-pink-100 text-pink-700",
    BASICA:      "bg-amber-100 text-amber-700",
  };

  return (
    <div className={`rounded-xl border transition-all overflow-hidden ${
      open ? "border-indigo-200 shadow-sm" : "border-slate-200 hover:border-slate-300"
    }`}>
      {/* Header */}
      <button
        onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${
          open ? "bg-indigo-50/70" : "bg-white hover:bg-slate-50"
        }`}
      >
        {/* Folder icon */}
        <div className={`p-2 rounded-lg shrink-0 transition-colors ${open ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
          {open ? <FolderOpen size={18} /> : <Folder size={18} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="font-mono text-xs text-slate-400">{comp.codigo}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${TIPO_COLOR[comp.tipo] ?? "bg-slate-100 text-slate-600"}`}>
              {comp.tipo}
            </span>
            <span className="text-[10px] text-slate-400">{comp.duracionHoras}h</span>
          </div>
          <p className="font-semibold text-sm text-slate-800 leading-snug line-clamp-1">{comp.nombre}</p>
        </div>

        {/* Progress */}
        <div className="shrink-0 flex flex-col items-end gap-1.5 mr-2">
          <span className="text-xs font-bold text-slate-600">{conEvidencia}/{total} RAs</span>
          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-emerald-500" : pct > 0 ? "bg-indigo-400" : "bg-slate-300"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className={`shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}>
          <ChevronRight size={18} className="text-slate-400" />
        </div>
      </button>

      {/* RA List */}
      {open && (
        <div className="px-4 pb-4 pt-2 bg-white space-y-2 border-t border-slate-100">
          {comp.urlGuia && (
            <div className="mb-4 flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
              <div className="flex items-center gap-2 text-indigo-700">
                <FileText size={16} />
                <span className="text-sm font-medium">Guía de aprendizaje de la competencia</span>
              </div>
              <a
                href={comp.urlGuia}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold bg-white text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={14} /> Descargar guía
              </a>
            </div>
          )}
          {comp.resultadosAprendizaje.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-4 text-center">No hay Resultados de Aprendizaje registrados.</p>
          ) : (
            comp.resultadosAprendizaje.map(ra => <RARow key={ra.id} ra={ra} />)
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PortafolioAprendiz() {
  const [data, setData] = useState<PortafolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getPortafolioAprendizAction();
    if (res.success) {
      setData(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/portafolio/download-zip");
      if (!res.ok) throw new Error("Error al generar el archivo");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? "Portafolio.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Portafolio descargado exitosamente");
    } catch (e: any) {
      toast.error(e.message || "Error al descargar el portafolio");
    } finally {
      setDownloading(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
            <Archive size={28} className="text-indigo-500" />
          </div>
          <Loader2 size={20} className="absolute -top-1 -right-1 animate-spin text-indigo-600" />
        </div>
        <p className="text-sm text-slate-500 animate-pulse">Construyendo tu portafolio…</p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
          <AlertCircle size={26} className="text-red-500" />
        </div>
        <div>
          <p className="font-semibold text-slate-700">No se pudo cargar el portafolio</p>
          <p className="text-sm text-slate-400 mt-1">{error}</p>
        </div>
        <Button variant="outline" onClick={loadData} className="gap-2">
          <RefreshCw size={14} /> Reintentar
        </Button>
      </div>
    );
  }

  const pctGlobal = data.totalRAs > 0 ? Math.round((data.totalEvidencias / data.totalRAs) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── Header Card ─────────────────────────────────────────────────────── */}
      <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Left: info */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl shrink-0">
                <Archive size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  Portafolio de {data.aprendiz.nombres} {data.aprendiz.apellidos}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {data.ficha.programa.nombre}
                </p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <GraduationCap size={12} /> Ficha {data.ficha.codigo}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 size={12} /> {data.ficha.institucion.nombre}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: stats + download */}
            <div className="flex flex-col items-end gap-3 shrink-0">
              {/* Global progress */}
              <div className="w-52">
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                  <span>Evidencias subidas</span>
                  <span className={pctGlobal === 100 ? "text-emerald-600" : "text-indigo-600"}>
                    {data.totalEvidencias}/{data.totalRAs}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${pctGlobal === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                    style={{ width: `${pctGlobal}%` }}
                  />
                </div>
                <p className="text-right text-[11px] text-slate-400 mt-1">{pctGlobal}% completo</p>
              </div>

              {/* Download button */}
              <Button
                onClick={handleDownloadZip}
                disabled={downloading}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                id="portafolio-descargar-zip"
              >
                {downloading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Download size={15} />
                )}
                {downloading ? "Generando ZIP…" : "Copia de Seguridad (.zip)"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Stats Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Competencias",  value: data.competencias.length,  color: "text-indigo-600", bg: "bg-indigo-50", icon: <BookOpen size={16} /> },
          { label: "RAs Totales",   value: data.totalRAs,             color: "text-sky-600",    bg: "bg-sky-50",    icon: <Target size={16} /> },
          { label: "Con Evidencia", value: data.totalEvidencias,      color: "text-emerald-600", bg: "bg-emerald-50", icon: <FileCheck2 size={16} /> },
          { label: "Sin Evidencia", value: data.totalRAs - data.totalEvidencias, color: "text-amber-600", bg: "bg-amber-50", icon: <FileText size={16} /> },
        ].map(stat => (
          <Card key={stat.label} className="border-slate-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${stat.bg} ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Explorer ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FolderOpen size={16} className="text-indigo-500" />
            <h3 className="font-semibold text-slate-700 text-sm">Explorador de Competencias</h3>
            <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {data.competencias.length} carpetas
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            className="gap-1 text-slate-500 hover:text-indigo-600 text-xs"
          >
            <RefreshCw size={12} /> Actualizar
          </Button>
        </div>

        {data.competencias.length === 0 ? (
          <Card className="border-dashed border-slate-300">
            <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
              <Folder size={40} className="text-slate-300" />
              <p className="font-medium text-slate-500">No hay competencias registradas</p>
              <p className="text-xs text-slate-400">
                Cuando el instructor agregue competencias al programa, aparecerán aquí automáticamente.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {data.competencias.map((comp, i) => (
              <CompetenciaCard key={comp.id} comp={comp} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
