import React from "react";
import { EntregasTable } from "@/features/ejecucion/EntregasTable";
import { getEntregasAction } from "@/actions/entregas.actions";
import { prisma } from "@/lib/prisma";

export default async function EntregasPage({ searchParams }: { searchParams: Promise<{ busqueda?: string }> }) {
  const result = await getEntregasAction({ busqueda: (await searchParams).busqueda });
  const initialData = result.success ? result.data : null;

  const actividades = await prisma.actividad.findMany({
    select: { id: true, nombre: true },
    orderBy: { fechaVencimiento: "desc" }
  });

  const aprendices = await prisma.aprendiz.findMany({
    select: { id: true, nombres: true, apellidos: true, numeroDocumento: true },
    where: { estado: "EN_FORMACION" },
    orderBy: { apellidos: "asc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Evidencias y Entregas</h1>
        <p className="text-text-secondary mt-1">
          Revisión de las evidencias de aprendizaje subidas por los estudiantes.
        </p>
      </div>

      <EntregasTable 
        initialData={initialData} 
        actividades={actividades}
        aprendices={aprendices}
      />
    </div>
  );
}
