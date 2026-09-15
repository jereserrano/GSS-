import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export type UserRole = "ADMINISTRADOR" | "COORDINADOR" | "INSTRUCTOR" | string;

/**
 * Obtiene la sesión del servidor con tipado de rol.
 * Usar en Server Components y Server Actions para verificar permisos.
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const user = session.user as {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };

  return {
    id: user.id ?? null,
    nombre: user.name ?? "Usuario",
    email: user.email ?? "",
    role: user.role ?? "INSTRUCTOR",
  };
}

/**
 * Verifica si el usuario actual tiene uno de los roles permitidos.
 * Lanza un error si no está autenticado o no tiene permiso.
 */
export async function requireRole(...roles: UserRole[]) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("No autenticado. Por favor inicia sesión.");
  }

  // Normalizar el rol aunque el token tenga el nombre completo de BD
  let normalizedRole: string = user.role;
  const roleUpper = (user.role || "").toUpperCase();
  if (roleUpper.includes("ADMIN")) normalizedRole = "ADMINISTRADOR";
  else if (roleUpper.includes("COORD")) normalizedRole = "COORDINADOR";
  else if (roleUpper.includes("INSTRUC")) normalizedRole = "INSTRUCTOR";

  if (roles.length > 0 && !roles.includes(normalizedRole)) {
    throw new Error(`Acceso denegado. Se requiere rol: ${roles.join(" o ")}`);
  }
  return { ...user, role: normalizedRole };
}

/**
 * Verifica si un rol tiene permiso para una acción específica.
 */
export function canPerform(role: UserRole, action: "delete" | "edit" | "create" | "admin"): boolean {
  const permisos: Record<string, string[]> = {
    ADMINISTRADOR: ["delete", "edit", "create", "admin"],
    COORDINADOR: ["edit", "create"],
    INSTRUCTOR: ["create"],
  };

  return (permisos[role] ?? []).includes(action);
}
