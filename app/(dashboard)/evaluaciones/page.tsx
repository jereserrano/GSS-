import React from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, Users, FolderOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { ExploradorProgramas } from "@/components/shared/ExploradorProgramas";

export default async function EvaluacionesPage() {
  const session = await getServerSession(authOptions);
  let instructorId: string | null = null;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { instructor: true, aprendiz: true }
    });
    const userRole = user?.rol?.toUpperCase() || "";
    const isAprendiz = userRole === "APRENDIZ";

    if (user && userRole === "INSTRUCTOR" && user.instructor) {
      instructorId = user.instructor.id;
    }
    if (user && isAprendiz && user.aprendiz?.fichaId) {
      redirect(`/evaluaciones/ficha/${user.aprendiz.fichaId}`);
    }
  }

  const isAdminOrCoord = session?.user?.role?.toUpperCase() === "ADMINISTRADOR" || session?.user?.role?.toUpperCase() === "COORDINADOR";

  if (isAdminOrCoord) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <ExploradorProgramas basePath="/evaluaciones/ficha" moduloName="Juicios Valorativos" />
      </div>
    );
  }

  // Find all active fichas that the instructor has access to
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
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Juicios Valorativos - Seleccionar Programa</h1>
        <p className="text-text-secondary mt-1">
          Selecciona un programa de formación para ver los grupos (fichas) asignados a calificar.
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
              <Link key={prog.id} href={`/evaluaciones/programa/${prog.id}`}>
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
