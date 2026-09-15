import type { AuditMetadata, EstadoGeneral } from "./common.types";

/**
 * Representa una Institución Educativa articulada con el SENA.
 */
export interface Institucion extends AuditMetadata {
  id: string;
  nit: string;
  nombre: string;
  rector: string;
  telefono: string;
  email: string;
  direccion: string;
  municipio: string;
  departamento: string;
  estado: EstadoGeneral;
  
  // En Fase 2 estas relaciones vendrán pobladas si se solicitan en la query
  sedes?: string[]; // IDs de sedes
}

export interface FiltrosInstitucion {
  busqueda?: string;
  municipio?: string;
  estado?: EstadoGeneral;
  pagina?: number;
  tamano?: number;
}
