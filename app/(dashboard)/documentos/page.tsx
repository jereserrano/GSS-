import React from "react";
import { DocumentosTable } from "@/features/seguimiento/DocumentosTable";
import { getDocumentosAction } from "@/actions/documentos.actions";
import { prisma } from "@/lib/prisma";

export default async function DocumentosPage({ searchParams }: { searchParams: Promise<{ busqueda?: string }> }) {
  const result = await getDocumentosAction({ busqueda: (await searchParams).busqueda });
  const initialData = result.success ? result.data : null;

  const instituciones = await prisma.institucion.findMany({
    select: { id: true, nombre: true },
    where: { estado: "ACTIVO" },
    orderBy: { nombre: "asc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Repositorio de Documentos</h1>
        <p className="text-text-secondary mt-1">
          Gestión de actas, resoluciones y acuerdos de articulación con las instituciones.
        </p>
      </div>

      <DocumentosTable initialData={initialData} instituciones={instituciones} />
    </div>
  );
}
