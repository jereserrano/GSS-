"use server";

import { ConfiguracionRepository } from "@/repositories/configuracion.repository";
import { UserRepository } from "@/repositories/user.repository";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit.service";
import { getServerSession } from "next-auth/next";
import { requireRole, requireInstitutionAccess } from "@/lib/rbac";

export async function getConfiguracionAction() {
  try {
    let config = await ConfiguracionRepository.findUnique({
      where: { id: "global" },
    });

    if (!config) {
      config = await ConfiguracionRepository.create({
        data: { id: "global" },
      });
    }

    return { success: true, data: config };
  } catch (error: any) {
    return { success: false, error: "Error al obtener la configuración: " + error.message };
  }
}

export async function updateConfiguracionAction(data: any) {
  try {
    const session = await getServerSession();
    let userId = null;
    if (session?.user?.email) {
      const user = await UserRepository.findUnique({ where: { email: session.user.email } });
      userId = user?.id || null;
    }

    // Convert values
    const updateData = {
      anioLectivo: Number(data.anioLectivo),
      trimestre: Number(data.trimestre),
      regional: String(data.regional),
      ciudad: String(data.ciudad),
      faltasRiesgoAlto: Number(data.faltasRiesgoAlto),
      asistenciaMinima: Number(data.asistenciaMinima),
      promedioMinimo: Number(data.promedioMinimo),
      diasEntrega: Number(data.diasEntrega),
      duracionSesionHoras: Number(data.duracionSesionHoras),
      intentosLogin: Number(data.intentosLogin),
    };

    const config = await ConfiguracionRepository.upsert({
      where: { id: "global" },
      update: updateData,
      create: { id: "global", ...updateData },
    });

    await logAudit({
      userId: user.id,
      modulo: "Configuración",
      accion: "ACTUALIZAR",
      detalle: "Se actualizaron las variables globales del sistema.",
    });

    revalidatePath("/configuracion");
    return { success: true, data: config };
  } catch (error: any) {
    return { success: false, error: "Error al actualizar configuración: " + error.message };
  }
}
