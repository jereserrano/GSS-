import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Target, BarChart3, CheckCircle, XCircle, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ResultadosPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return <div>No autorizado</div>;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { 
      rol: true,
      instructor: true,
      aprendiz: { include: { ficha: true } }
    }
  });

  const rol = user?.rol?.nombre?.toUpperCase();
  const isAprendiz = rol === "APRENDIZ";
  const isInstructor = rol === "INSTRUCTOR";

  // ==========================================
  // VISTA APRENDIZ
  // ==========================================
  if (isAprendiz && user?.aprendiz) {
    const aprendiz = user.aprendiz;
    
    // Evaluaciones del aprendiz
    const evaluaciones = await prisma.evaluacionAprendiz.findMany({
      where: { aprendizId: aprendiz.id },
      include: {
        resultadoAprendizaje: {
          include: {
            competencia: {
              include: { programa: true }
            }
          }
        }
      },
      orderBy: { actualizadoEn: "desc" }
    });

    const aprobados = evaluaciones.filter(e => e.juicio === "APROBADO").length;
    const deficientes = evaluaciones.filter(e => e.juicio === "DEFICIENTE").length;
    const pendientes = evaluaciones.filter(e => e.juicio === "PENDIENTE").length;
    const total = evaluaciones.length;

    return (
      <div className="page-container space-y-6 page-enter">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Mis Resultados Académicos</h1>
          <p className="text-text-secondary mt-1">
            Juicios valorativos de tus Resultados de Aprendizaje en la ficha {aprendiz.ficha?.codigo}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-slate-50">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-text-secondary">Evaluaciones</p>
              <p className="text-3xl font-bold text-slate-700 mt-1">{total}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-success-50">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-success-700">Aprobados (A)</p>
              <p className="text-3xl font-bold text-success-600 mt-1">{aprobados}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-danger-50">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-danger-700">Deficientes (D)</p>
              <p className="text-3xl font-bold text-danger-600 mt-1">{deficientes}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-warning-50">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-warning-700">Pendientes</p>
              <p className="text-3xl font-bold text-warning-600 mt-1">{pendientes}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="px-6 py-4">Resultado de Aprendizaje (RAP)</th>
                  <th className="px-6 py-4">Competencia</th>
                  <th className="px-6 py-4">Juicio Valorativo</th>
                  <th className="px-6 py-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {evaluaciones.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">
                      No tienes juicios valorativos registrados aún.
                    </td>
                  </tr>
                ) : (
                  evaluaciones.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{e.resultadoAprendizaje.codigo}</div>
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1" title={e.resultadoAprendizaje.nombre}>{e.resultadoAprendizaje.nombre}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700 line-clamp-2" title={e.resultadoAprendizaje.competencia?.nombre}>{e.resultadoAprendizaje.competencia?.nombre}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase
                          ${e.juicio === 'APROBADO' ? 'bg-success-100 text-success-700' : 
                            e.juicio === 'DEFICIENTE' ? 'bg-danger-100 text-danger-700' : 
                            'bg-warning-100 text-warning-700'}`}
                        >
                          {e.juicio === 'APROBADO' ? <><CheckCircle size={14}/> A (Aprobado)</> : 
                           e.juicio === 'DEFICIENTE' ? <><XCircle size={14}/> D (Deficiente)</> : 
                           <><Clock size={14}/> Pendiente</>}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {e.fecha ? new Date(e.fecha).toLocaleDateString("es-CO") : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // ==========================================
  // VISTA INSTRUCTOR / ADMIN
  // ==========================================
  
  let instructorFichaIds: string[] = [];
  if (isInstructor && user?.instructor) {
    const fichas = await prisma.ficha.findMany({
      where: { instructores: { some: { instructorId: user.instructor.id } } },
      select: { id: true }
    });
    instructorFichaIds = fichas.map(f => f.id);
  }

  const baseWhere = isInstructor ? { aprendiz: { fichaId: { in: instructorFichaIds } } } : {};

  const [totalAprendices, aprobados, pendientes, deficientes] = await Promise.all([
    prisma.evaluacionAprendiz.count({ where: baseWhere }),
    prisma.evaluacionAprendiz.count({ where: { ...baseWhere, juicio: "APROBADO" } }),
    prisma.evaluacionAprendiz.count({ where: { ...baseWhere, juicio: "PENDIENTE" } }),
    prisma.evaluacionAprendiz.count({ where: { ...baseWhere, juicio: "DEFICIENTE" } }),
  ]);

  const tasaAprobacion = totalAprendices > 0
    ? ((aprobados / totalAprendices) * 100).toFixed(1)
    : "0.0";

  // Datos por competencia para visualización
  const competencias = await prisma.competencia.findMany({
    where: { 
      estado: "ACTIVO",
      ...(isInstructor ? { programa: { fichas: { some: { id: { in: instructorFichaIds } } } } } : {})
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
          Consolidado de rendimiento por competencia y Resultados de Aprendizaje.
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
