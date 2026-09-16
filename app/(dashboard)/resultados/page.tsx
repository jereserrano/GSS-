import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Target, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ResultadosPage() {
  // Estadísticas reales desde la BD
  const [totalAprendices, aprobados, pendientes, deficientes] = await Promise.all([
    prisma.evaluacionAprendiz.count(),
    prisma.evaluacionAprendiz.count({ where: { juicio: "APROBADO" } }),
    prisma.evaluacionAprendiz.count({ where: { juicio: "PENDIENTE" } }),
    prisma.evaluacionAprendiz.count({ where: { juicio: "DEFICIENTE" } }),
  ]);

  const tasaAprobacion = totalAprendices > 0
    ? ((aprobados / totalAprendices) * 100).toFixed(1)
    : "0.0";

  // Datos por competencia para visualización
  const competencias = await prisma.competencia.findMany({
    where: { estado: "ACTIVO" },
    include: {
      resultadosAprendizaje: {
        include: {
          evaluaciones: true,
        },
      },
    },
    take: 8,
    orderBy: { nombre: "asc" },
  });

  const competenciasData = competencias.map((c) => {
    const evals = c.resultadosAprendizaje.flatMap((r) => r.evaluaciones);
    const aprobadosC = evals.filter((e) => e.juicio === "APROBADO").length;
    const total = evals.length;
    const pct = total > 0 ? Math.round((aprobadosC / total) * 100) : 0;
    return { nombre: c.nombre.length > 40 ? c.nombre.substring(0, 40) + "…" : c.nombre, pct, total };
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Resultados Académicos</h1>
        <p className="text-text-secondary mt-1">
          Consolidado de rendimiento por competencia, RAP y ficha.
        </p>
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
          <CardTitle className="text-lg">Resultados por Competencia</CardTitle>
        </CardHeader>
        <CardContent>
          {competenciasData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-text-secondary italic text-sm">
              No hay evaluaciones registradas aún.
            </div>
          ) : (
            <div className="space-y-4">
              {competenciasData.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-primary font-medium truncate max-w-[70%]">{c.nombre}</span>
                    <span className="text-text-secondary text-xs">{c.pct}% aprobación</span>
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
                  <p className="text-xs text-text-secondary">{c.total} evaluaciones totales</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
