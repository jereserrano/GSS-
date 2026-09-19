"use server";
import { RolRepository } from "@/repositories/rol.repository";
import { UserRepository } from "@/repositories/user.repository";
import { AuditLogRepository } from "@/repositories/auditLog.repository";

/**
 * =============================================================================
 * actions/user.actions.ts — Server Actions para gestión de usuarios
 * GSS Media Técnica — SENA Regional Magdalena
 * =============================================================================
 *
 * SEGURIDAD: Todas las mutaciones (createUser, updateUser, deleteUser) están
 * protegidas por el motor `canManageUser` de lib/hierarchy.ts.
 *
 * Esta capa NO confía en la interfaz gráfica. Valida jerarquía, sesión y
 * estado en el servidor en cada transacción.
 */


import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { canManageUser, getAssignableRoles, type CurrentUserCtx } from "@/lib/hierarchy";

// =============================================================================
// HELPER INTERNO: Registro de Auditoría Inmutable
// =============================================================================

async function logAudit({
  userId,
  modulo,
  accion,
  detalle,
}: {
  userId?: string | null;
  modulo: string;
  accion: string;
  detalle: object;
}): Promise<void> {
  try {
    await AuditLogRepository.create({
      data: {
        userId: userId ?? null,
        modulo,
        accion,
        detalle: JSON.stringify(detalle),
      },
    });
  } catch (err) {
    // El fallo de auditoría nunca debe bloquear la operación principal,
    // pero sí debe registrarse en el log del servidor.
    console.error("[AUDIT] Error registrando evento de auditoría:", err);
  }
}

// =============================================================================
// HELPER INTERNO: Obtener sesión y contexto del usuario actual
// =============================================================================

async function getCurrentUserCtx(): Promise<CurrentUserCtx | null> {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return null;
  const u = session.user as any;
  return {
    id: u.id,
    role: u.role || u.rolName || "",
    rolName: u.rolName,
    estado: "ACTIVO", // Si tiene sesión activa, su estado es activo
  };
}

// =============================================================================
// LECTURA: getUsers — No requiere verificación de jerarquía
// =============================================================================

