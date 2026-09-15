import type { AuditMetadata, EstadoGeneral } from "./common.types";
import type { Institucion } from "./institucion.types";

/**
 * Representa una Sede de una Institución Educativa.
 */
export interface Sede extends AuditMetadata {
  id: string;
  institucionId: string;
  nombre: string;
  direccion: string;
  coordinador: string;
  telefono: string;
  email: string;
  estado: EstadoGeneral;
  
  // Relaciones
  institucion?: Institucion;
}

export interface FiltrosSede {
  busqueda?: string;
  institucionId?: string;
  estado?: EstadoGeneral;
  pagina?: number;
  tamano?: number;
}
