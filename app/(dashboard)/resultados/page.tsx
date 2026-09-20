import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Target, BarChart3, CheckCircle, XCircle, Clock, BookOpen, Users, FolderOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";

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
            competencia: true
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
  // VISTA INSTRUCTOR / ADMIN (PROGRAMAS)
  // ==========================================
  
  let instructorId: string | null = null;
  if (isInstructor && user?.instructor) {
    instructorId = user.instructor.id;
  }

  const fichasFiltro = {
    estado: "ACTIVO" as const,
    ...(instructorId ? { instructores: { some: { instructorId } } } : {})
  };

  const programas = await prisma.programa.findMany({
    where: {
      fichas: { some: fichasFiltro }
    },
    include: {
      fichas: {
        where: fichasFiltro,
        include: { _count: { select: { aprendices: { where: { estado: "EN_FORMACION" } } } } }
      }
    },
    orderBy: { nombre: "asc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Resultados Académicos - Seleccionar Programa</h1>
        <p className="text-text-secondary mt-1">
          Selecciona un programa de formación para ver los KPIs y consolidado de rendimiento por competencia de cada ficha.
        </p>
      </div>

      {programas.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <BookOpen size={40} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No hay Programas disponibles</p>
          <p className="text-sm text-slate-400 mt-1">No tienes grupos activos asignados a ningún programa en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {programas.map((prog) => {
            const numFichas = prog.fichas.length;
            const numAprendices = prog.fichas.reduce((acc, f) => acc + f._count.aprendices, 0);

            return (
              <Link key={prog.id} href={`/resultados/programa/${prog.id}`}>
                <div className="group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer flex flex-col gap-4 h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                      <BookOpen size={20} className="text-indigo-600" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide shrink-0 bg-slate-100 text-slate-600">
                      {prog.nivelFormacion}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-xs font-mono text-slate-400 mb-0.5">{prog.codigo}</p>
                    <h3 className="font-semibold text-text-primary text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2" title={prog.nombre}>
                      {prog.nombre}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><FolderOpen size={14} /> {numFichas} ficha{numFichas !== 1 ? "s" : ""}</span>
                      <span className="flex items-center gap-1.5"><Users size={14} /> {numAprendices} aprendiz{numAprendices !== 1 ? "es" : ""}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
