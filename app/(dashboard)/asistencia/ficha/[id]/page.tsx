import React from "react";
import { AsistenciaTable } from "@/features/ejecucion/AsistenciaTable";
import { getAsistenciasAction } from "@/actions/asistencia.actions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Users, CalendarCheck } from "lucide-react";

export default async function AsistenciaFichaPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ busqueda?: string }> }) {
  const { id: fichaId } = await params;
  const session = await getServerSession(authOptions);
  let instructorId: string | null = null;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { instructor: true }
    });
    if (user?.rol?.toUpperCase() === "INSTRUCTOR" && user.instructor) {
      instructorId = user.instructor.id;
    }
  }

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
        <Link href="/asistencia" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>
    );
  }

  // Pasar fichaId al action para que filtre las asistencias
  const result = await getAsistenciasAction({ 
    busqueda: (await searchParams).busqueda,
    fichaId: ficha.id,
    ...(instructorId ? { instructorId } : {})
  });
  const initialData = result.success ? result.data : null;

  const instructores = await prisma.instructor.findMany({
    select: { id: true, nombres: true, apellidos: true },
    where: { estado: "ACTIVO" },
    orderBy: { apellidos: "asc" }
  });

  const numAprendices = ficha._count.aprendices;

  return (
    <div className="page-container space-y-6 page-enter">
      <Link href={`/asistencia/programa/${ficha.programa.id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
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
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Sesiones de Asistencia</h1>
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
              <p className="text-sm font-bold text-slate-700 leading-tight">{numAprendices}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-md">
              <CalendarCheck size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium leading-tight">Sesiones</p>
              <p className="text-sm font-bold text-slate-700 leading-tight">{initialData?.data?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <AsistenciaTable 
        initialData={initialData} 
        fichas={[ficha] as any}
        instructores={instructores}
        fichaIdFijo={ficha.id}
      />
    </div>
  );
}
