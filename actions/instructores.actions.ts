"use server";

import { prisma } from "@/lib/prisma";
import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";

export async function getInstructoresAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where = {
      ...(filtros.busqueda ? {
        OR: [
          { nombres: { contains: filtros.busqueda } },
          { apellidos: { contains: filtros.busqueda } },
          { numeroDocumento: { contains: filtros.busqueda } },
          { email: { contains: filtros.busqueda } },
        ]
      } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.instructor.findMany({
        where,
        skip,
        take,
        include: {
          _count: { select: { asistencias: true } }
        },
        orderBy: { apellidos: "asc" },
      }),
      prisma.instructor.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching instructores:", error);
    return { success: false, error: error.message || "Error al obtener instructores" };
  }
}

export async function createInstructor(data: any) {
  try {
    const existing = await prisma.instructor.findFirst({
      where: { 
        OR: [
          { numeroDocumento: data.numeroDocumento },
          { email: data.email }
        ]
      },
    });
    if (existing) {
      return { error: "Ya existe un instructor con ese documento o email" };
    }

    const instructor = await prisma.instructor.create({
      data: {
        tipoDocumento: data.tipoDocumento || "CC",
        numeroDocumento: data.numeroDocumento,
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        telefono: data.telefono || null,
        profesion: data.profesion || null,
        estado: data.estado || "ACTIVO",
      },
    });

    revalidatePath("/instructores");
    return { success: true, instructor };
  } catch (error: any) {
    console.error("Error creating instructor:", error);
    return { error: error.message || "Error al crear instructor" };
  }
}

export async function updateInstructor(id: string, data: any) {
  try {
    const instructor = await prisma.instructor.update({
      where: { id },
      data: {
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        telefono: data.telefono || null,
        profesion: data.profesion || null,
        estado: data.estado,
      },
    });

    revalidatePath("/instructores");
    return { success: true, instructor };
  } catch (error: any) {
    console.error("Error updating instructor:", error);
    return { error: error.message || "Error al actualizar instructor" };
  }
}

export async function deleteInstructor(id: string) {
  try {
    await prisma.instructor.delete({ where: { id } });
    revalidatePath("/instructores");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting instructor:", error);
    return { error: error.message || "Error al eliminar instructor" };
  }
}

export async function exportInstructoresCSV() {
  try {
    const instructores = await prisma.instructor.findMany({
      orderBy: { apellidos: "asc" },
      include: {
        _count: { select: { asistencias: true } }
      }
    });

    const header = "Tipo Documento,Número Documento,Nombres,Apellidos,Email,Teléfono,Profesión,Estado,Asistencias Registradas";
    const rows = instructores.map((i) =>
      [
        i.tipoDocumento,
        i.numeroDocumento,
        i.nombres,
        i.apellidos,
        i.email,
        i.telefono ?? "",
        i.profesion ?? "",
        i.estado,
        i._count.asistencias,
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting instructores:", error);
    return { success: false, error: "Error al generar reporte de instructores" };
  }
}
