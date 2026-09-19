import React from "react";
import { CompetenciasTable } from "@/features/academico/CompetenciasTable";
import { getCompetenciasAction } from "@/actions/competencias.actions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function FichaCompetenciasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { rol: true, instructor: true }
  });

  const isInstructor = user?.rol?.nombre?.toUpperCase() === "INSTRUCTOR";

  const ficha = await prisma.ficha.findUnique({
    where: { id },
    include: { programa: true, institucion: true, instructores: true }
  });

  if (!ficha) {
    notFound();
  }

  // Verificación de seguridad para Instructor
  if (isInstructor) {
    const isAssigned = ficha.instructores.some(i => i.instructorId === user.instructor?.id);
    if (!isAssigned) {
      return (
        <div className="page-container space-y-6 page-enter">
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
            <p className="text-slate-600">No estás asignado a esta ficha y no tienes permisos para ver su estructura curricular.</p>
            <Link href="/competencias" className="mt-6 text-primary hover:underline flex items-center gap-2">
              <ArrowLeft size={16} /> Volver a mis fichas
            </Link>
          </div>
        </div>
      );
    }
  }

  const result = await getCompetenciasAction({ programaId: ficha.programaId });
  const initialData = result.success ? result.data : null;

  return (
    <div className="page-container space-y-6 page-enter">
      <div className="flex flex-col gap-4">
        <Link href="/competencias" className="text-sm text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 w-fit">
          <ArrowLeft size={16} /> Volver a mis fichas
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Estructura Curricular - Ficha {ficha.codigo}
          </h1>
          <p className="text-text-secondary mt-1">
            {ficha.programa?.nombre} • {ficha.institucion?.nombre}
          </p>
        </div>
      </div>

      <CompetenciasTable 
        initialData={initialData} 
        programas={[ficha.programa]} 
        readOnly={isInstructor} 
      />
    </div>
  );
}
