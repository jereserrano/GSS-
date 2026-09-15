"use server";

import { prisma } from "@/lib/prisma";
import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";

export async function getDocentesAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where = {
      ...(filtros.busqueda ? {
        OR: [
          { nombres: { contains: filtros.busqueda } },
          { apellidos: { contains: filtros.busqueda } },
          { email: { contains: filtros.busqueda } },
          { institucionNombre: { contains: filtros.busqueda } },
        ]
      } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.docente.findMany({
        where,
        skip,
        take,
        orderBy: { apellidos: "asc" },
      }),
      prisma.docente.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching docentes:", error);
    return { success: false, error: error.message || "Error al obtener docentes" };
  }
}

export async function createDocente(data: any) {
  try {
    const existing = await prisma.docente.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return { error: "Ya existe un docente con ese correo electrónico" };
    }

    const docente = await prisma.docente.create({
      data: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        telefono: data.telefono || null,
        asignatura: data.asignatura || null,
        institucionNombre: data.institucionNombre || null,
        sedeNombre: data.sedeNombre || null,
        estado: data.estado || "ACTIVO",
      },
    });

    revalidatePath("/docentes");
    return { success: true, docente };
  } catch (error: any) {
    console.error("Error creating docente:", error);
    return { error: error.message || "Error al crear docente" };
  }
}

export async function updateDocente(id: string, data: any) {
  try {
    const docente = await prisma.docente.update({
      where: { id },
      data: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        telefono: data.telefono || null,
        asignatura: data.asignatura || null,
        institucionNombre: data.institucionNombre || null,
        sedeNombre: data.sedeNombre || null,
        estado: data.estado,
      },
    });

    revalidatePath("/docentes");
    return { success: true, docente };
  } catch (error: any) {
    console.error("Error updating docente:", error);
    return { error: error.message || "Error al actualizar docente" };
  }
}

export async function deleteDocente(id: string) {
  try {
    await prisma.docente.delete({ where: { id } });
    revalidatePath("/docentes");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting docente:", error);
    return { error: error.message || "Error al eliminar docente" };
  }
}

export async function exportDocentesCSV() {
  try {
    const docentes = await prisma.docente.findMany({
      orderBy: { apellidos: "asc" },
    });

    const header = "Nombres,Apellidos,Email,Teléfono,Asignatura,Institución,Sede,Estado";
    const rows = docentes.map((d) =>
      [
        d.nombres,
        d.apellidos,
        d.email,
        d.telefono ?? "",
        d.asignatura ?? "",
        d.institucionNombre ?? "",
        d.sedeNombre ?? "",
        d.estado,
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting docentes:", error);
    return { success: false, error: "Error al generar reporte de docentes" };
  }
}
