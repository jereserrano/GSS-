"use server";

import { prisma } from "@/lib/prisma";
import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";

export async function getSeguimientosAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where = {
      ...(filtros.busqueda ? {
        OR: [
          { institucionNombre: { contains: filtros.busqueda } },
          { responsable: { contains: filtros.busqueda } },
        ]
      } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.visitaSeguimiento.findMany({
        where,
        skip,
        take,
        orderBy: { fecha: "desc" },
      }),
      prisma.visitaSeguimiento.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching seguimientos:", error);
    return { success: false, error: error.message || "Error al obtener seguimientos" };
  }
}

export async function createSeguimiento(data: any) {
  try {
    const institucion = await prisma.institucion.findUnique({ where: { id: data.institucionId } });
    const seguimiento = await prisma.visitaSeguimiento.create({
      data: {
        institucionNombre: institucion ? institucion.nombre : data.institucionId,
        fecha: new Date(data.fecha),
        responsable: data.responsable,
        novedades: data.novedades ? parseInt(data.novedades) : 0,
        estado: data.estado || "PROGRAMADA",
        observaciones: data.observaciones || null,
      },
    });

    revalidatePath("/seguimiento");
    return { success: true, seguimiento };
  } catch (error: any) {
    console.error("Error creating seguimiento:", error);
    return { error: error.message || "Error al crear visita de seguimiento" };
  }
}

export async function updateSeguimiento(id: string, data: any) {
  try {
    const institucion = data.institucionId ? await prisma.institucion.findUnique({ where: { id: data.institucionId } }) : null;
    const dataToUpdate: any = {
        fecha: new Date(data.fecha),
        responsable: data.responsable,
        estado: data.estado,
        observaciones: data.observaciones || null,
    };
    if (institucion) dataToUpdate.institucionNombre = institucion.nombre;
    if (data.novedades !== undefined) dataToUpdate.novedades = parseInt(data.novedades) || 0;

    const seguimiento = await prisma.visitaSeguimiento.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/seguimiento");
    return { success: true, seguimiento };
  } catch (error: any) {
    console.error("Error updating seguimiento:", error);
    return { error: error.message || "Error al actualizar visita de seguimiento" };
  }
}

export async function deleteSeguimiento(id: string) {
  try {
    await prisma.visitaSeguimiento.delete({ where: { id } });
    revalidatePath("/seguimiento");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting seguimiento:", error);
    return { error: error.message || "Error al eliminar visita de seguimiento" };
  }
}

export async function exportSeguimientosCSV() {
  try {
    const seguimientos = await prisma.visitaSeguimiento.findMany({
      orderBy: { fecha: "desc" },
    });

    const header = "Institución,Fecha de Visita,Responsable,Estado,Novedades,Observaciones";
    const rows = seguimientos.map((s) =>
      [
        s.institucionNombre,
        s.fecha ? new Date(s.fecha).toLocaleDateString("es-CO") : "",
        s.responsable,
        s.estado,
        s.novedades > 0 ? "Con novedades" : "Sin novedades",
        s.observaciones ?? "",
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting seguimientos:", error);
    return { success: false, error: "Error al generar reporte de seguimientos" };
  }
}
