import React from "react";
import { ReportesPageClient } from "@/features/reportes/ReportesPageClient";
import { getResumenReportes, getReportesListadosAction } from "@/actions/reportes.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  const session = await getServerSession(authOptions);
  const result = await getResumenReportes();
  const resultListados = await getReportesListadosAction();
  const resumen = result.success ? result.data! : null;
  const listados = resultListados.success ? resultListados.data! : null;

  let fichas: { id: string; codigo: string; programa?: { nombre: string } | null }[] = [];

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { instructor: true }
    });

    const rol = user?.rol?.toUpperCase() || "";

    if (rol === "INSTRUCTOR" && user?.instructor) {
      const instructorFichas = await prisma.instructorFicha.findMany({
        where: { instructorId: user.instructor.id },
        include: { ficha: { include: { programa: { select: { nombre: true } } } } }
      });
      fichas = instructorFichas.map((f: any) => ({
        id: f.ficha.id,
        codigo: f.ficha.codigo,
        programa: f.ficha.programa
      }));
    } else if (["ADMINISTRADOR", "COORDINADOR", "APOYO_COORDINACION"].includes(rol) || rol.includes("ADMIN")) {
      const todasFichas = await prisma.ficha.findMany({
        where: { estado: "ACTIVO" },
        include: { programa: { select: { nombre: true } } },
        orderBy: { codigo: "asc" }
      });
      fichas = todasFichas.map(f => ({
        id: f.id,
        codigo: f.codigo,
        programa: f.programa
      }));
    }
  }

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Módulo de Reportes</h1>
        <p className="text-text-secondary mt-1">
          Generación y exportación de informes estadísticos del programa de articulación.
        </p>
      </div>

      <ReportesPageClient 
        resumen={resumen ?? null} 
        listados={listados ?? { aprendices: [], alertas: [], asistencias: [] }} 
        fichas={fichas}
      />
    </div>
  );
}
