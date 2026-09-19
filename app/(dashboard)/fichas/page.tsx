import React from "react";
import { FichasTable } from "@/features/fichas/FichasTable";
import { getFichasAction } from "@/actions/fichas.actions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FichasPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { rol: true, aprendiz: true }
    });
    const rolUpper = user?.rol?.nombre?.toUpperCase() || "";
    if (rolUpper.includes("APRENDIZ") && user?.aprendiz?.fichaId) {
      redirect(`/fichas/${user.aprendiz.fichaId}`);
    }
  }

  const [initialResult, programas, instituciones, sedes] = await Promise.all([
    getFichasAction({ pagina: 1, tamano: 10 }),
    prisma.programa.findMany({
      where: { estado: "ACTIVO" },
      select: { id: true, codigo: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.institucion.findMany({
      where: { estado: "ACTIVO" },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.sede.findMany({
      where: { estado: "ACTIVO" },
      select: { id: true, nombre: true, institucionId: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Fichas / Grupos</h1>
        <p className="text-text-secondary mt-1">
          Administración de los grupos de formación vinculados a instituciones educativas.
        </p>
      </div>

      <FichasTable
        initialData={initialResult.success ? initialResult.data : null}
        programas={programas}
        instituciones={instituciones}
        sedes={sedes}
      />
    </div>
  );
}
