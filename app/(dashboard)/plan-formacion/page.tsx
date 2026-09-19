import React from "react";
import { PlanFormacionTimeline } from "@/features/academico/PlanFormacionTimeline";
import { getProgramasAction } from "@/actions/programas.actions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function PlanFormacionPage() {
  const session = await getServerSession(authOptions);
  let programas = [];

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        rol: true,
        aprendiz: { include: { ficha: { include: { programa: true } } } },
      },
    });

    const rolUpper = user?.rol?.nombre?.toUpperCase() || "";

    if (rolUpper.includes("APRENDIZ") && user?.aprendiz?.ficha?.programa) {
      // Si es aprendiz, solo ve su propio programa
      programas = [user.aprendiz.ficha.programa];
    } else {
      // Si es otro rol, ve todos los programas
      const result = await getProgramasAction({ tamano: 100 });
      programas = result.success ? result.data?.data || [] : [];
    }
  } else {
    const result = await getProgramasAction({ tamano: 100 });
    programas = result.success ? result.data?.data || [] : [];
  }

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Plan de Formación
        </h1>
        <p className="text-text-secondary mt-1">
          Ruta de aprendizaje estructurada por competencias y resultados (RAP).
        </p>
      </div>

      <PlanFormacionTimeline programas={programas} />
    </div>
  );
}
