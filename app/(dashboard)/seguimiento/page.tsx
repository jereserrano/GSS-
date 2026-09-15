import React from "react";
import { SeguimientoTable } from "@/features/seguimiento/SeguimientoTable";
import { getSeguimientosAction } from "@/actions/seguimientos.actions";
import { prisma } from "@/lib/prisma";

export default async function SeguimientoPage({ searchParams }: { searchParams: Promise<{ busqueda?: string }> }) {
  const result = await getSeguimientosAction({ busqueda: (await searchParams).busqueda });
  const initialData = result.success ? result.data : null;

  const instituciones = await prisma.institucion.findMany({
    select: { id: true, nombre: true },
    where: { estado: "ACTIVO" },
    orderBy: { nombre: "asc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Visitas de Seguimiento</h1>
        <p className="text-text-secondary mt-1">
          Control de visitas técnicas y seguimiento al desarrollo de la articulación.
        </p>
      </div>

      <SeguimientoTable initialData={initialData} instituciones={instituciones} />
    </div>
  );
}
