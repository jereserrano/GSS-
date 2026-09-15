import React from "react";
import { AprendicesTable } from "@/features/aprendices/AprendicesTable";
import { getAprendicesAction } from "@/actions/aprendices.actions";

export default async function AprendicesPage() {
  const initialData = await getAprendicesAction({ pagina: 1, tamano: 10 });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Aprendices</h1>
        <p className="text-text-secondary mt-1">
          Gestión y seguimiento de los estudiantes vinculados al programa de Media Técnica.
        </p>
      </div>

      <AprendicesTable initialData={initialData.success ? initialData.data : null} />
    </div>
  );
}
