"use server";

import { prisma } from "@/lib/prisma";
import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";

export async function getActividadesAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where = {
      ...(filtros.busqueda ? {
        OR: [
          { nombre: { contains: filtros.busqueda } },
        ]
      } : {}),
      ...(filtros.fichaId ? { fichaId: filtros.fichaId } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.actividad.findMany({
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
          _count: { select: { entregas: true } }
        },
        orderBy: { fechaVencimiento: "desc" },
      }),
      prisma.actividad.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching actividades:", error);
    return { success: false, error: error.message || "Error al obtener actividades" };
  }
}

export async function createActividad(data: any) {
  try {
    const actividad = await prisma.actividad.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        tipo: data.tipo || "TALLER",
        fichaId: data.fichaId,
        fechaVencimiento: new Date(data.fechaFin || data.fechaVencimiento),
      },
    });

    revalidatePath("/actividades");
    return { success: true, actividad };
  } catch (error: any) {
    console.error("Error creating actividad:", error);
    return { error: error.message || "Error al crear actividad" };
  }
}

export async function updateActividad(id: string, data: any) {
  try {
    const actividad = await prisma.actividad.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        tipo: data.tipo,
        fichaId: data.fichaId,
        fechaVencimiento: new Date(data.fechaFin || data.fechaVencimiento),
        estado: data.estado,
      },
    });

    revalidatePath("/actividades");
    return { success: true, actividad };
  } catch (error: any) {
    console.error("Error updating actividad:", error);
    return { error: error.message || "Error al actualizar actividad" };
  }
}

export async function deleteActividad(id: string) {
  try {
    await prisma.actividad.delete({ where: { id } });
    revalidatePath("/actividades");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting actividad:", error);
    return { error: error.message || "Error al eliminar actividad" };
  }
}

export async function exportActividadesCSV() {
  try {
    const actividades = await prisma.actividad.findMany({
      orderBy: { fechaVencimiento: "desc" },
      include: {
        ficha: {
          select: {
            codigo: true,
            programa: { select: { nombre: true } },
            _count: { select: { aprendices: true } }
          }
        },
        _count: { select: { entregas: true } }
      },
    });

    const header = "Actividad,Tipo,Ficha,Programa,Fecha Vencimiento,Entregas,Total Aprendices";
    const rows = actividades.map((a) =>
      [
        a.nombre,
        a.tipo,
        a.ficha?.codigo ?? "",
        a.ficha?.programa?.nombre ?? "",
        a.fechaVencimiento ? new Date(a.fechaVencimiento).toLocaleDateString("es-CO") : "",
        a._count.entregas,
        a.ficha?._count?.aprendices ?? 0,
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting actividades:", error);
    return { success: false, error: "Error al generar reporte de actividades" };
  }
}
