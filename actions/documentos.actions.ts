"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Documentos de Empleados ---

export async function createDocumentoEmpleadoAction(data: {
  userId: string;
  tipoDocumento: string;
  nombre: string;
  urlArchivo: string;
  fechaVencimiento?: Date;
}) {
  try {
    const doc = await prisma.documentoEmpleado.create({
      data: {
        userId: data.userId,
        tipoDocumento: data.tipoDocumento,
        nombre: data.nombre,
        urlArchivo: data.urlArchivo,
        fechaVencimiento: data.fechaVencimiento,
      },
    });
    revalidatePath("/documentos");
    return { success: true, data: doc };
  } catch (error: any) {
    return { success: false, error: "Error al crear el documento" };
  }
}

export async function getDocumentosEmpleadoAction(userId: string) {
  try {
    const docs = await prisma.documentoEmpleado.findMany({
      where: { userId },
      orderBy: { creadoEn: "desc" }
    });
    return { success: true, data: docs };
  } catch (error: any) {
    return { success: false, error: "Error al cargar documentos" };
  }
}

export async function deleteDocumentoEmpleadoAction(id: string) {
  try {
    await prisma.documentoEmpleado.delete({ where: { id } });
    revalidatePath("/documentos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Error al eliminar documento" };
  }
}

// --- Solicitudes de Cartas ---

export async function createSolicitudCartaAction(data: {
  userId: string;
  tipoCarta: string;
  motivo?: string;
  dirigidoA?: string;
}) {
  try {
    const sol = await prisma.solicitudCarta.create({
      data: {
        userId: data.userId,
        tipoCarta: data.tipoCarta,
        motivo: data.motivo,
        dirigidoA: data.dirigidoA,
      },
    });
    revalidatePath("/documentos");
    return { success: true, data: sol };
  } catch (error: any) {
    return { success: false, error: "Error al solicitar carta" };
  }
}

export async function getSolicitudesCartasAction(userId: string) {
  try {
    const sols = await prisma.solicitudCarta.findMany({
      where: { userId },
      orderBy: { creadoEn: "desc" }
    });
    return { success: true, data: sols };
  } catch (error: any) {
    return { success: false, error: "Error al cargar solicitudes" };
  }
}
