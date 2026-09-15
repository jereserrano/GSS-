import React from "react";
import { PlanFormacionTimeline } from "@/features/academico/PlanFormacionTimeline";
import { getProgramasAction } from "@/actions/programas.actions";

export default async function PlanFormacionPage() {
  const result = await getProgramasAction({ tamano: 100 });
  const programas = result.success ? result.data?.data || [] : [];

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Plan de Formación</h1>
        <p className="text-text-secondary mt-1">
          Ruta de aprendizaje estructurada por competencias y resultados (RAP).
        </p>
      </div>

      <PlanFormacionTimeline programas={programas} />
    </div>
  );
}
