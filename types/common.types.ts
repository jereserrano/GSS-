/**
 * types/common.types.ts
 * ─────────────────────────────────────────────────────────────────
 * Tipos compartidos por todas las entidades del sistema.
 * Estos tipos son la interfaz pública entre Fase 1 (mock) y Fase 2
 * (API real). No modificar sin evaluar impacto en ambas fases.
 * ─────────────────────────────────────────────────────────────────
 */

/* ── Niveles de riesgo — usados en Aprendices, Fichas, Reportes ── */
export type NivelRiesgo = "bajo" | "medio" | "alto";

/* ── Estados generales de entidades ── */
export type EstadoGeneral = "activo" | "inactivo" | "pendiente" | "cancelado";

/* ── Estados específicos de aprendices ── */
export type EstadoAprendiz =
  | "en_formacion"   /* Cursando activamente */
  | "aplazado"       /* Aplazado temporalmente */
  | "retirado"       /* Retirado definitivamente */
  | "egresado"       /* Completó el programa */
  | "suspendido";    /* Suspensión disciplinaria */

/* ── Roles del sistema ── */
export type RolSistema =
  | "administrador_sena"
  | "coordinador_sena"
  | "instructor"
  | "institucion_educativa"
  | "aprendiz";

/* ── Sexo biológico (para registros institucionales) ── */
export type Sexo = "masculino" | "femenino" | "otro" | "prefiero_no_decir";

/* ── Tipos de documento de identidad colombianos ── */
export type TipoDocumento =
  | "CC"   /* Cédula de ciudadanía */
  | "TI"   /* Tarjeta de identidad */
  | "CE"   /* Cédula de extranjería */
  | "PA"   /* Pasaporte */
  | "NIT"  /* Para instituciones */
  | "RC";  /* Registro civil */

/* ── Respuesta paginada genérica ──────────────────────────────────
 * Firma canónica que services/ retorna y que los componentes
 * consumen. En Fase 2, el fetch('/api/v1/...') retornará la misma
 * forma, por lo que los componentes no cambian.
 */
export interface PaginatedResponse<T> {
  /** Registros de la página actual */
  data:        T[];
  /** Total de registros sin paginar */
  total:       number;
  /** Número de página actual (1-indexed) */
  page:        number;
  /** Tamaño de página */
  pageSize:    number;
  /** Total de páginas calculadas */
  totalPages:  number;
}

/* ── Parámetros de búsqueda y filtros comunes ── */
export interface FiltrosBase {
  /** Término de búsqueda textual libre */
  busqueda?:  string;
  /** Página actual (1-indexed, default 1) */
  pagina?:    number;
  /** Registros por página (default 20) */
  tamano?:    number;
  /** Campo por el que ordenar */
  ordenPor?:  string;
  /** Dirección del orden */
  orden?:     "asc" | "desc";
}

/* ── Metadatos de auditoría — todos los registros persistentes los tienen ── */
export interface AuditMetadata {
  /** Fecha y hora de creación */
  creadoEn:       Date;
  /** ID del usuario que creó el registro */
  creadoPor:      string;
  /** Fecha y hora de última actualización */
  actualizadoEn:  Date;
  /** ID del usuario que realizó la última actualización */
  actualizadoPor: string;
  /** Si el registro fue eliminado lógicamente */
  eliminado:      boolean;
  /** Fecha de eliminación lógica (null si no fue eliminado) */
  eliminadoEn:    Date | null;
}

/* ── Resultado de operación de servicio ──────────────────────────
 * Patrón Result en lugar de excepciones para operaciones de negocio.
 */
export type ServiceResult<T> =
  | { ok: true;  data: T }
  | { ok: false; error: string; code?: string };

/* ── Opción para selects y dropdowns ── */
export interface SelectOption {
  value: string;
  label: string;
  /** Datos adicionales opcionales para renderizado */
  meta?: Record<string, unknown>;
}

/* ── Columna de DataTable genérico ── */
export interface ColumnaDef<T> {
  /** Identificador único de la columna */
  key:       keyof T | string;
  /** Encabezado visible */
  header:    string;
  /** Función de renderizado personalizado (opcional) */
  render?:   (row: T) => React.ReactNode;
  /** Si la columna es ordenable */
  sortable?: boolean;
  /** Ancho mínimo en px */
  minWidth?: number;
  /** Alineación del contenido */
  align?:    "left" | "center" | "right";
}

/* ── Ítem de breadcrumb ── */
export interface BreadcrumbItem {
  label: string;
  href?: string; /* Undefined en el último ítem (página actual) */
}

/* ── Alerta del sistema ── */
export interface AlertaSistema {
  id:        string;
  tipo:      "info" | "advertencia" | "error" | "exito";
  titulo:    string;
  mensaje:   string;
  fecha:     Date;
  leida:     boolean;
  enlace?:   string; /* Ruta interna opcional para navegar */
}

/* ── KPI Card ── */
export interface KpiData {
  titulo:    string;
  valor:     number | string;
  subtitulo: string;
  tendencia?: {
    valor:     number;    /* Porcentaje de cambio */
    positivo:  boolean;   /* true = verde, false = rojo */
  };
  icono:     string;      /* Nombre del ícono Lucide */
  color:     string;      /* Clase de color Tailwind */
}
