import React from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Award, Users, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function EvaluacionesRapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: fichaId } = await params;
  const session = await getServerSession(authOptions);

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
        <Link href="/evaluaciones" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>
    );
  }

  // Get RAPs for the Ficha's program
  const raps = await prisma.resultadoAprendizaje.findMany({
    where: {
      competencia: {
        programas: { some: { id: ficha.programa.id } }
      }
    },
    include: {
      competencia: {
        select: {
          nombre: true,
          tipo: true,
        }
      },
      evaluaciones: {
        where: { aprendiz: { fichaId: ficha.id } },
        select: { juicio: true }
      }
    },
    orderBy: { codigo: "asc" }
  });

  const totalAprendices = ficha._count.aprendices;

  return (
    <div className="page-container space-y-6 page-enter">
      <Link href={`/evaluaciones/programa/${ficha.programa.id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft size={16} /> Volver a {ficha.programa.codigo}
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{ficha.codigo}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0 bg-green-50 text-green-700">
            FICHA
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Resultados de Aprendizaje</h1>
        <p className="text-text-secondary mt-1">
          Selecciona un RAP para calificar a los aprendices de la ficha {ficha.codigo}.
        </p>
      </div>

      {raps.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-xl">
          <Award size={40} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No hay RAPs configurados</p>
          <p className="text-sm text-slate-400 mt-1">El programa de esta ficha no tiene Resultados de Aprendizaje.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {raps.map((rap) => {
            const totalEvaluados = rap.evaluaciones?.length || 0;
            const aprobados = rap.evaluaciones?.filter(e => e.juicio === "APROBADO").length || 0;
            const deficientes = rap.evaluaciones?.filter(e => e.juicio === "DEFICIENTE").length || 0;
            const pendientes = rap.evaluaciones?.filter(e => e.juicio === "PENDIENTE").length || 0;
            const pctAprobados = totalAprendices > 0 ? Math.round((aprobados / totalAprendices) * 100) : 0;

            return (
              <Link key={rap.id} href={`/evaluaciones/rap/${rap.id}/ficha/${ficha.id}`}>
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
                    <p className="text-xs text-slate-400 mt-1 truncate">
                      {rap.competencia?.nombre}
                    </p>
                  </div>

                  {/* Estadísticas */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><Users size={12} /> {totalEvaluados} / {totalAprendices} evaluados</span>
                      <span className="font-semibold text-primary">{pctAprobados}% de la ficha aprobó</span>
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
