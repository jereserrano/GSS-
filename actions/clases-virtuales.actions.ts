"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { claseVirtualSchema } from "@/schemas/clase-virtual.schema";
import { z } from "zod";
import { createZoomMeeting } from "@/lib/zoom-api";
import { sendEmail } from "@/lib/mail";
import { revalidatePath } from "next/cache";

export async function crearClaseVirtualAction(data: z.infer<typeof claseVirtualSchema>) {
  try {
    const parsed = claseVirtualSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    }

    const sessionUser = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);

    // Verificar si el usuario tiene vinculado Microsoft y obtener su access token
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { instructor: true }
    });

    if (!user || !user.instructor) {
      return { success: false, error: "Tu usuario no está vinculado a un perfil de Instructor válido." };
    }

    if (!user.zoomAccessToken) {
      return { success: false, error: "No tienes tu cuenta de Zoom vinculada. Ve a tu perfil y conecta tu cuenta." };
    }

    const { titulo, descripcion, fechaInicio, duracionMin, fichaId } = parsed.data;
    
    // Obtener los aprendices de la ficha para enviar notificaciones y correos
    const ficha = await prisma.ficha.findUnique({
      where: { id: fichaId },
      include: { aprendices: { include: { user: true } } }
    });

    if (!ficha) {
      return { success: false, error: "Ficha no encontrada." };
    }

    const startDate = new Date(fechaInicio);
    const endDate = new Date(startDate.getTime() + duracionMin * 60000);

    // Importar función para renovar token
    const { getZoomAccessTokenFromRefreshToken } = await import("@/lib/zoom-api");

    // Conectar a Zoom API para agendar la reunión
    let zoomResponse = await createZoomMeeting(
      user.zoomAccessToken,
      titulo,
      startDate,
      duracionMin
    );

    // Si el token expiró, intentar renovarlo
    if (!zoomResponse.success && zoomResponse.error?.includes("Invalid access token") && user.zoomRefreshToken) {
      try {
        const tokenData = await getZoomAccessTokenFromRefreshToken(user.zoomRefreshToken);
        
        if (tokenData.access_token) {
          // Guardar el nuevo token
          await prisma.user.update({
            where: { id: user.id },
            data: {
              zoomAccessToken: tokenData.access_token,
              zoomRefreshToken: tokenData.refresh_token || user.zoomRefreshToken,
            }
          });

          // Reintentar la llamada con el nuevo token
          zoomResponse = await createZoomMeeting(
            tokenData.access_token,
            titulo,
            startDate,
            duracionMin
          );
        }
      } catch (refreshError) {
        console.error("Error renovando token de Zoom:", refreshError);
      }
    }

    if (!zoomResponse.success || !zoomResponse.joinUrl) {
      return { success: false, error: zoomResponse.error || "La sesión de Zoom expiró. Por favor ve a tu perfil, desconecta tu cuenta de Zoom y vuelve a conectarla." };
    }

    // Guardar la Clase en Base de Datos
    const nuevaClase = await prisma.claseVirtual.create({
      data: {
        titulo,
        descripcion,
        fechaInicio: startDate,
        duracionMin,
        enlaceUrl: zoomResponse.joinUrl,
        zoomMeetingId: zoomResponse.meetingId,
        fichaId,
        instructorId: user.instructor.id,
      }
    });

    // Enviar notificaciones In-App a todos los aprendices
    const aprendicesConUser = ficha.aprendices.filter(a => a.userId);
    if (aprendicesConUser.length > 0) {
      await prisma.notificacion.createMany({
        data: aprendicesConUser.map(a => ({
          userId: a.userId!,
          titulo: "Nueva Clase Virtual Programada",
          mensaje: `Se ha programado una clase virtual de Zoom: "${titulo}" para el ${startDate.toLocaleString()}`,
          tipo: "INFO",
          enlace: `/clases-virtuales`
        }))
      });
    }

    // Enviar correos masivos a los aprendices
    const emailsToNotify = ficha.aprendices
      .map(a => a.emailSena || a.emailPersonal)
      .filter((email): email is string => !!email);

    if (emailsToNotify.length > 0) {
      await sendEmail({
        to: emailsToNotify.join(", "),
        subject: `Nueva Clase Virtual en Zoom: ${titulo}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #00324D;">Nueva Sesión de Formación Programada</h2>
            <p>Hola,</p>
            <p>Tu instructor <strong>${user.instructor.nombres} ${user.instructor.apellidos}</strong> ha programado una nueva clase virtual en Zoom.</p>
            <ul>
              <li><strong>Título:</strong> ${titulo}</li>
              <li><strong>Fecha y Hora:</strong> ${startDate.toLocaleString()}</li>
              <li><strong>Duración:</strong> ${duracionMin} minutos</li>
            </ul>
            <p>${descripcion || ""}</p>
            <div style="margin-top: 20px;">
              <a href="${zoomResponse.joinUrl}" style="background-color: #2D8CFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Unirse a la reunión de Zoom
              </a>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #777;">Sistema GSS - SENA Regional Magdalena</p>
          </div>
        `
      });
    }

    revalidatePath("/clases-virtuales");
    return { success: true, data: nuevaClase };

  } catch (error: any) {
    console.error("Error al crear clase virtual:", error);
    return { success: false, error: error.message || "Error interno del servidor" };
  }
}
