import React from "react";
import { AsistenciaTable } from "@/features/ejecucion/AsistenciaTable";
import { getAsistenciasAction } from "@/actions/asistencia.actions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AsistenciaPage({ searchParams }: { searchParams: Promise<{ busqueda?: string }> }) {
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

  // Pasar instructorId al action para que filtre las asistencias del instructor
  const result = await getAsistenciasAction({ 
    busqueda: (await searchParams).busqueda,
    ...(instructorId ? { instructorId } : {})
  });
  const initialData = result.success ? result.data : null;

  // Solo fichas del instructor si aplica
  const fichas = await prisma.ficha.findMany({
    select: { 
      id: true, 
      codigo: true,
      programa: { select: { nombre: true } }
    },
    where: { 
      estado: "ACTIVO",
      ...(instructorId ? { instructores: { some: { instructorId } } } : {})
    },
    orderBy: { codigo: "asc" }
  });

  const instructores = await prisma.instructor.findMany({
    select: { id: true, nombres: true, apellidos: true },
    where: { estado: "ACTIVO" },
    orderBy: { apellidos: "asc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Control de Asistencia</h1>
        <p className="text-text-secondary mt-1">
          Registro y seguimiento de la participación de los aprendices en las sesiones de formación.
        </p>
      </div>

      <AsistenciaTable 
        initialData={initialData} 
        fichas={fichas}
        instructores={instructores}
      />
    </div>
  );
}
