import type { AuditMetadata, EstadoGeneral } from "./common.types";

export type NivelFormacion = "tecnico" | "tecnologo";

/**
 * Programa de formación ofertado por el SENA.
 */
export interface Programa extends AuditMetadata {
  id: string;
  codigo: string;
  version: string;
  nombre: string;
  nivel: NivelFormacion;
  duracionMeses: number;
  estado: EstadoGeneral;
}

export interface FiltrosPrograma {
  busqueda?: string;
  nivel?: NivelFormacion;
  estado?: EstadoGeneral;
  pagina?: number;
  tamano?: number;
}
