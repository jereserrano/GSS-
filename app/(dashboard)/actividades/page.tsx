import React from "react";
import { ActividadesTable } from "@/features/ejecucion/ActividadesTable";
import { getActividadesAction } from "@/actions/actividades.actions";
import { prisma } from "@/lib/prisma";

export default async function ActividadesPage({ searchParams }: { searchParams: Promise<{ busqueda?: string }> }) {
  const result = await getActividadesAction({ busqueda: (await searchParams).busqueda });
  const initialData = result.success ? result.data : null;

  const fichas = await prisma.ficha.findMany({
    select: { 
      id: true, 
      codigo: true,
      programa: { select: { nombre: true } }
    },
    where: { estado: "ACTIVO" },
    orderBy: { codigo: "asc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Actividades</h1>
        <p className="text-text-secondary mt-1">
          Gestión de tareas, talleres y proyectos asignados a las fichas.
        </p>
      </div>

      <ActividadesTable 
        initialData={initialData} 
        fichas={fichas}
      />
    </div>
  );
}
