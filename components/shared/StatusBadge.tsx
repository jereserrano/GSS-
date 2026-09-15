import React from "react";
import { getStatusBadgeClass } from "@/lib/utils";
import type { EstadoGeneral, EstadoAprendiz } from "@/types/common.types";

interface StatusBadgeProps {
  estado: EstadoGeneral | EstadoAprendiz;
  className?: string;
}

export function StatusBadge({ estado, className }: StatusBadgeProps) {
  // Simplificación: mapeamos los estados de aprendiz a los 4 colores base
  let estadoVisual: "activo" | "inactivo" | "pendiente" | "cancelado" = "activo";
  let label: string = estado as string;

  switch (estado) {
    case "activo":
    case "en_formacion":
    case "egresado":
      estadoVisual = "activo";
      label = estado === "en_formacion" ? "En Formación" : (estado === "egresado" ? "Egresado" : "Activo");
      break;
    case "inactivo":
    case "retirado":
      estadoVisual = "inactivo";
      label = estado === "retirado" ? "Retirado" : "Inactivo";
      break;
    case "pendiente":
    case "aplazado":
      estadoVisual = "pendiente";
      label = estado === "aplazado" ? "Aplazado" : "Pendiente";
      break;
    case "cancelado":
    case "suspendido":
      estadoVisual = "cancelado";
      label = estado === "suspendido" ? "Suspendido" : "Cancelado";
      break;
  }

  const badgeClass = getStatusBadgeClass(estadoVisual);

  return (
    <span className={`${badgeClass} ${className || ""}`}>
      {label}
    </span>
  );
}
