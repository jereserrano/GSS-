"use server";

import { prisma } from "@/lib/prisma";
import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";

export async function getEntregasAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where = {
      ...(filtros.busqueda ? {
        OR: [
          { aprendiz: { nombres: { contains: filtros.busqueda } } },
          { aprendiz: { apellidos: { contains: filtros.busqueda } } },
          { aprendiz: { numeroDocumento: { contains: filtros.busqueda } } },
          { actividad: { nombre: { contains: filtros.busqueda } } },
        ]
      } : {}),
      ...(filtros.actividadId ? { actividadId: filtros.actividadId } : {}),
      ...(filtros.aprendizId ? { aprendizId: filtros.aprendizId } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.entrega.findMany({
        where,
        skip,
        take,
        include: {
          aprendiz: { select: { nombres: true, apellidos: true, numeroDocumento: true } },
          actividad: { select: { nombre: true, fechaVencimiento: true } },
        },
        orderBy: { fechaEntrega: "desc" },
      }),
      prisma.entrega.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching entregas:", error);
    return { success: false, error: error.message || "Error al obtener entregas" };
  }
}

export async function createEntrega(data: any) {
  try {
    const existing = await prisma.entrega.findUnique({
      where: {
        actividadId_aprendizId: {
          actividadId: data.actividadId,
          aprendizId: data.aprendizId
        }
      }
    });
    if (existing) {
      return { error: "El aprendiz ya tiene una entrega registrada para esta actividad" };
    }

    const entrega = await prisma.entrega.create({
      data: {
        actividadId: data.actividadId,
        aprendizId: data.aprendizId,
        estado: data.estado || "PENDIENTE",
        fechaEntrega: data.fechaEntrega ? new Date(data.fechaEntrega) : new Date(),
        calificacion: data.calificacion || null,
        comentario: data.retroalimentacion || null,
      },
    });

    revalidatePath("/entregas");
    return { success: true, entrega };
  } catch (error: any) {
    console.error("Error creating entrega:", error);
    return { error: error.message || "Error al crear entrega" };
  }
}

export async function updateEntrega(id: string, data: any) {
  try {
    const dataToUpdate: any = {
      estado: data.estado,
      calificacion: data.calificacion || null,
      comentario: data.retroalimentacion || null,
    };
    if (data.fechaEntrega) dataToUpdate.fechaEntrega = new Date(data.fechaEntrega);

    const entrega = await prisma.entrega.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/entregas");
    return { success: true, entrega };
  } catch (error: any) {
    console.error("Error updating entrega:", error);
    return { error: error.message || "Error al actualizar entrega" };
  }
}

export async function deleteEntrega(id: string) {
  try {
    await prisma.entrega.delete({ where: { id } });
    revalidatePath("/entregas");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting entrega:", error);
    return { error: error.message || "Error al eliminar entrega" };
  }
}

export async function exportEntregasCSV() {
  try {
    const entregas = await prisma.entrega.findMany({
      orderBy: { fechaEntrega: "desc" },
      include: {
        aprendiz: { select: { nombres: true, apellidos: true, numeroDocumento: true } },
        actividad: { select: { nombre: true, fechaVencimiento: true } },
      },
    });

    const header = "Actividad,Fecha de Vencimiento,Aprendiz,Documento,Fecha de Entrega,Estado,Calificación";
    const rows = entregas.map((e) =>
      [
        e.actividad?.nombre ?? "",
        e.actividad?.fechaVencimiento ? new Date(e.actividad.fechaVencimiento).toLocaleDateString("es-CO") : "",
        `${e.aprendiz?.nombres ?? ""} ${e.aprendiz?.apellidos ?? ""}`,
        e.aprendiz?.numeroDocumento ?? "",
        e.fechaEntrega ? new Date(e.fechaEntrega).toLocaleDateString("es-CO") : "No entregado",
        e.estado,
        e.calificacion ?? "",
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting entregas:", error);
    return { success: false, error: "Error al generar reporte de entregas" };
  }
}
