import React from "react";
import { TomaAsistenciaForm } from "@/features/ejecucion/TomaAsistenciaForm";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TomarAsistenciaFichaPage({ params }: { params: Promise<{ fichaId: string }> }) {
  const { fichaId } = await params;
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

  const ficha = await prisma.ficha.findUnique({
    where: { id: fichaId },
    include: {
      programa: true,
      aprendices: {
        where: { estado: "EN_FORMACION" },
        orderBy: { apellidos: "asc" }
      }
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

  const instructores = await prisma.instructor.findMany({
    where: { estado: "ACTIVO" },
    orderBy: { apellidos: "asc" },
    select: { id: true, nombres: true, apellidos: true, userId: true }
  });

  return (
    <div className="page-container space-y-6 page-enter max-w-5xl mx-auto">
      <Link href={`/asistencia/ficha/${ficha.id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft size={16} /> Volver a Asistencia Ficha {ficha.codigo}
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Toma de Asistencia</h1>
        <p className="text-text-secondary mt-1">
          Registre la asistencia para los aprendices de la ficha {ficha.codigo}.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
        <TomaAsistenciaForm 
          fichas={[ficha] as any} 
          instructores={instructores as any}
          instructorPreseleccionado={instructorActual}
          fichaIdFijo={ficha.id}
        />
      </div>
    </div>
  );
}
