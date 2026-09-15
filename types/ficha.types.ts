import type { AuditMetadata, EstadoGeneral, NivelRiesgo } from "./common.types";
import type { Institucion } from "./institucion.types";
import type { Sede } from "./sede.types";
import type { Programa } from "./programa.types";

/**
 * Ficha de caracterización (Grupo de formación).
 */
export interface Ficha extends AuditMetadata {
  id: string;
  codigo: string; // Número de la ficha, ej: 2453678
  programaId: string;
  institucionId: string;
  sedeId: string;
  fechaInicio: string; // ISO String
  fechaFin: string;    // ISO String
  estado: EstadoGeneral;
  
  // KPIs caculados de la ficha
  totalAprendices: number;
  aprendicesRiesgoAlto: number;
  promedioAsistencia: number; // Porcentaje 0-100
  nivelRiesgoGeneral: NivelRiesgo;

  // Relaciones
  programa?: Programa;
  institucion?: Institucion;
  sede?: Sede;
}

export interface FiltrosFicha {
  busqueda?: string;
  programaId?: string;
  institucionId?: string;
  estado?: EstadoGeneral;
  nivelRiesgoGeneral?: NivelRiesgo;
  pagina?: number;
  tamano?: number;
}
