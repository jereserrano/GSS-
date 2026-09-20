import React from "react";
import { getRiskBadgeClass } from "@/lib/utils";
import type { NivelRiesgo } from "@/types/common.types";

interface RiskBadgeProps {
  nivel: NivelRiesgo;
  className?: string;
}

export function RiskBadge({ nivel, className }: RiskBadgeProps) {
  const badgeClass = getRiskBadgeClass(nivel);
  
  // Mapeo de etiqueta para mostrar
  const labelMap: Record<string, string> = {
    bajo: "Riesgo Bajo",
    medio: "Riesgo Medio",
    alto: "Riesgo Alto",
    BAJO: "Riesgo Bajo",
    MEDIO: "Riesgo Medio",
    ALTO: "Riesgo Alto"
  };

  return (
    <span className={`${badgeClass} ${className || ""}`}>
      {labelMap[nivel]}
    </span>
  );
}
