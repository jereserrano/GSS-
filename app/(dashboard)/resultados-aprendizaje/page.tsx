import React from "react";
import { ResultadosAprendizajeTable } from "@/features/academico/ResultadosAprendizajeTable";

export default function ResultadosAprendizajePage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Resultados de Aprendizaje</h1>
        <p className="text-text-secondary mt-1">
          Gestión de los Resultados de Aprendizaje (RAP) que deben alcanzar los estudiantes.
        </p>
      </div>

      <ResultadosAprendizajeTable />
    </div>
  );
}
