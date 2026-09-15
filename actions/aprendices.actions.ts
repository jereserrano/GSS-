"use server";

import { prisma } from "@/lib/prisma";
import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { NivelRiesgo } from "@prisma/client";
import { revalidatePath } from "next/cache";
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

export async function createAprendiz(data: any) {
  try {
    const existing = await prisma.aprendiz.findUnique({
      where: { numeroDocumento: data.numeroDocumento },
    });
    if (existing) {
      return { error: "Ya existe un aprendiz con ese número de documento" };
    }

    const aprendiz = await prisma.aprendiz.create({
      data: {
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        nombres: data.nombres,
        apellidos: data.apellidos,
        emailPersonal: data.emailPersonal || null,
        emailSena: data.emailSena || null,
        telefono: data.telefono || null,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        genero: data.genero || null,
        direccion: data.direccion || null,
        fichaId: data.fichaId,
        estado: data.estado || "EN_FORMACION",
        nivelRiesgo: data.nivelRiesgo || "BAJO",
      },
    });

    revalidatePath("/aprendices");
    return { success: true, aprendiz };
  } catch (error: any) {
    console.error("Error creating aprendiz:", error);
    return { error: error.message || "Error al crear el aprendiz" };
  }
}

export async function updateAprendiz(id: string, data: any) {
  try {
    const updateData: any = {
      tipoDocumento: data.tipoDocumento,
      numeroDocumento: data.numeroDocumento,
      nombres: data.nombres,
      apellidos: data.apellidos,
      emailPersonal: data.emailPersonal || null,
      emailSena: data.emailSena || null,
      telefono: data.telefono || null,
      genero: data.genero || null,
      direccion: data.direccion || null,
      estado: data.estado,
      nivelRiesgo: data.nivelRiesgo,
    };

    if (data.fechaNacimiento) {
      updateData.fechaNacimiento = new Date(data.fechaNacimiento);
    }
    if (data.fichaId) {
      updateData.fichaId = data.fichaId;
    }

    const aprendiz = await prisma.aprendiz.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/aprendices");
    return { success: true, aprendiz };
  } catch (error: any) {
    console.error("Error updating aprendiz:", error);
    return { error: error.message || "Error al actualizar el aprendiz" };
  }
}

export async function deleteAprendiz(id: string) {
  try {
    await prisma.aprendiz.delete({ where: { id } });
    revalidatePath("/aprendices");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting aprendiz:", error);
    return { error: error.message || "Error al eliminar el aprendiz" };
  }
}

export async function exportAprendicesCSV() {
  try {
    const aprendices = await prisma.aprendiz.findMany({
      orderBy: [{ apellidos: "asc" }, { nombres: "asc" }],
      include: {
        ficha: {
          include: {
            programa: { select: { nombre: true, codigo: true } },
            institucion: { select: { nombre: true } },
          },
        },
      },
    });

    const header = "Tipo Documento,Número Documento,Nombres,Apellidos,Email Personal,Email SENA,Teléfono,Género,Ficha,Programa,Institución,Estado,Nivel de Riesgo";
    const rows = aprendices.map((a) =>
      [
        a.tipoDocumento,
        a.numeroDocumento,
        a.nombres,
        a.apellidos,
        a.emailPersonal ?? "",
        a.emailSena ?? "",
        a.telefono ?? "",
        a.genero ?? "",
        a.ficha?.codigo ?? "",
        a.ficha?.programa?.nombre ?? "",
        a.ficha?.institucion?.nombre ?? "",
        a.estado,
        a.nivelRiesgo,
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting aprendices:", error);
    return { success: false, error: "Error al generar reporte de aprendices" };
  }
}

