import React from "react";
import { InstitucionesTable } from "@/features/instituciones/InstitucionesTable";

export default function InstitucionesPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Instituciones Educativas</h1>
        <p className="text-text-secondary mt-1">
          Directorio de colegios articulados con el SENA Regional Magdalena.
        </p>
      </div>

      <InstitucionesTable />
    </div>
  );
}
