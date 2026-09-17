import React from "react";
import { DocentesTable } from "@/features/actores/DocentesTable";
import { getDocentesAction } from "@/actions/docentes.actions";
import { prisma } from "@/lib/prisma";

export default async function DocentesPage() {
  const [initialResult, instituciones] = await Promise.all([
    getDocentesAction(),
    prisma.institucion.findMany({
      where: { estado: "ACTIVO" },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Docentes</h1>
        <p className="text-text-secondary mt-1">
          Gestión de docentes asignados por las Instituciones Educativas articuladas.
        </p>
      </div>

      <DocentesTable
        initialData={initialResult}
        instituciones={instituciones}
      />
    </div>
  );
}
