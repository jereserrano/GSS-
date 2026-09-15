"use server";

import { prisma } from "@/lib/prisma";
import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { NivelRiesgo } from "@prisma/client";
import { FiltrosAprendiz } from "@/types/aprendiz.types";

export async function getAprendicesAction(filtros: FiltrosAprendiz = {}) {
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
        ]
      } : {}),
      ...(filtros.nivelRiesgo ? { nivelRiesgo: filtros.nivelRiesgo.toUpperCase() as NivelRiesgo } : {}),
      ...(filtros.fichaId ? { fichaId: filtros.fichaId } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.aprendiz.findMany({
        where,
        skip,
        take,
        include: {
          ficha: {
            include: {
              programa: { select: { nombre: true, codigo: true } },
              institucion: { select: { nombre: true } },
              sede: { select: { nombre: true } },
            },
          },
        },
        orderBy: [{ nivelRiesgo: "desc" }, { apellidos: "asc" }],
      }),
      prisma.aprendiz.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching aprendices:", error);
    return { success: false, error: error.message || "Error al obtener aprendices" };
  }
}
