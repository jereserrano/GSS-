/**
 * =============================================================================
 * lib/hierarchy.ts — Motor Central de Autorización Jerárquica
 * GSS Media Técnica — SENA Regional Magdalena
 * =============================================================================
 *
 * Implementa la Regla de Oro:
 *   Operación Permitida ⟺ hierarchy(currentUser) < hierarchy(targetUser)
 *
 * Un usuario NUNCA puede administrar a otro usuario de jerarquía IGUAL o SUPERIOR.
 *
 * Jerarquía Oficial (menor número = mayor autoridad):
 *   1 → ADMINISTRADOR
 *   2 → COORDINADOR
 *   3 → COORDINADOR_SEDE / APOYO_ADMINISTRATIVO
 *   4 → INSTRUCTOR
 *  99 → ROL_DESCONOCIDO (sin autoridad, rechazado por defecto)
 */

// =============================================================================
// ENUMS Y TIPOS
// =============================================================================

/** Nivel numérico de jerarquía. Menor = más autoridad. */
export enum HierarchyLevel {
  ADMINISTRADOR = 1,
  COORDINADOR = 2,
  COORDINADOR_SEDE = 3,
  APOYO_ADMINISTRATIVO = 3,
  INSTRUCTOR = 4,
  UNKNOWN = 99,
}

/** Acciones que se pueden solicitar sobre un usuario destino. */
export type HierarchyAction =
  | "CREAR_USUARIO"
  | "MODIFICAR_USUARIO"
  | "CAMBIAR_ROL"
  | "CAMBIAR_ESTADO"
  | "ELIMINAR_USUARIO"
  | "VER_USUARIO";

/** Contexto del usuario en sesión que solicita la acción. */
export interface CurrentUserCtx {
  id: string;
  role: string;     // Código normalizado del rol (ej: "ADMINISTRADOR")
  rolName?: string; // Nombre real del rol en BD (ej: "Coordinador de Sede")
  estado?: string;  // "ACTIVO" | "INACTIVO"
}

/** Contexto del usuario que va a ser administrado (target). */
export interface TargetUserCtx {
  id: string;
  rolNombre: string; // Nombre real del rol en BD
  estado?: string;
}

/** Opciones adicionales para validaciones especiales. */
export interface ManageOptions {
  /** Para CAMBIAR_ROL: nombre del nuevo rol a asignar. */
  newRolNombre?: string | undefined;
}

/** Resultado estructurado de la validación. */
export interface AuthResult {
  allowed: boolean;
  reason?: string;
  httpStatus?: 401 | 403;
}

// =============================================================================
// NORMALIZACIÓN DE NOMBRES DE ROL → NIVEL DE JERARQUÍA
// =============================================================================

/**
 * Traduce un nombre de rol (en cualquier formato) a su nivel de jerarquía.
 * Usa detección por palabras clave para máxima compatibilidad con la BD.
 *
 * @param rolNombre  Nombre del rol tal como viene de la base de datos.
 * @returns          Nivel numérico de jerarquía.
 */
export function getHierarchyLevel(rolNombre: string | undefined | null): HierarchyLevel {
  if (!rolNombre) return HierarchyLevel.UNKNOWN;

  const upper = rolNombre.toUpperCase().trim();

  // 1 — Administrador (máxima autoridad)
  if (upper.includes("ADMIN")) return HierarchyLevel.ADMINISTRADOR;

  // 3 — Apoyo Administrativo (nivel 3 sin capacidad de gestionar usuarios)
  //     Se detecta ANTES que COORDINADOR para evitar falso positivo
  if (upper.includes("APOYO")) return HierarchyLevel.APOYO_ADMINISTRATIVO;

  // 3 — Coordinador de Sede (nivel 3 con capacidad limitada de gestionar Instructores en su sede)
  if (upper.includes("SEDE")) return HierarchyLevel.COORDINADOR_SEDE;

  // 2 — Coordinador Académico / Regional
  if (upper.includes("COORD")) return HierarchyLevel.COORDINADOR;

  // 4 — Instructor (nivel base, sin capacidad de administrar)
  if (upper.includes("INSTRUCT")) return HierarchyLevel.INSTRUCTOR;

  return HierarchyLevel.UNKNOWN;
}

/**
 * Determina si un rol tiene capacidad de gestionar usuarios.
 * APOYO_ADMINISTRATIVO es nivel 3 pero NO puede gestionar usuarios.
 */
function canRoleManageUsers(rolNombre: string): boolean {
  const upper = rolNombre.toUpperCase().trim();
  // Apoyo administrativo NO puede gestionar usuarios
  if (upper.includes("APOYO")) return false;
  // Instructor NO puede gestionar usuarios
  if (upper.includes("INSTRUCT")) return false;
  // Los demás roles con nivel < 4 sí pueden (según su jerarquía)
  return true;
}

// =============================================================================
// FUNCIÓN PRINCIPAL: canManageUser
// =============================================================================

