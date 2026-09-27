import React from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Award, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { EvaluacionesTable } from "@/features/ejecucion/EvaluacionesTable";
import { getEvaluacionesAction } from "@/actions/evaluaciones.actions";

export default async function EvaluacionFichaRapPage({ params }: { params: Promise<{ rapId: string, fichaId: string }> }) {
  const { rapId, fichaId } = await params;
  const session = await getServerSession(authOptions);

  const ficha = await prisma.ficha.findUnique({
    where: { id: fichaId },
    select: { id: true, codigo: true, programa: { select: { nombre: true } } }
  });

  const rap = await prisma.resultadoAprendizaje.findUnique({
    where: { id: rapId },
    include: {
      competencia: {
        select: {
          nombre: true,
          tipo: true,
          programas: { select: { nombre: true, codigo: true } }
        }
      }
    }
  });

  if (!rap || !ficha) {
    return (
      <div className="page-container space-y-6 page-enter">
        <p className="text-red-500">Recurso no encontrado.</p>
        <Link href="/evaluaciones" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>
    );
  }

  // Aprendices de esta ficha únicamente
  const aprendices = await prisma.aprendiz.findMany({
    select: {
      id: true, nombres: true, apellidos: true, numeroDocumento: true,
      fichaId: true, ficha: { select: { id: true, codigo: true } }
    },
    where: {
      estado: "EN_FORMACION",
      fichaId: fichaId
    },
    orderBy: { apellidos: "asc" }
  });

  const rapsDisponibles = await prisma.resultadoAprendizaje.findMany({
    select: { id: true, codigo: true, nombre: true },
    where: { id: rapId }, // Only this RAP is available since the page is scoped to it
  });

  // Evaluaciones filtradas solo de este RAP y de esta ficha
  const result = await getEvaluacionesAction({ rapId, instructorFichaIds: [fichaId] });
  const initialData = result.success ? result.data : null;

  // Conteos
  const evals = await prisma.evaluacionAprendiz.findMany({
    where: {
      resultadoAprendizajeId: rapId,
      aprendiz: { fichaId: fichaId }
    },
    select: { juicio: true }
  });

  const total = evals.length;
  const totalFicha = aprendices.length;
  const aprobados = evals.filter(e => e.juicio === "APROBADO").length;
  const deficientes = evals.filter(e => e.juicio === "DEFICIENTE").length;
  const pendientes = evals.filter(e => e.juicio === "PENDIENTE").length;
  const pctAprobados = totalFicha > 0 ? Math.round((aprobados / totalFicha) * 100) : 0;

  return (
    <div className="page-container space-y-6 page-enter">
      {/* Back nav */}
      <Link href={`/evaluaciones/ficha/${ficha.id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft size={16} /> Volver a RAPs de la Ficha {ficha.codigo}
      </Link>

      {/* Header del RAP */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row gap-6">
        <div className="p-3 bg-amber-50 rounded-xl h-fit">
          <Award size={28} className="text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{rap.codigo}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              rap.competencia?.tipo === "TECNICA" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
            }`}>{rap.competencia?.tipo?.toLowerCase()}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-green-50 text-green-700 ml-auto md:ml-2">
              Ficha {ficha.codigo}
            </span>
          </div>
          <h1 className="text-xl font-bold text-text-primary">{rap.nombre}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {rap.competencia?.nombre}
          </p>
        </div>

        {/* Stats resumen */}
        <div className="flex flex-wrap gap-4 shrink-0">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-primary"><Users size={20} />{total} / {totalFicha}</div>
            <p className="text-xs text-slate-400 mt-0.5">evaluados</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-emerald-600"><CheckCircle size={18} />{aprobados}</div>
            <p className="text-xs text-slate-400 mt-0.5">aprobados</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-red-500"><XCircle size={18} />{deficientes}</div>
            <p className="text-xs text-slate-400 mt-0.5">deficientes</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-slate-400"><Clock size={18} />{pendientes}</div>
            <p className="text-xs text-slate-400 mt-0.5">pendientes</p>
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="bg-white border border-slate-200 rounded-xl px-6 py-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600 font-medium">Progreso de aprobación de la Ficha</span>
          <span className="font-bold text-primary">{pctAprobados}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all"
            style={{ width: `${pctAprobados}%` }}
          />
        </div>
      </div>

      {/* Tabla de evaluaciones filtrada por este RAP y Ficha */}
      <EvaluacionesTable
        initialData={initialData}
        raps={rapsDisponibles as any}
        aprendices={aprendices as any}
        fichas={[ficha] as any}
        rapIdFijo={rapId}
        fichaIdFijo={fichaId}
      />
    </div>
  );
}
