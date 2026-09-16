// Sistema de Control de Acceso Basado en Roles (RBAC)
// GSS Media Técnica — SENA Regional Magdalena

export type UserRole = "ADMINISTRADOR" | "COORDINADOR" | "INSTRUCTOR" | string;

// Rutas exclusivas del Administrador del Sistema
export const RUTAS_ADMIN_SOLO = [
  "/usuarios",
  "/roles",
  "/auditoria",
  "/configuracion",
];

// Rutas de gestión institucional (Admin y Coordinador)
export const RUTAS_GESTION_INSTITUCIONAL = [
  "/instituciones",
  "/sedes",
  "/programas",
  "/instructores",
];

/**
 * Determina si un rol específico tiene permiso para acceder a una ruta determinada
 */
export function canAccessRoute(role: string | undefined | null, pathname: string): boolean {
  if (!role) return false;

  const normalRole = role.toUpperCase();

  // El Administrador tiene acceso irrestricto a todo el sistema
  if (normalRole === "ADMINISTRADOR" || normalRole.includes("ADMIN")) {
    return true;
  }

  // Comprobar si es una ruta exclusiva de administración
  const esRutaAdmin = RUTAS_ADMIN_SOLO.some((ruta) => pathname.startsWith(ruta));
  if (esRutaAdmin) {
    return false;
  }

  // El Coordinador tiene acceso a todo excepto las rutas exclusivas de administración
  if (normalRole === "COORDINADOR" || normalRole.includes("COORD")) {
    return true;
  }

  // Restricciones para Instructor
  if (normalRole === "INSTRUCTOR" || normalRole.includes("INSTRUCT")) {
    // Un instructor no puede gestionar instituciones, sedes, programas o administración
    const esGestionInstitucional = RUTAS_GESTION_INSTITUCIONAL.some((ruta) =>
      pathname.startsWith(ruta)
    );
    if (esGestionInstitucional) {
      return false;
    }

    // Rutas permitidas para Instructor:
    // /dashboard, /fichas, /aprendices, /competencias, /resultados-aprendizaje,
    // /plan-formacion, /actividades, /entregas, /asistencia, /evaluaciones,
    // /resultados, /seguimiento, /riesgos, /reportes, /documentos, /notificaciones
    return true;
  }

  // Por defecto, permitir rutas base si no coincide
  return pathname.startsWith("/dashboard") || pathname.startsWith("/notificaciones");
}

/**
 * Comprueba si un ítem de navegación debe ser visible para un rol dado
 */
export function isNavItemVisibleForRole(role: string | undefined | null, href?: string): boolean {
  if (!href) return true; // Separadores se manejan aparte
  return canAccessRoute(role, href);
}
