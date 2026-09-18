import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/permissions";

/**
 * Verifica la sesión actual y asegura que el usuario tenga un rol permitido.
 * @param allowedRoles Array o lista de roles permitidos para la operación.
 * @returns El usuario de la base de datos si tiene permiso.
 * @throws Error si no está autenticado o no tiene permiso.
 */
export async function requireRole(allowedRoles?: UserRole[] | UserRole, ...extraRoles: UserRole[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("No autenticado");
  }

  const rolesList: UserRole[] = Array.isArray(allowedRoles)
    ? allowedRoles
    : allowedRoles
    ? [allowedRoles, ...extraRoles]
    : [];

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { rol: true }
  });

  if (!user) {
    throw new Error("Usuario no encontrado en la base de datos");
  }

  // Si no se especifican roles, cualquier usuario autenticado pasa.
  if (rolesList.length === 0) {
    return user;
  }

  const userRole = user.rol.nombre.toUpperCase();
  
  // El ADMINISTRADOR siempre tiene acceso a todo.
  if (userRole === "ADMINISTRADOR" || userRole.includes("ADMIN")) {
    return user;
  }

  // Verificar si el rol del usuario está en la lista de permitidos
  const hasPermission = rolesList.some(role => userRole === role.toUpperCase() || userRole.includes(role.toUpperCase()));

  if (!hasPermission) {
    throw new Error("Acceso denegado: Rol insuficiente");
  }

  return user;
}

/**
 * Prevención de IDOR: Verifica si un usuario tiene acceso a modificar una institución o sus recursos.
 * @param user El usuario retornado por requireRole()
 * @param targetInstitucionId El ID de la institución a la que pertenece el recurso a modificar.
 * @throws Error si el usuario intenta modificar un recurso que no es de su institución.
 */
export function requireInstitutionAccess(user: any, targetInstitucionId: string) {
  const role = user.rol.nombre.toUpperCase();
  
  // Los administradores pueden tocar cualquier institución.
  if (role === "ADMINISTRADOR") {
    return;
  }

  // Para los demás (Coordinadores, Instructores), si tienen una institución asignada,
  // solo pueden acceder a recursos de esa institución.
  if (user.institucionId && user.institucionId !== targetInstitucionId) {
    throw new Error("Acceso denegado: No tienes permisos sobre registros de otra institución");
  }
}
