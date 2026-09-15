import React from "react";
import { AprendicesTable } from "@/features/aprendices/AprendicesTable";
import { getAprendicesAction } from "@/actions/aprendices.actions";
import { prisma } from "@/lib/prisma";

export default async function AprendicesPage() {
  const [initialResult, fichas] = await Promise.all([
    getAprendicesAction({ pagina: 1, tamano: 10 }),
    prisma.ficha.findMany({
      where: { estado: "ACTIVO" },
      select: { id: true, codigo: true },
      orderBy: { codigo: "desc" },
    }),
  ]);

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Aprendices</h1>
        <p className="text-text-secondary mt-1">
          Gestión y seguimiento de los estudiantes vinculados al programa de Media Técnica.
        </p>
      </div>

      <AprendicesTable
        initialData={initialResult.success ? initialResult.data : null}
        fichas={fichas}
      />
    </div>
  );
}
