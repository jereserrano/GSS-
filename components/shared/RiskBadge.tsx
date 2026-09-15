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
  const labelMap: Record<NivelRiesgo, string> = {
    bajo: "Riesgo Bajo",
    medio: "Riesgo Medio",
    alto: "Riesgo Alto"
  };

  return (
    <span className={`${badgeClass} ${className || ""}`}>
      {labelMap[nivel]}
    </span>
  );
}
