// Sistema de Control de Acceso Basado en Roles (RBAC)
// GSS Media Técnica — SENA Regional Magdalena

export type UserRole = "ADMINISTRADOR" | "SUBDIRECTOR" | "COORDINADOR" | "APCOORDINADOR" | "INSTRUCTOR" | "APRENDIZ" | string;

// Rutas base comunes para todos los roles permitidos en el dashboard
const RUTAS_COMUNES = ["/dashboard", "/notificaciones"];

// Listas Blancas (Whitelists) estrictas por Rol:

export const RUTAS_SUBDIRECTOR = [
  ...RUTAS_COMUNES,
  "/instituciones",
  "/sedes",
  "/programas",
  "/fichas",
  "/aprendices",
  "/instructores",
  "/reportes",
  "/seguimiento",
  "/riesgos",
  "/documentos"
];

export const RUTAS_COORDINADOR = [
  ...RUTAS_COMUNES,
  "/programas",
  "/fichas",
  "/aprendices",
  "/instructores",
  "/competencias",
  "/resultados-aprendizaje",
  "/plan-formacion",
  "/seguimiento",
  "/riesgos",
  "/reportes",
  "/actividades",
  "/entregas",
  "/asistencia",
  "/evaluaciones",
  "/resultados",
  "/documentos"
];

// ApCoordinador comparte las mismas rutas visibles que el Coordinador,
// la restricción de acciones específicas se maneja en los Server Actions
export const RUTAS_APCOORDINADOR = RUTAS_COORDINADOR;

export const RUTAS_INSTRUCTOR = [
  ...RUTAS_COMUNES,
  "/fichas",
  "/aprendices",
  "/competencias",
  "/resultados-aprendizaje",
  "/plan-formacion",
  "/actividades",
  "/entregas",
  "/asistencia",
  "/evaluaciones",
  "/resultados",
  "/seguimiento",
  "/riesgos",
  "/reportes",
  "/documentos"
];

export const RUTAS_APRENDIZ = [
  ...RUTAS_COMUNES,
  "/fichas",
  "/actividades",
  "/entregas",
  "/resultados",
  "/seguimiento",
  "/plan-formacion",
  "/documentos"
];

/**
 * Determina si un rol específico tiene permiso para acceder a una ruta determinada
 */
export function canAccessRoute(role: string | undefined | null, pathname: string): boolean {
  if (!role) return false;
  const normalRole = role.toUpperCase();

  // 1. ADMINISTRADOR: Acceso irrestricto a TODO el sistema
  if (normalRole === "ADMINISTRADOR" || normalRole.includes("ADMIN")) {
    return true;
  }

  // Helper para comprobar si el pathname está autorizado en un array de rutas
  const isAllowed = (rutasPermitidas: string[]) => {
    return rutasPermitidas.some(ruta => pathname === ruta || pathname.startsWith(ruta + "/"));
  };

  // 2. Comprobaciones por Whitelists
  if (normalRole === "SUBDIRECTOR" || normalRole.includes("SUBDIR")) {
    return isAllowed(RUTAS_SUBDIRECTOR);
  }

  if (normalRole === "COORDINADOR" || normalRole.includes("COORD")) {
    // Si incluye 'APCOORDINADOR' entra en la siguiente, así que validamos exactamente
    if (!normalRole.includes("APCOORD")) {
      return isAllowed(RUTAS_COORDINADOR);
    }
  }

  if (normalRole === "APCOORDINADOR" || normalRole.includes("APCOORD")) {
    return isAllowed(RUTAS_APCOORDINADOR);
  }

  if (normalRole === "INSTRUCTOR" || normalRole.includes("INSTRUCT")) {
    return isAllowed(RUTAS_INSTRUCTOR);
  }

  if (normalRole === "APRENDIZ" || normalRole.includes("APRENDIZ")) {
    return isAllowed(RUTAS_APRENDIZ);
  }

  // Por defecto, si el rol no coincide con nada, denegar acceso.
  return false;
}

/**
 * Comprueba si un ítem de navegación debe ser visible para un rol dado
 */
export function isNavItemVisibleForRole(role: string | undefined | null, href?: string): boolean {
  if (!href) return true; // Separadores se manejan aparte
  return canAccessRoute(role, href);
}
