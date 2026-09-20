import React from "react";
import { ResultadosAprendizajeTable } from "@/features/academico/ResultadosAprendizajeTable";
import { getResultadosAprendizajeAction } from "@/actions/resultados_aprendizaje.actions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default async function ResultadosAprendizajeFichaPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ busqueda?: string }> }) {
  const { id: fichaId } = await params;
  
  const ficha = await prisma.ficha.findUnique({
    where: { id: fichaId },
    include: {
      programa: { select: { id: true, nombre: true, codigo: true } }
    }
  });

  if (!ficha) {
    return (
      <div className="page-container space-y-6 page-enter">
        <p className="text-red-500">Ficha no encontrada.</p>
        <Link href="/resultados-aprendizaje" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>
    );
  }

  const result = await getResultadosAprendizajeAction({ 
    busqueda: (await searchParams).busqueda,
    fichaId: ficha.id
  });
  
  const initialData = result.success ? result.data : null;

  const competencias = await prisma.competencia.findMany({
    select: { id: true, codigo: true, nombre: true },
    where: { 
      estado: "ACTIVO",
      programas: {
        some: {
          id: ficha.programa.id
        }
      }
    },
    orderBy: { codigo: "asc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <Link href={`/resultados-aprendizaje/programa/${ficha.programa.id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
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
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Resultados de Aprendizaje</h1>
          <p className="text-text-secondary mt-1">
            {ficha.programa.nombre}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-md">
              <BookOpen size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium leading-tight">Competencias</p>
              <p className="text-sm font-bold text-slate-700 leading-tight">{competencias.length}</p>
            </div>
          </div>
        </div>
      </div>

      <ResultadosAprendizajeTable 
        initialData={initialData} 
        competencias={competencias} 
      />
    </div>
  );
}
