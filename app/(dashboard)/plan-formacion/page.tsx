import React from "react";
import { PlanFormacionTimeline } from "@/features/academico/PlanFormacionTimeline";
import { getProgramasAction } from "@/actions/programas.actions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AsignacionCargaPanel } from "@/features/academico/AsignacionCargaPanel";

export default async function PlanFormacionPage() {
  const session = await getServerSession(authOptions);
  let programas = [];
  let instructores: any[] = [];
  let isCoordinador = false;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        aprendiz: { include: { ficha: { include: { programa: true } } } },
      },
    });

    const rolUpper = user?.rol?.toUpperCase() || "";
    if (rolUpper.includes("COORD") || rolUpper.includes("ADMIN")) {
      isCoordinador = true;
      instructores = await prisma.instructor.findMany({
        where: { estado: "ACTIVO" },
        orderBy: { apellidos: "asc" }
      });
    }

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

      {isCoordinador && (
        <div className="bg-secondary p-4 rounded-md mb-6">
          <h2 className="text-lg font-bold mb-2">Panel Interactivo de Asignación de Cargas</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Como coordinador, puedes asignar instructores a cada Resultado de Aprendizaje.
          </p>
          <AsignacionCargaPanel programas={programas} instructores={instructores} />
        </div>
      )}

      <PlanFormacionTimeline programas={programas} />
    </div>
  );
}
