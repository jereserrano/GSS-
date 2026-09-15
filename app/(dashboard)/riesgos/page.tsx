import React from "react";
import { RiesgosTable } from "@/features/seguimiento/RiesgosTable";
import { getRiesgosAction } from "@/actions/riesgos.actions";
import { prisma } from "@/lib/prisma";

export default async function RiesgosPage({ searchParams }: { searchParams: Promise<{ busqueda?: string }> }) {
  const result = await getRiesgosAction({ busqueda: (await searchParams).busqueda });
  const initialData = result.success ? result.data : null;

  const aprendices = await prisma.aprendiz.findMany({
    select: { 
      id: true, 
      nombres: true, 
      apellidos: true, 
      numeroDocumento: true,
      ficha: { select: { codigo: true } }
    },
    where: { estado: "EN_FORMACION" },
    orderBy: { apellidos: "asc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Sistema de Riesgos</h1>
        <p className="text-text-secondary mt-1">
          Alertas tempranas por deserción, inasistencia o bajo rendimiento.
        </p>
      </div>

      <RiesgosTable initialData={initialData} aprendices={aprendices} />
    </div>
  );
}
