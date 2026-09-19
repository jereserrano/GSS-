import React from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { Award, Users, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function EvaluacionesPage() {
  const session = await getServerSession(authOptions);
  let instructorId: string | null = null;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { rol: true, instructor: true }
    });
    if (user?.rol?.nombre?.toUpperCase() === "INSTRUCTOR" && user.instructor) {
      instructorId = user.instructor.id;
    }
  }

  const fichas = await prisma.ficha.findMany({
    where: {
      estado: "ACTIVO",
      ...(instructorId ? { instructores: { some: { instructorId } } } : {})
    },
    select: { id: true }
  });
  const fichaIds = fichas.map(f => f.id);

  const raps = await prisma.resultadoAprendizaje.findMany({
    where: instructorId ? {
      competencia: {
        programa: { fichas: { some: { id: { in: fichaIds } } } }
      }
    } : {},
    include: {
      competencia: {
        select: {
          nombre: true,
          tipo: true,
          programa: { select: { nombre: true, codigo: true } }
        }
      },
      evaluaciones: {
        where: instructorId ? {
          aprendiz: { fichaId: { in: fichaIds } }
        } : {},
        select: { juicio: true }
      }
    },
    orderBy: { codigo: "asc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Juicios Valorativos</h1>
        <p className="text-text-secondary mt-1">
          Selecciona un Resultado de Aprendizaje para ver y gestionar los juicios de tus aprendices.
        </p>
      </div>

      {raps.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <Award size={40} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No hay Resultados de Aprendizaje disponibles</p>
          <p className="text-sm text-slate-400 mt-1">Verifica que tengas fichas asignadas con un currículo configurado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {raps.map((rap) => {
            const total = rap.evaluaciones.length;
            const aprobados = rap.evaluaciones.filter(e => e.juicio === "APROBADO").length;
            const deficientes = rap.evaluaciones.filter(e => e.juicio === "DEFICIENTE").length;
            const pendientes = rap.evaluaciones.filter(e => e.juicio === "PENDIENTE").length;
            const pctAprobados = total > 0 ? Math.round((aprobados / total) * 100) : 0;

            return (
              <Link key={rap.id} href={`/evaluaciones/rap/${rap.id}`}>
                <div className="group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer flex flex-col gap-4 h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg shrink-0">
                      <Award size={20} className="text-amber-600" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide shrink-0 ${
                      rap.competencia?.tipo === "TECNICA"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-purple-50 text-purple-700"
                    }`}>
                      {rap.competencia?.tipo?.toLowerCase() || "RAP"}
                    </span>
                  </div>

                  {/* Título */}
                  <div className="flex-1">
                    <p className="text-xs font-mono text-slate-400 mb-0.5">{rap.codigo}</p>
                    <h3 className="font-semibold text-text-primary text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2" title={rap.nombre}>
                      {rap.nombre}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 truncate" title={rap.competencia?.programa?.nombre}>
                      {rap.competencia?.nombre} · {rap.competencia?.programa?.codigo}
                    </p>
                  </div>

                  {/* Estadísticas */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><Users size={12} /> {total} aprendiz{total !== 1 ? "es" : ""} evaluado{total !== 1 ? "s" : ""}</span>
                      <span className="font-semibold text-primary">{pctAprobados}% aprobados</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all"
                        style={{ width: `${pctAprobados}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1 text-emerald-700"><CheckCircle size={11} /> {aprobados} Aprobados</span>
                      <span className="flex items-center gap-1 text-red-600"><XCircle size={11} /> {deficientes} Deficientes</span>
                      <span className="flex items-center gap-1 text-slate-400"><Clock size={11} /> {pendientes} Pendientes</span>
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
