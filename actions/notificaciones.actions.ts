"use server";

import { UserRepository } from "@/repositories/user.repository";
import { NotificacionRepository } from "@/repositories/notificacion.repository";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { requireRole, requireInstitutionAccess } from "@/lib/rbac";
import { logAudit } from "@/lib/audit.service";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import { getNotificacionEmailTemplate } from "@/lib/email-templates";

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
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "APOYO_COORDINACION", "APCOORDINADOR", "INSTRUCTOR", "APRENDIZ"]);

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
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "APOYO_COORDINACION", "APCOORDINADOR", "INSTRUCTOR", "APRENDIZ"]);

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
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "APOYO_COORDINACION", "APCOORDINADOR", "INSTRUCTOR", "APRENDIZ"]);

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
// Por defecto también envía correo al usuario (aprendiz → correo personal; otros roles → correo de la cuenta).
// Pasar enviarCorreo=false cuando el llamador ya envía su propio correo o no aplica (ej. chat).
export async function crearNotificacionSistema(
  userId: string,
  titulo: string,
  mensaje: string,
  tipo: string = "INFO",
  enlace?: string,
  enviarCorreo: boolean = true
) {
  try {
    await NotificacionRepository.create({
      data: {
        userId,
        titulo,
        mensaje,
        tipo,
        enlace: enlace || null,
      },
    });
  } catch (error) {
    console.error("Error creando notificación automática:", error);
  }

  if (!enviarCorreo) return;

  try {
    const destino = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        nombre: true,
        email: true,
        aprendiz: { select: { nombres: true, emailPersonal: true, emailSena: true } },
      },
    });
    if (!destino) return;

    const to = destino.aprendiz?.emailPersonal || destino.aprendiz?.emailSena || destino.email;
    if (!to) return;

    const nombre = destino.aprendiz?.nombres || destino.nombre;
    // Fire-and-forget: un fallo SMTP nunca debe bloquear la operación principal
    sendEmail({
      to,
      subject: `${titulo} - GSS`,
      html: getNotificacionEmailTemplate(nombre, titulo, mensaje, enlace),
    }).catch((err) => console.error("Error enviando correo de notificación:", err));
  } catch (error) {
    console.error("Error preparando correo de notificación:", error);
  }
}
