import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Target, BarChart3, Users, FolderOpen, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ResultadosFichaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: fichaId } = await params;

  const ficha = await prisma.ficha.findUnique({
    where: { id: fichaId },
    include: {
      programa: { select: { id: true, nombre: true, codigo: true } },
      _count: { select: { aprendices: { where: { estado: "EN_FORMACION" } } } }
    }
  });

  if (!ficha) {
    return (
      <div className="page-container space-y-6 page-enter">
        <p className="text-red-500">Ficha no encontrada.</p>
        <Link href="/resultados" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>
    );
  }

  const baseWhere = { aprendiz: { fichaId: ficha.id } };

  const [totalAprendices, aprobados, pendientes, deficientes] = await Promise.all([
    prisma.evaluacionAprendiz.count({ where: baseWhere }),
    prisma.evaluacionAprendiz.count({ where: { ...baseWhere, juicio: "APROBADO" } }),
    prisma.evaluacionAprendiz.count({ where: { ...baseWhere, juicio: "PENDIENTE" } }),
    prisma.evaluacionAprendiz.count({ where: { ...baseWhere, juicio: "DEFICIENTE" } }),
  ]);

  const tasaAprobacion = totalAprendices > 0
    ? ((aprobados / totalAprendices) * 100).toFixed(1)
    : "0.0";

  // Datos por competencia para visualización de ESA ficha específica
  const competencias = await prisma.competencia.findMany({
    where: { 
      estado: "ACTIVO",
      programas: { some: { fichas: { some: { id: ficha.id } } } }
    },
    include: {
      resultadosAprendizaje: {
        include: {
          evaluaciones: {
            where: baseWhere
          },
        },
      },
    },
    orderBy: { nombre: "asc" },
  });

  const competenciasData = competencias.map((c) => {
    const evals = c.resultadosAprendizaje.flatMap((r) => r.evaluaciones);
    const aprobadosC = evals.filter((e) => e.juicio === "APROBADO").length;
    const total = evals.length;
    const pct = total > 0 ? Math.round((aprobadosC / total) * 100) : 0;
    return { nombre: c.nombre.length > 40 ? c.nombre.substring(0, 40) + "…" : c.nombre, pct, total };
  }).filter(c => c.total > 0); // Ocultamos las competencias que no tienen evaluaciones para limpiar la vista

  return (
    <div className="page-container space-y-6 page-enter">
      <Link href={`/resultados/programa/${ficha.programa.id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft size={16} /> Volver a {ficha.programa.codigo}
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{ficha.codigo}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-green-50 text-green-700">
              FICHA
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">KPIs y Resultados Académicos</h1>
          <p className="text-text-secondary mt-1">
            {ficha.programa.nombre}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-md">
              <Users size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium leading-tight">Aprendices</p>
              <p className="text-sm font-bold text-slate-700 leading-tight">{ficha._count.aprendices}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-md">
              <Award size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium leading-tight">Eval. Registradas</p>
              <p className="text-sm font-bold text-slate-700 leading-tight">{totalAprendices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Tasa de Aprobación Global",
            valor: `${tasaAprobacion}%`,
            sub: `${aprobados} de ${totalAprendices} evaluaciones`,
            icono: Award,
            color: "text-success-600 bg-success-50",
          },
          {
            label: "Evaluaciones Pendientes",
            valor: pendientes.toLocaleString("es-CO"),
            sub: "Sin calificar aún",
            icono: Target,
            color: "text-warning-600 bg-warning-50",
          },
          {
            label: "Evaluaciones Deficientes",
            valor: deficientes.toLocaleString("es-CO"),
            sub: "Requieren refuerzo",
            icono: TrendingUp,
            color: deficientes > 0 ? "text-danger-600 bg-danger-50" : "text-success-600 bg-success-50",
          },
        ].map((stat, idx) => {
          const Icon = stat.icono;
          return (
            <Card key={idx} className="border-0 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-text-secondary font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold mt-0.5">{stat.valor}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{stat.sub}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabla de resultados por competencia */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <BarChart3 size={20} className="text-sena-500" />
          <CardTitle className="text-lg">Resultados por Competencia (Ficha {ficha.codigo})</CardTitle>
        </CardHeader>
        <CardContent>
          {competenciasData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-text-secondary italic text-sm">
              No hay evaluaciones registradas aún para esta ficha.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {competenciasData.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-primary font-medium truncate max-w-[75%]" title={c.nombre}>{c.nombre}</span>
                    <span className="text-text-secondary text-xs font-semibold">{c.pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        c.pct >= 70
                          ? "bg-success-500"
                          : c.pct >= 50
                          ? "bg-warning-500"
                          : "bg-danger-500"
                      }`}
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-text-secondary text-right">{c.total} juicios valorativos</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
