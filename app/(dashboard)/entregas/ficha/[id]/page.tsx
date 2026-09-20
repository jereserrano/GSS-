import React from "react";
import { EntregasTable } from "@/features/ejecucion/EntregasTable";
import { getEntregasAction } from "@/actions/entregas.actions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { ArrowLeft, Users, FolderOpen } from "lucide-react";

export default async function EntregasFichaPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ busqueda?: string }> }) {
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
        <Link href="/entregas" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>
    );
  }

  // Pasar fichaId al action (para filtrar las entregas)
  const result = await getEntregasAction({ 
    busqueda: (await searchParams).busqueda,
    fichaId: ficha.id
  });
  const initialData = result.success ? result.data : null;

  const actividades = await prisma.actividad.findMany({
    where: { fichaId: ficha.id },
    select: { id: true, nombre: true },
    orderBy: { fechaVencimiento: "desc" }
  });

  const aprendices = await prisma.aprendiz.findMany({
    select: { id: true, nombres: true, apellidos: true, numeroDocumento: true },
    where: { fichaId: ficha.id, estado: "EN_FORMACION" },
    orderBy: { apellidos: "asc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <Link href={`/entregas/programa/${ficha.programa.id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
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
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Evidencias y Entregas</h1>
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
              <FolderOpen size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium leading-tight">Entregas</p>
              <p className="text-sm font-bold text-slate-700 leading-tight">{initialData?.data?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <EntregasTable 
        initialData={initialData} 
        actividades={actividades}
        aprendices={aprendices}
        fichaIdFijo={ficha.id}
      />
    </div>
  );
}
