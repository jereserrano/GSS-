"use server";

import { prisma } from "@/lib/prisma";
import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";

export async function getSedesAction(filtros: {
  busqueda?: string;
  institucionId?: string;
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
              { nombre: { contains: filtros.busqueda } },
              { coordinador: { contains: filtros.busqueda } },
              { institucion: { nombre: { contains: filtros.busqueda } } },
            ],
          }
        : {}),
      ...(filtros.institucionId ? { institucionId: filtros.institucionId } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.sede.findMany({
        where,
        skip,
        take,
        include: {
          institucion: { select: { id: true, nombre: true, nit: true } },
        },
        orderBy: { nombre: "asc" },
      }),
      prisma.sede.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching sedes:", error);
    return { success: false, error: error.message || "Error al obtener sedes" };
  }
}

export async function createSede(data: any) {
  try {
    const sede = await prisma.sede.create({
      data: {
        nombre: data.nombre,
        institucionId: data.institucionId,
        direccion: data.direccion || null,
        barrio: data.barrio || null,
        municipio: data.municipio || null,
        esPrincipal: data.esPrincipal === "true",
        coordinador: data.coordinador || null,
        telefono: data.telefono || null,
        estado: data.estado || "ACTIVO",
      },
    });
    revalidatePath("/sedes");
    return { success: true, sede };
  } catch (error: any) {
    console.error("Error creating sede:", error);
    return { error: error.message || "Error al crear la sede" };
  }
}

export async function updateSede(id: string, data: any) {
  try {
    const sede = await prisma.sede.update({
      where: { id },
      data: {
        nombre: data.nombre,
        institucionId: data.institucionId,
        direccion: data.direccion || null,
        barrio: data.barrio || null,
        municipio: data.municipio || null,
        esPrincipal: data.esPrincipal === "true",
        coordinador: data.coordinador || null,
        telefono: data.telefono || null,
        estado: data.estado,
      },
    });
    revalidatePath("/sedes");
    return { success: true, sede };
  } catch (error: any) {
    console.error("Error updating sede:", error);
    return { error: error.message || "Error al actualizar la sede" };
  }
}

export async function deleteSede(id: string) {
  try {
    await prisma.sede.delete({ where: { id } });
    revalidatePath("/sedes");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting sede:", error);
    return { error: error.message || "Error al eliminar la sede" };
  }
}

export async function exportSedesCSV() {
  try {
    const sedes = await prisma.sede.findMany({
      orderBy: { nombre: "asc" },
      include: {
        institucion: { select: { nombre: true, nit: true } },
      },
    });

    const header = "Nombre,Institución,NIT Institución,Dirección,Barrio,Municipio,Coordinador,Teléfono,Es Principal,Estado";
    const rows = sedes.map((s) =>
      [
        s.nombre,
        s.institucion?.nombre ?? "",
        s.institucion?.nit ?? "",
        s.direccion ?? "",
        s.barrio ?? "",
        s.municipio ?? "",
        s.coordinador ?? "",
        s.telefono ?? "",
        s.esPrincipal ? "Sí" : "No",
        s.estado,
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting sedes:", error);
    return { success: false, error: "Error al generar reporte de sedes" };
  }
}

