import React from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Users, FolderOpen } from "lucide-react";

export default async function ResultadosFichasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: programaId } = await params;
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

  const programa = await prisma.programa.findUnique({
    where: { id: programaId },
    select: { nombre: true, codigo: true, nivelFormacion: true }
  });

  if (!programa) {
    return (
      <div className="page-container space-y-6 page-enter">
        <p className="text-red-500">Programa no encontrado.</p>
        <Link href="/resultados" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>
    );
  }

  const fichasFiltro = {
    programaId,
    estado: "ACTIVO" as const,
    ...(instructorId ? { instructores: { some: { instructorId } } } : {})
  };

  const fichas = await prisma.ficha.findMany({
    where: fichasFiltro,
    include: {
      institucion: { select: { nombre: true } },
      sede: { select: { nombre: true } },
      _count: { select: { aprendices: { where: { estado: "EN_FORMACION" } } } }
    },
    orderBy: { codigo: "desc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <Link href="/resultados" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft size={16} /> Volver a Programas
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{programa.codigo}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0 bg-slate-100 text-slate-600">
            {programa.nivelFormacion}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">{programa.nombre}</h1>
        <p className="text-text-secondary mt-1">
          Selecciona una ficha para ver sus KPIs y consolidado de resultados.
        </p>
      </div>

      {fichas.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-xl">
          <FolderOpen size={40} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No hay Fichas activas</p>
          <p className="text-sm text-slate-400 mt-1">No tienes grupos activos asignados a este programa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {fichas.map((ficha) => {
            const numAprendices = ficha._count.aprendices;
            
            return (
              <Link key={ficha.id} href={`/resultados/ficha/${ficha.id}`}>
                <div className="group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer flex flex-col gap-4 h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
                      <FolderOpen size={20} className="text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide shrink-0 bg-green-50 text-green-700">
                      ACTIVA
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 mb-0.5">FICHA</p>
                    <h3 className="font-bold text-text-primary text-xl leading-snug group-hover:text-primary transition-colors">
                      {ficha.codigo}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
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
