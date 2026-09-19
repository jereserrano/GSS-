import React from "react";
import { TomaAsistenciaForm } from "@/features/ejecucion/TomaAsistenciaForm";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function TomarAsistenciaPage() {
  const session = await getServerSession(authOptions);
  let instructorId: string | null = null;
  let instructorActual: any = null;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { rol: true, instructor: true }
    });
    if (user?.rol?.nombre?.toUpperCase() === "INSTRUCTOR" && user.instructor) {
      instructorId = user.instructor.id;
      instructorActual = user.instructor;
    }
  }

  // Si es Instructor, solo carga SUS fichas con SUS aprendices
  // Si es Admin/Coordinador, carga todo
  const fichas = await prisma.ficha.findMany({
    where: {
      estado: "ACTIVO",
      ...(instructorId ? { instructores: { some: { instructorId } } } : {})
    },
    include: {
      programa: true,
      aprendices: {
        where: { estado: "EN_FORMACION" },
        orderBy: { apellidos: "asc" }
      }
    },
    orderBy: { codigo: "asc" }
  });

  const instructores = await prisma.instructor.findMany({
    where: { estado: "ACTIVO" },
    orderBy: { apellidos: "asc" },
    select: { id: true, nombres: true, apellidos: true, userId: true }
  });

  return (
    <div className="page-container space-y-6 page-enter max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Toma de Asistencia (Modo Lista)</h1>
        <p className="text-text-secondary mt-1">
          Seleccione una ficha para desplegar el listado de aprendices y registrar la asistencia de forma masiva.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
        <TomaAsistenciaForm 
          fichas={fichas as any} 
          instructores={instructores as any}
          instructorPreseleccionado={instructorActual}
        />
      </div>
    </div>
  );
}
