import type { 
  AuditMetadata, 
  EstadoAprendiz, 
  NivelRiesgo, 
  Sexo, 
  TipoDocumento 
} from "./common.types";
import type { Ficha } from "./ficha.types";
import type { Institucion } from "./institucion.types";
import type { Sede } from "./sede.types";

/**
 * Aprendiz del SENA (Estudiante de Media Técnica).
 * Es la entidad central para el seguimiento.
 */
export interface Aprendiz extends AuditMetadata {
  id: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  emailSena?: string;
  emailPersonal: string;
  telefono: string;
  sexo: Sexo;
  fechaNacimiento: string; // ISO String
  
  // Ubicación académica
  fichaId: string;
  institucionId: string;
  sedeId: string;
  
  // Seguimiento
  estado: EstadoAprendiz;
  nivelRiesgo: NivelRiesgo;
  promedioAcumulado: number; // 0.0 a 5.0
  porcentajeAsistencia: number; // 0 a 100
  
  // Relaciones
  ficha?: Ficha;
  institucion?: Institucion;
  sede?: Sede;
}

export interface FiltrosAprendiz {
  busqueda?: string;
  fichaId?: string;
  institucionId?: string;
  estado?: EstadoAprendiz;
  nivelRiesgo?: NivelRiesgo;
  pagina?: number;
  tamano?: number;
}
