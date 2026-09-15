import React from "react";
import { DocumentosTable } from "@/features/seguimiento/DocumentosTable";

export default function DocumentosPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Repositorio de Documentos</h1>
        <p className="text-text-secondary mt-1">
          Gestión de actas, resoluciones y acuerdos de articulación con las instituciones.
        </p>
      </div>

      <DocumentosTable />
    </div>
  );
}
