import React from "react";
import { SeguimientoTable } from "@/features/seguimiento/SeguimientoTable";
import { getSeguimientosAction } from "@/actions/seguimientos.actions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

export default async function SeguimientoPage({ searchParams }: { searchParams: Promise<{ busqueda?: string }> }) {
  const session = await getServerSession();
  let instructorId: string | null = null;
  let aprendizId: string | null = null;
  let userRole = "ADMINISTRADOR";
  let fichaIds: string[] = [];
  
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email },
      include: { rol: true, instructor: true, aprendiz: true }
    });
    
    userRole = user?.rol?.nombre?.toUpperCase() || "ADMINISTRADOR";
    
    if (userRole === "INSTRUCTOR" && user?.instructor) {
      instructorId = user.instructor.id;
      const instructorFichas = await prisma.instructorFicha.findMany({
        where: { instructorId },
        select: { fichaId: true }
      });
      fichaIds = instructorFichas.map((f: any) => f.fichaId);
    } else if (userRole === "APRENDIZ" && user?.aprendiz) {
      aprendizId = user.aprendiz.id;
    }
  }

  const result = await getSeguimientosAction({ 
    busqueda: (await searchParams).busqueda,
    aprendizId,
    fichaIds
  });
  const initialData = result.success ? result.data : null;

  const fichas = await prisma.ficha.findMany({
    where: instructorId ? { id: { in: fichaIds } } : {},
    select: {
      id: true,
      codigo: true,
      institucion: { select: { nombre: true, id: true } },
      programa: { select: { nombre: true } },
      aprendices: {
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          numeroDocumento: true,
        },
        where: { estado: "EN_FORMACION" },
        orderBy: { nombres: "asc" }
      }
    },
    orderBy: { codigo: "desc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Visitas de Seguimiento</h1>
        <p className="text-text-secondary mt-1">
          Control de visitas técnicas y seguimiento al desarrollo de la articulación.
        </p>
      </div>

      <SeguimientoTable initialData={initialData} fichas={fichas} userRole={userRole} />
    </div>
  );
}
