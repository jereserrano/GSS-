import React from "react";
import { PlanFormacionTimeline } from "@/features/academico/PlanFormacionTimeline";

export default function PlanFormacionPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Plan de Formación</h1>
        <p className="text-text-secondary mt-1">
          Ruta de aprendizaje estructurada por fases y resultados (RAP).
        </p>
      </div>

      <PlanFormacionTimeline />
    </div>
  );
}
