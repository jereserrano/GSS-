"use server";

import { prisma } from "@/lib/prisma";
import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";

export async function getFichasAction(filtros: {
  busqueda?: string;
  institucionId?: string;
  programaId?: string;
  pagina?: number;
  tamano?: number;
} = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where: any = {
      ...(filtros.busqueda
        ? {
            OR: [
              { codigo: { contains: filtros.busqueda } },
              { programa: { nombre: { contains: filtros.busqueda } } },
              { institucion: { nombre: { contains: filtros.busqueda } } },
            ],
          }
        : {}),
      ...(filtros.institucionId ? { institucionId: filtros.institucionId } : {}),
      ...(filtros.programaId ? { programaId: filtros.programaId } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.ficha.findMany({
        where,
        skip,
        take,
        include: {
          programa: { select: { nombre: true, codigo: true } },
          institucion: { select: { nombre: true } },
          sede: { select: { nombre: true } },
          _count: { select: { aprendices: true } },
        },
        orderBy: { codigo: "desc" },
      }),
      prisma.ficha.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching fichas:", error);
    return { success: false, error: error.message || "Error al obtener fichas" };
  }
}

export async function createFicha(data: any) {
  try {
    const existing = await prisma.ficha.findUnique({ where: { codigo: data.codigo } });
    if (existing) {
      return { error: "Ya existe una ficha con ese código" };
    }

    const ficha = await prisma.ficha.create({
      data: {
        codigo: data.codigo,
        programaId: data.programaId,
        institucionId: data.institucionId,
        sedeId: data.sedeId,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: new Date(data.fechaFin),
        jornada: data.jornada || null,
        estado: data.estado || "ACTIVO",
      },
    });

    revalidatePath("/fichas");
    return { success: true, ficha };
  } catch (error: any) {
    console.error("Error creating ficha:", error);
    return { error: error.message || "Error al crear la ficha" };
  }
}

export async function updateFicha(id: string, data: any) {
  try {
    const ficha = await prisma.ficha.update({
      where: { id },
      data: {
        codigo: data.codigo,
        programaId: data.programaId,
        institucionId: data.institucionId,
        sedeId: data.sedeId,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: new Date(data.fechaFin),
        jornada: data.jornada || null,
        estado: data.estado,
      },
    });

    revalidatePath("/fichas");
    return { success: true, ficha };
  } catch (error: any) {
    console.error("Error updating ficha:", error);
    return { error: error.message || "Error al actualizar la ficha" };
  }
}

export async function deleteFicha(id: string) {
  try {
    await prisma.ficha.delete({ where: { id } });
    revalidatePath("/fichas");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting ficha:", error);
    return { error: error.message || "Error al eliminar la ficha" };
  }
}

export async function exportFichasCSV() {
  try {
    const fichas = await prisma.ficha.findMany({
      orderBy: { codigo: "desc" },
      include: {
        programa: { select: { nombre: true, codigo: true } },
        institucion: { select: { nombre: true } },
        sede: { select: { nombre: true } },
        _count: { select: { aprendices: true } },
      },
    });

    const header = "Número de Ficha,Programa,Código Programa,Institución,Sede,Fecha Inicio,Fecha Fin,Jornada,Total Aprendices,Estado";
    const rows = fichas.map((f) =>
      [
        f.codigo,
        f.programa?.nombre ?? "",
        f.programa?.codigo ?? "",
        f.institucion?.nombre ?? "",
        f.sede?.nombre ?? "",
        f.fechaInicio ? new Date(f.fechaInicio).toLocaleDateString("es-CO") : "",
        f.fechaFin ? new Date(f.fechaFin).toLocaleDateString("es-CO") : "",
        f.jornada ?? "",
        f._count.aprendices,
        f.estado,
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting fichas:", error);
    return { success: false, error: "Error al generar reporte de fichas" };
  }
}

