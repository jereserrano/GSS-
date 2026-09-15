import React from "react";
import { SedesTable } from "@/features/sedes/SedesTable";

export default function SedesPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Sedes Educativas</h1>
        <p className="text-text-secondary mt-1">
          Gestión de los espacios físicos donde se imparte la formación técnica.
        </p>
      </div>

      <SedesTable />
    </div>
  );
}
