"use server";

import { prisma } from "@/lib/prisma";
import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";

export async function getCompetenciasAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where = {
      ...(filtros.busqueda ? {
        OR: [
          { codigo: { contains: filtros.busqueda } },
          { nombre: { contains: filtros.busqueda } },
        ]
      } : {}),
      ...(filtros.programaId ? { programaId: filtros.programaId } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.competencia.findMany({
        where,
        skip,
        take,
        include: {
          programa: { select: { nombre: true, codigo: true } },
          _count: {
            select: { resultadosAprendizaje: true }
          }
        },
        orderBy: { codigo: "asc" },
      }),
      prisma.competencia.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching competencias:", error);
    return { success: false, error: error.message || "Error al obtener competencias" };
  }
}

export async function createCompetencia(data: any) {
  try {
    const existing = await prisma.competencia.findUnique({
      where: { codigo: data.codigo },
    });
    if (existing) {
      return { error: "Ya existe una competencia con ese código" };
    }

    const competencia = await prisma.competencia.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        programaId: data.programaId,
        tipo: data.tipo || "TECNICA",
        duracionHoras: Number(data.duracionHoras),
        estado: data.estado || "ACTIVO",
      },
    });

    revalidatePath("/competencias");
    return { success: true, competencia };
  } catch (error: any) {
    console.error("Error creating competencia:", error);
    return { error: error.message || "Error al crear competencia" };
  }
}

export async function updateCompetencia(id: string, data: any) {
  try {
    const competencia = await prisma.competencia.update({
      where: { id },
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        programaId: data.programaId,
        tipo: data.tipo,
        duracionHoras: Number(data.duracionHoras),
        estado: data.estado,
      },
    });

    revalidatePath("/competencias");
    return { success: true, competencia };
  } catch (error: any) {
    console.error("Error updating competencia:", error);
    return { error: error.message || "Error al actualizar competencia" };
  }
}

export async function deleteCompetencia(id: string) {
  try {
    await prisma.competencia.delete({ where: { id } });
    revalidatePath("/competencias");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting competencia:", error);
    return { error: error.message || "Error al eliminar competencia" };
  }
}

export async function exportCompetenciasCSV() {
  try {
    const competencias = await prisma.competencia.findMany({
      orderBy: { codigo: "asc" },
      include: {
        programa: { select: { nombre: true, codigo: true } },
        _count: {
          select: { resultadosAprendizaje: true }
        }
      },
    });

    const header = "Código,Competencia,Programa,Tipo,Duración (horas),Resultados Asociados,Estado";
    const rows = competencias.map((c) =>
      [
        c.codigo,
        c.nombre,
        c.programa?.nombre ?? "",
        c.tipo,
        c.duracionHoras,
        c._count.resultadosAprendizaje,
        c.estado,
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting competencias:", error);
    return { success: false, error: "Error al generar reporte de competencias" };
  }
}
