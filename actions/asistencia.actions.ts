"use server";

import { prisma } from "@/lib/prisma";
import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";

export async function getAsistenciasAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where = {
      ...(filtros.busqueda ? {
        OR: [
          { ficha: { codigo: { contains: filtros.busqueda } } },
          { instructor: { nombres: { contains: filtros.busqueda } } },
          { instructor: { apellidos: { contains: filtros.busqueda } } },
        ]
      } : {}),
      ...(filtros.fichaId ? { fichaId: filtros.fichaId } : {}),
      ...(filtros.instructorId ? { instructorId: filtros.instructorId } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.asistencia.findMany({
        where,
        skip,
        take,
        include: {
          ficha: { 
            select: { 
              codigo: true, 
              programa: { select: { nombre: true } },
              _count: { select: { aprendices: true } }
            } 
          },
          instructor: { select: { nombres: true, apellidos: true } }
        },
        orderBy: { fecha: "desc" },
      }),
      prisma.asistencia.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching asistencias:", error);
    return { success: false, error: error.message || "Error al obtener asistencias" };
  }
}

export async function createAsistencia(data: any) {
  try {
    const asistencia = await prisma.asistencia.create({
      data: {
        fichaId: data.fichaId,
        instructorId: data.instructorId,
        fecha: new Date(data.fecha),
        observaciones: data.tema || null, // Using observaciones as tema
        estado: data.estado || "PENDIENTE",
        totalPresentes: data.totalPresentes ? parseInt(data.totalPresentes) : 0,
        totalFaltas: data.totalFaltas ? parseInt(data.totalFaltas) : 0,
        totalExcusas: data.totalExcusas ? parseInt(data.totalExcusas) : 0,
      },
    });

    revalidatePath("/asistencia");
    return { success: true, asistencia };
  } catch (error: any) {
    console.error("Error creating asistencia:", error);
    return { error: error.message || "Error al crear sesión de asistencia" };
  }
}

export async function updateAsistencia(id: string, data: any) {
  try {
    const dataToUpdate: any = {
      fichaId: data.fichaId,
      instructorId: data.instructorId,
      fecha: new Date(data.fecha),
      observaciones: data.tema || null,
      estado: data.estado,
    };
    if (data.totalPresentes !== undefined) dataToUpdate.totalPresentes = parseInt(data.totalPresentes);
    if (data.totalFaltas !== undefined) dataToUpdate.totalFaltas = parseInt(data.totalFaltas);
    if (data.totalExcusas !== undefined) dataToUpdate.totalExcusas = parseInt(data.totalExcusas);

    const asistencia = await prisma.asistencia.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/asistencia");
    return { success: true, asistencia };
  } catch (error: any) {
    console.error("Error updating asistencia:", error);
    return { error: error.message || "Error al actualizar sesión de asistencia" };
  }
}

export async function deleteAsistencia(id: string) {
  try {
    await prisma.asistencia.delete({ where: { id } });
    revalidatePath("/asistencia");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting asistencia:", error);
    return { error: error.message || "Error al eliminar sesión de asistencia" };
  }
}

export async function exportAsistenciasCSV() {
  try {
    const asistencias = await prisma.asistencia.findMany({
      orderBy: { fecha: "desc" },
      include: {
        ficha: { 
          select: { 
            codigo: true, 
            programa: { select: { nombre: true } },
            _count: { select: { aprendices: true } }
          } 
        },
        instructor: { select: { nombres: true, apellidos: true } },
      },
    });

    const header = "Fecha,Ficha,Programa,Instructor,Tema,Total Aprendices,Presentes,Faltas,Excusas,Estado";
    const rows = asistencias.map((a) =>
      [
        a.fecha ? new Date(a.fecha).toLocaleDateString("es-CO") : "",
        a.ficha?.codigo ?? "",
        a.ficha?.programa?.nombre ?? "",
        `${a.instructor?.nombres ?? ""} ${a.instructor?.apellidos ?? ""}`,
        a.observaciones ?? "",
        a.ficha?._count?.aprendices ?? 0,
        a.totalPresentes,
        a.totalFaltas,
        a.totalExcusas,
        a.estado,
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting asistencias:", error);
    return { success: false, error: "Error al generar reporte de asistencias" };
  }
}
