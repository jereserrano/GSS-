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
        fechaVencimiento: data.fechaVencimiento || null,
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
        motivo: data.motivo || null,
        dirigidoA: data.dirigidoA || null,
      },
    });
    
    // Obtener coordinadores
    const coordinadores = await prisma.user.findMany({
      where: { rol: "COORDINADOR" }
    });

    const userReq = await prisma.user.findUnique({ where: { id: data.userId }});

    if (coordinadores.length > 0 && userReq) {
      await prisma.notificacion.createMany({
        data: coordinadores.map(c => ({
          userId: c.id,
          titulo: "📄 Nueva solicitud de carta",
          mensaje: `El instructor ${userReq.nombre || "Usuario"} ha solicitado una carta tipo ${data.tipoCarta}.`,
          tipo: "INFO",
          enlace: "/documentos",
        }))
      });
    }

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

export async function getTodasSolicitudesCartasAction() {
  try {
    const sols = await prisma.solicitudCarta.findMany({
      include: {
        user: { select: { nombre: true, email: true, instructor: { select: { numeroDocumento: true } } } }
      },
      orderBy: { creadoEn: "desc" }
    });
    return { success: true, data: sols };
  } catch (error: any) {
    return { success: false, error: "Error al cargar todas las solicitudes" };
  }
}

export async function actualizarSolicitudCartaAction(id: string, data: { estado: string; urlCarta?: string }) {
  try {
    const sol = await prisma.solicitudCarta.update({
      where: { id },
      data: {
        estado: data.estado,
        ...(data.urlCarta && { urlCarta: data.urlCarta })
      },
      include: { user: true }
    });

    if (data.estado === "GENERADA") {
      const isAprendiz = sol.user.rol === "APRENDIZ" || sol.user.rol.includes("APRENDIZ");
      const link = isAprendiz ? "/perfil?tab=tramites" : "/documentos?tab=cartas";
      
      await prisma.notificacion.create({
        data: {
          userId: sol.userId,
          titulo: "✅ Carta Generada",
          mensaje: `Tu solicitud de carta tipo ${sol.tipoCarta} ha sido completada y el documento está disponible.`,
          tipo: "INFO",
          enlace: link,
        }
      });
    }

    revalidatePath("/documentos");
    return { success: true, data: sol };
  } catch (error: any) {
    return { success: false, error: "Error al actualizar la solicitud" };
  }
}

export async function deleteSolicitudCartaAction(id: string) {
  try {
    const sol = await prisma.solicitudCarta.findUnique({ where: { id } });
    if (!sol || sol.estado !== "PENDIENTE") {
      return { success: false, error: "Solo puedes eliminar solicitudes pendientes." };
    }
    
    await prisma.solicitudCarta.delete({ where: { id } });
    revalidatePath("/documentos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Error al eliminar solicitud" };
  }
}

export async function updateSolicitudCartaUserAction(id: string, data: { tipoCarta: string; motivo?: string; dirigidoA?: string }) {
  try {
    const sol = await prisma.solicitudCarta.findUnique({ where: { id } });
    if (!sol || sol.estado !== "PENDIENTE") {
      return { success: false, error: "Solo puedes editar solicitudes pendientes." };
    }
    await prisma.solicitudCarta.update({
      where: { id },
      data: {
        tipoCarta: data.tipoCarta,
        motivo: data.motivo || null,
        dirigidoA: data.dirigidoA || null,
      }
    });
    revalidatePath("/documentos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Error al actualizar la solicitud" };
  }
}

export async function updateFirmaDigitalAction(userId: string, url: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { firmaDigitalUrl: url }
    });
    revalidatePath("/documentos");
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: "Error al guardar firma digital" };
  }
}

// --- Documentos Institucionales ---

export async function createDocumento(data: {
  nombre: string;
  tipo: string;
  institucionId?: string;
  url: string;
}) {
  try {
    const doc = await prisma.documento.create({ data });
    revalidatePath("/seguimiento");
    return { success: true, data: doc };
  } catch (error: any) {
    return { success: false, error: "Error al crear documento" };
  }
}

export async function updateDocumento(id: string, data: Partial<{
  nombre: string;
  tipo: string;
  institucionId: string;
  url: string;
}>) {
  try {
    const doc = await prisma.documento.update({ where: { id }, data });
    revalidatePath("/seguimiento");
    return { success: true, data: doc };
  } catch (error: any) {
    return { success: false, error: "Error al actualizar documento" };
  }
}

export async function deleteDocumento(id: string) {
  try {
    await prisma.documento.delete({ where: { id } });
    revalidatePath("/seguimiento");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Error al eliminar documento" };
  }
}

export async function exportDocumentosCSV() {
  try {
    const docs = await prisma.documento.findMany({
      include: { institucion: true }
    });
    const header = `"ID","Nombre","Tipo","Institución","URL","Creado En"` + "\n";
    const rows = docs.map((d: any) => 
      `"${d.id}","${d.nombre}","${d.tipo}","${d.institucion?.nombre || ''}","${d.url}","${d.creadoEn.toISOString()}"`
    ).join("\n");
    return { success: true, csv: header + rows };
  } catch (error: any) {
    return { success: false, error: "Error exportando" };
  }
}

