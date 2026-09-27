import React from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, Users, FolderOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { ExploradorProgramas } from "@/components/shared/ExploradorProgramas";

export default async function AsistenciaPage() {
  const session = await getServerSession(authOptions);
  let instructorId: string | null = null;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { instructor: true, aprendiz: true }
    });
    const userRole = user?.rol?.toUpperCase() || "";
    const isAprendiz = userRole === "APRENDIZ";

    if (userRole === "INSTRUCTOR" && user.instructor) {
      instructorId = user.instructor.id;
    }
    if (isAprendiz && user?.aprendiz?.fichaId) {
      redirect(`/asistencia/ficha/${user.aprendiz.fichaId}`);
    }
  }

  const isAdminOrCoord = session?.user?.role?.toUpperCase() === "ADMINISTRADOR" || session?.user?.role?.toUpperCase() === "COORDINADOR";

  if (isAdminOrCoord) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <ExploradorProgramas basePath="/asistencia/ficha" moduloName="Asistencia" />
      </div>
    );
  }

  // Find all active fichas that the instructor has access to
  const fichasFiltro = {
    estado: "ACTIVO" as const,
    ...(instructorId ? { instructores: { some: { instructorId } } } : {})
  };

  const fichas = await prisma.ficha.findMany({
    where: fichasFiltro,
    include: {
      programa: true,
      _count: { select: { aprendices: { where: { estado: "EN_FORMACION" } } } }
    },
    orderBy: { codigo: "asc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Control de Asistencia</h1>
        <p className="text-text-secondary mt-1">
          Selecciona tu ficha (grupo) para registrar o revisar la asistencia.
        </p>
      </div>

      {fichas.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <BookOpen size={40} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No hay Fichas disponibles</p>
          <p className="text-sm text-slate-400 mt-1">No tienes grupos activos asignados en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {fichas.map((ficha) => (
            <Link key={ficha.id} href={`/asistencia/ficha/${ficha.id}`}>
              <div className="group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer flex flex-col gap-4 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-0" />
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="p-2 bg-green-50 rounded-lg shrink-0">
                    <FolderOpen size={20} className="text-green-600" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide shrink-0 bg-slate-100 text-slate-600">
                    FICHA
                  </span>
                </div>

                <div className="flex-1 relative z-10">
                  <h3 className="font-bold text-text-primary text-xl leading-snug group-hover:text-primary transition-colors">
                    {ficha.codigo}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-2" title={ficha.programa.nombre}>
                    {ficha.programa.nombre}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 relative z-10">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Users size={14} /> {ficha._count?.aprendices || 0} aprendiz{(ficha._count?.aprendices || 0) !== 1 ? "es" : ""}</span>
                    <span className="text-primary font-medium hover:underline flex items-center gap-1">
                      Gestionar asistencia <span aria-hidden="true">&rarr;</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