export async function getUsers() {
  try {
    const currentUser = await getCurrentUserCtx();
    if (!currentUser || (currentUser.role !== "ADMINISTRADOR" && !currentUser.role.includes("ADMIN") && !currentUser.role.includes("COORD"))) {
      return [];
    }

    const users = await UserRepository.findMany({
      include: {
        rol: true,
      },
      orderBy: {
        creadoEn: "desc",
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// =============================================================================
// LECTURA: getRoles — Retorna TODOS los roles (para la tabla de roles)
// =============================================================================

export async function getRoles() {
  try {
    return await RolRepository.findMany();
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
}

// =============================================================================
// LECTURA: getAssignableRolesBySession — Roles que el usuario actual puede asignar
// =============================================================================

export async function getAssignableRolesBySession() {
  try {
    const currentUser = await getCurrentUserCtx();
    if (!currentUser) return { error: "No autenticado", roles: [] };

    const allRoles = await RolRepository.findMany();
    const assignable = getAssignableRoles(currentUser.role, allRoles);
    return { roles: assignable };
  } catch (error) {
    console.error("Error fetching assignable roles:", error);
    return { error: "Error al obtener roles", roles: [] };
  }
}

// =============================================================================
// MUTACIÓN: createUser
// =============================================================================

export async function createUser(data: any) {
  // ── 1. Verificar sesión ──────────────────────────────────────────────────
  const currentUser = await getCurrentUserCtx();
  if (!currentUser) {
    return { error: "No autenticado. Inicia sesión nuevamente.", httpStatus: 401 };
  }

  try {
    const { nombre, email, password, rolId } = data;

    // ── 2. Cargar el rol que se va a asignar ────────────────────────────────
    const rolToAssign = await RolRepository.findUnique({ where: { id: rolId } });
    if (!rolToAssign) {
      return { error: "El rol seleccionado no existe." };
    }

    // ── 3. Validar jerarquía para la asignación del rol ─────────────────────
    // Usamos un "targetUser" ficticio con el rol a asignar para validar
    const authCheck = canManageUser(
      currentUser,
      { id: "new-user", rolNombre: rolToAssign.nombre },
      "CREAR_USUARIO",
      { newRolNombre: rolToAssign.nombre }
    );

    if (!authCheck.allowed) {
      await logAudit({
        userId: currentUser.id,
        modulo: "SEGURIDAD",
        accion: "INTENTO_CREAR_USUARIO_RECHAZADO",
        detalle: {
          solicitante: { id: currentUser.id, rol: currentUser.role },
          rolIntentado: rolToAssign.nombre,
          motivo: authCheck.reason,
        },
      });
      return { error: authCheck.reason, httpStatus: authCheck.httpStatus };
    }

    // ── 4. Verificar email único ─────────────────────────────────────────────
    const existingUser = await UserRepository.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "El correo ya está registrado en el sistema." };
    }

    // ── 5. Crear usuario ─────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserRepository.create({
      data: { 
        nombre, 
        email, 
        passwordHash, 
        rolId,
        institucionId: data.institucionId || null 
      },
    });

    // ── 5.1 Crear perfiles automáticos según el rol ─────────────────────────
    const rolNombreUpper = rolToAssign.nombre.toUpperCase();
    
    try {
      if (rolNombreUpper.includes("APRENDIZ")) {
        const { PrismaClient } = require("@prisma/client");
        const prismaLocal = new PrismaClient();
        await prismaLocal.aprendiz.create({
          data: {
            userId: user.id,
            nombres: nombre,
            apellidos: "Pendiente",
            numeroDocumento: user.id.slice(-10), // Dummy para que sea único
            emailSena: email,
            estado: "EN_FORMACION",
            nivelRiesgo: "BAJO"
          }
        });
        await prismaLocal.$disconnect();
      } else if (rolNombreUpper.includes("INSTRUCTOR")) {
        const { PrismaClient } = require("@prisma/client");
        const prismaLocal = new PrismaClient();
        await prismaLocal.instructor.create({
          data: {
            userId: user.id,
            nombres: nombre,
            apellidos: "Pendiente",
            numeroDocumento: user.id.slice(-10), // Dummy para que sea único
            email: email,
            estado: "ACTIVO"
          }
        });
        await prismaLocal.$disconnect();
      }
    } catch (profileError) {
      console.error("Error creando perfil automático:", profileError);
    }

    // ── 6. Registrar auditoría exitosa ───────────────────────────────────────
    await logAudit({
      userId: currentUser.id,
      modulo: "USUARIOS",
      accion: "CREAR_USUARIO",
      detalle: {
        solicitante: { id: currentUser.id, rol: currentUser.role },
        usuarioCreado: { id: user.id, nombre, email, rol: rolToAssign.nombre },
      },
    });

    revalidatePath("/usuarios");
    return { success: true, user };
  } catch (error: any) {
    console.error("Error creating user:", error);
    return { error: error.message || "Error al crear el usuario" };
  }
}

// =============================================================================
// MUTACIÓN: updateUser
// =============================================================================

export async function updateUser(id: string, data: any) {
  // ── 1. Verificar sesión ──────────────────────────────────────────────────
  const currentUser = await getCurrentUserCtx();
  if (!currentUser) {
    return { error: "No autenticado. Inicia sesión nuevamente.", httpStatus: 401 };
  }

  try {
    // ── 2. Cargar usuario objetivo DESDE LA BD ───────────────────────────────
    const targetUser = await UserRepository.findUnique({
      where: { id },
      include: { rol: true },
    });

    if (!targetUser) {
      return { error: "El usuario que intenta modificar no existe." };
    }

    const targetCtx = {
      id: targetUser.id,
      rolNombre: (targetUser as any).rol?.nombre ?? "",
      estado: targetUser.estado,
    };

    // ── 3. Validar jerarquía para modificación ───────────────────────────────
    const action = data.rolId ? "CAMBIAR_ROL" : "MODIFICAR_USUARIO";
    let newRolNombre: string | undefined;

    if (data.rolId && data.rolId !== targetUser.rolId) {
      const newRol = await RolRepository.findUnique({ where: { id: data.rolId } });
      if (!newRol) return { error: "El nuevo rol seleccionado no existe." };
      newRolNombre = newRol.nombre;
    }

    const authCheck = canManageUser(currentUser, targetCtx, action as any, {
      newRolNombre: newRolNombre,
    });

    if (!authCheck.allowed) {
      await logAudit({
        userId: currentUser.id,
        modulo: "SEGURIDAD",
        accion: "INTENTO_MODIFICAR_USUARIO_RECHAZADO",
        detalle: {
          solicitante: { id: currentUser.id, rol: currentUser.role },
          objetivo: { id: targetUser.id, rol: (targetUser as any).rol?.nombre },
          accionIntentada: action,
          nuevoRol: newRolNombre,
          motivo: authCheck.reason,
        },
      });
      return { error: authCheck.reason, httpStatus: authCheck.httpStatus };
    }

    // También verificar cambio de estado si aplica
    if (data.estado && data.estado !== targetUser.estado) {
      const estadoCheck = canManageUser(currentUser, targetCtx, "CAMBIAR_ESTADO");
      if (!estadoCheck.allowed) {
        return { error: estadoCheck.reason, httpStatus: estadoCheck.httpStatus };
      }
    }

    // ── 4. Construir datos de actualización ─────────────────────────────────
    const { nombre, email, password, rolId, estado, institucionId } = data;
    let updateData: any = { nombre, email, rolId, estado };
    
    if (institucionId !== undefined) {
      updateData.institucionId = institucionId || null;
    }

    if (password && password.trim() !== "") {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    // ── 5. Ejecutar actualización ────────────────────────────────────────────
    const updatedUser = await UserRepository.update({
      where: { id },
      data: updateData,
    });

    // ── 6. Registrar auditoría exitosa con diff ──────────────────────────────
    await logAudit({
      userId: currentUser.id,
      modulo: "USUARIOS",
      accion: "MODIFICAR_USUARIO",
      detalle: {
        solicitante: { id: currentUser.id, rol: currentUser.role },
        objetivo: { id: targetUser.id },
        cambios: {
          nombre: { anterior: targetUser.nombre, nuevo: nombre },
          email: { anterior: targetUser.email, nuevo: email },
          rol: newRolNombre
            ? { anterior: (targetUser as any).rol?.nombre, nuevo: newRolNombre }
            : undefined,
          estado: data.estado !== targetUser.estado
            ? { anterior: targetUser.estado, nuevo: data.estado }
            : undefined,
        },
      },
    });

    revalidatePath("/usuarios");
    return { success: true, user: updatedUser };
  } catch (error: any) {
    console.error("Error updating user:", error);
    return { error: error.message || "Error al actualizar el usuario" };
  }
}

// =============================================================================
// MUTACIÓN: deleteUser
// =============================================================================

export async function deleteUser(id: string) {
  // ── 1. Verificar sesión ──────────────────────────────────────────────────
  const currentUser = await getCurrentUserCtx();
  if (!currentUser) {
    return { error: "No autenticado. Inicia sesión nuevamente.", httpStatus: 401 };
  }

  try {
    // ── 2. Cargar usuario objetivo DESDE LA BD ───────────────────────────────
    const targetUser = await UserRepository.findUnique({
      where: { id },
      include: { rol: true },
    });

    if (!targetUser) {
      return { error: "El usuario que intenta eliminar no existe." };
    }

    const targetCtx = {
      id: targetUser.id,
      rolNombre: (targetUser as any).rol?.nombre ?? "",
      estado: targetUser.estado,
    };

    // ── 3. Validar jerarquía para eliminación ────────────────────────────────
    const authCheck = canManageUser(currentUser, targetCtx, "ELIMINAR_USUARIO");

    if (!authCheck.allowed) {
      await logAudit({
        userId: currentUser.id,
        modulo: "SEGURIDAD",
        accion: "INTENTO_ELIMINAR_USUARIO_RECHAZADO",
        detalle: {
          solicitante: { id: currentUser.id, rol: currentUser.role },
          objetivo: { id: targetUser.id, nombre: targetUser.nombre, rol: (targetUser as any).rol?.nombre },
          motivo: authCheck.reason,
        },
      });
      return { error: authCheck.reason, httpStatus: authCheck.httpStatus };
    }

    // ── 4. Registrar auditoría ANTES de eliminar (para tener registro) ───────
    await logAudit({
      userId: currentUser.id,
      modulo: "USUARIOS",
      accion: "ELIMINAR_USUARIO",
      detalle: {
        solicitante: { id: currentUser.id, rol: currentUser.role },
        usuarioEliminado: {
          id: targetUser.id,
          nombre: targetUser.nombre,
          email: targetUser.email,
          rol: (targetUser as any).rol?.nombre,
        },
      },
    });

    // ── 5. Eliminar usuario ──────────────────────────────────────────────────
    await UserRepository.delete({ where: { id } });

    revalidatePath("/usuarios");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { error: error.message || "Error al eliminar el usuario" };
  }
}

// =============================================================================
// EXPORTACIÓN CSV
// =============================================================================

export async function exportUsuariosCSV() {
  try {
    const users = await UserRepository.findMany({
      include: { rol: true },
      orderBy: { creadoEn: "desc" },
    });

    const header = "Nombre,Email,Rol,Estado,Fecha Creación";
    const rows = users.map((u) =>
      [
        u.nombre,
        u.email,
        (u as any).rol?.nombre ?? "Sin Rol",
        (u as any).estado ?? "",
        u.creadoEn ? new Date(u.creadoEn).toLocaleDateString("es-CO") : "",
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting usuarios:", error);
    return { success: false, error: "Error al generar reporte de usuarios" };
  }
}