/**
 * Valida si el usuario en sesión (currentUser) puede ejecutar `action` sobre
 * el usuario destino (targetUser). Esta es la única fuente de verdad para
 * autorización de acciones sobre usuarios. Debe ser llamada en CADA Server Action.
 *
 * Validaciones en orden estricto:
 *  1. Autenticación: currentUser debe existir.
 *  2. Estado del solicitante: currentUser debe estar ACTIVO.
 *  3. Capacidad del rol: el rol del solicitante debe poder gestionar usuarios.
 *  4. Auto-modificación de rol/estado: prohibida para prevenir auto-escalamiento.
 *  5. Jerarquía estricta: hierarchy(current) < hierarchy(target).
 *  6. Si es CAMBIAR_ROL: el rol nuevo debe ser estrictamente inferior al current.
 *
 * @param currentUser   Usuario en sesión (desde `getServerSession`).
 * @param targetUser    Usuario objetivo cargado desde la base de datos.
 * @param action        Tipo de operación solicitada.
 * @param options       Opciones adicionales (ej. newRolNombre para CAMBIAR_ROL).
 * @returns             AuthResult con `allowed`, `reason` y `httpStatus`.
 */
export function canManageUser(
  currentUser: CurrentUserCtx | null | undefined,
  targetUser: TargetUserCtx | null | undefined,
  action: HierarchyAction,
  options?: ManageOptions
): AuthResult {

  // ─── Regla 1: Autenticación ───────────────────────────────────────────────
  if (!currentUser || !currentUser.id) {
    return {
      allowed: false,
      reason: "No hay sesión activa. Autenticación requerida.",
      httpStatus: 401,
    };
  }

  // ─── Regla 2: Estado del solicitante ──────────────────────────────────────
  if (currentUser.estado && currentUser.estado !== "ACTIVO") {
    return {
      allowed: false,
      reason: "La cuenta del solicitante no está activa.",
      httpStatus: 403,
    };
  }

  // ─── Regla 3: Capacidad del rol para gestionar usuarios ──────────────────
  if (action !== "VER_USUARIO" && !canRoleManageUsers(currentUser.role)) {
    return {
      allowed: false,
      reason: `El rol '${currentUser.role}' no tiene capacidad de gestionar usuarios.`,
      httpStatus: 403,
    };
  }

  // Para acciones de lectura, no se necesita un targetUser válido
  if (action === "VER_USUARIO") {
    return { allowed: true };
  }

  // ─── Regla 4: Target debe existir ────────────────────────────────────────
  if (!targetUser || !targetUser.id) {
    return {
      allowed: false,
      reason: "El usuario objetivo no existe en el sistema.",
      httpStatus: 403,
    };
  }

  // ─── Regla 5: Prevención de auto-escalamiento ────────────────────────────
  if (currentUser.id === targetUser.id) {
    if (action === "CAMBIAR_ROL" || action === "CAMBIAR_ESTADO" || action === "ELIMINAR_USUARIO") {
      return {
        allowed: false,
        reason: "Un usuario no puede modificar su propio rol, estado o eliminarse a sí mismo.",
        httpStatus: 403,
      };
    }
  }

  // ─── Regla 6: Comparación estricta de jerarquías ─────────────────────────
  const currentLevel = getHierarchyLevel(currentUser.role);
  const targetLevel = getHierarchyLevel(targetUser.rolNombre);

  if (currentLevel >= targetLevel) {
    return {
      allowed: false,
      reason: `Acceso denegado: no puede administrar a un usuario de igual o mayor jerarquía. ` +
               `(Solicitante: ${currentUser.role} [${currentLevel}], Objetivo: ${targetUser.rolNombre} [${targetLevel}])`,
      httpStatus: 403,
    };
  }

  // ─── Regla 7: Validación del nuevo rol (solo para CAMBIAR_ROL) ───────────
  if (action === "CAMBIAR_ROL" && options?.newRolNombre) {
    const newRoleLevel = getHierarchyLevel(options.newRolNombre);

    // El nuevo rol asignado debe ser ESTRICTAMENTE INFERIOR al del solicitante
    if (newRoleLevel <= currentLevel) {
      return {
        allowed: false,
        reason: `No puede asignar el rol '${options.newRolNombre}' [${newRoleLevel}] porque ` +
                 `es de igual o mayor jerarquía que su propio rol [${currentLevel}].`,
        httpStatus: 403,
      };
    }
  }

  // ─── AUTORIZADO ──────────────────────────────────────────────────────────
  return { allowed: true };
}

// =============================================================================
// HELPER: Filtrar roles asignables por un usuario
// =============================================================================

/**
 * Dado el rol del usuario en sesión, retorna solo los roles que ese usuario
 * está autorizado a asignar (roles de jerarquía estrictamente inferior).
 *
 * @param currentRolNombre  Nombre del rol del usuario en sesión.
 * @param allRoles          Lista completa de roles desde la BD.
 * @returns                 Roles que el usuario puede asignar.
 */
export function getAssignableRoles(
  currentRolNombre: string,
  allRoles: Array<{ id: string; nombre: string }>
): Array<{ id: string; nombre: string }> {
  const currentLevel = getHierarchyLevel(currentRolNombre);

  return allRoles.filter((rol) => {
    const rolLevel = getHierarchyLevel(rol.nombre);
    return rolLevel > currentLevel && rolLevel !== HierarchyLevel.UNKNOWN;
  });
}
