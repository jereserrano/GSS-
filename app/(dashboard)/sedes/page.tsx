import React from "react";
import { SedesTable } from "@/features/sedes/SedesTable";
import { getSedesAction } from "@/actions/sedes.actions";
import { prisma } from "@/lib/prisma";

export default async function SedesPage() {
  const [initialResult, instituciones] = await Promise.all([
    getSedesAction({ pagina: 1, tamano: 10 }),
    prisma.institucion.findMany({
      where: { estado: "ACTIVO" },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Sedes Educativas</h1>
        <p className="text-text-secondary mt-1">
          Gestión de los espacios físicos donde se imparte la formación técnica.
        </p>
      </div>

      <SedesTable
        initialData={initialResult.success ? initialResult.data : null}
        instituciones={instituciones}
      />
    </div>
  );
}
