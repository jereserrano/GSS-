"use server";

import { UserRepository } from "@/repositories/user.repository";
import { NotificacionRepository } from "@/repositories/notificacion.repository";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { requireRole, requireInstitutionAccess } from "@/lib/rbac";
import { logAudit } from "@/lib/audit.service";

async function getSessionUserId() {
  const session = await getServerSession();
  if (session?.user?.email) {
    const user = await UserRepository.findUnique({ where: { email: session.user.email } });
    return user?.id || null;
  }
  return null;
}

export async function getMisNotificacionesAction() {
  try {
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR", "APRENDIZ"]);

    const notificaciones = await NotificacionRepository.findMany({
      where: { userId: user.id },
      orderBy: { creadoEn: "desc" },
    });

    return { success: true, data: notificaciones };
  } catch (error: any) {
    return { success: false, error: "Error al obtener notificaciones: " + error.message };
  }
}

export async function marcarComoLeidaAction(id: string) {
  try {
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR", "APRENDIZ"]);

    // Verificar propiedad
    const notif = await NotificacionRepository.findUnique({ where: { id } });
    if (!notif || notif.userId !== user.id) return { success: false, error: "No autorizado" };

    await NotificacionRepository.update({
      where: { id },
      data: { leida: true },
    });

    revalidatePath("/notificaciones");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Error al actualizar notificación: " + error.message };
  }
}

export async function marcarTodasComoLeidasAction() {
  try {
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR", "APRENDIZ"]);

    await NotificacionRepository.updateMany({
      where: { userId: user.id, leida: false },
      data: { leida: true },
    });

    revalidatePath("/notificaciones");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Error al actualizar notificaciones: " + error.message };
  }
}

// Función auxiliar para uso interno del sistema (no llamada desde el cliente directamente)
export async function crearNotificacionSistema(userId: string, titulo: string, mensaje: string, tipo: string = "INFO", enlace?: string) {
  try {
    await NotificacionRepository.create({
      data: {
        userId,
        titulo,
        mensaje,
        tipo,
        enlace,
      },
    });
  } catch (error) {
    console.error("Error creando notificación automática:", error);
  }
}
