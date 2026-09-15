import React from "react";
import { DocentesTable } from "@/features/actores/DocentesTable";

export default function DocentesPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Docentes Pares</h1>
        <p className="text-text-secondary mt-1">
          Personal de las instituciones educativas que apoya y hace seguimiento a los estudiantes.
        </p>
      </div>

      <DocentesTable />
    </div>
  );
}
