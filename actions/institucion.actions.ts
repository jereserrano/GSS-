"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createInstitucion(data: any) {
  try {
    const existing = await prisma.institucion.findUnique({ where: { nit: data.nit } });
    if (existing) {
      return { error: "Ya existe una institución con este NIT" };
    }

    const inst = await prisma.institucion.create({
      data: {
        nit: data.nit,
        nombre: data.nombre,
        municipio: data.municipio,
        departamento: data.departamento || "Magdalena",
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        rector: data.rector,
        estado: data.estado || "ACTIVO",
      },
    });

    revalidatePath("/instituciones");
    return { success: true, institucion: inst };
  } catch (error: any) {
    console.error("Error creating institucion:", error);
    return { error: error.message || "Error al crear la institución" };
  }
}

export async function updateInstitucion(id: string, data: any) {
  try {
    const inst = await prisma.institucion.update({
      where: { id },
      data: {
        nit: data.nit,
        nombre: data.nombre,
        municipio: data.municipio,
        departamento: data.departamento || "Magdalena",
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        rector: data.rector,
        estado: data.estado || "ACTIVO",
      },
    });

    revalidatePath("/instituciones");
    return { success: true, institucion: inst };
  } catch (error: any) {
    console.error("Error updating institucion:", error);
    return { error: error.message || "Error al actualizar la institución" };
  }
}

export async function deleteInstitucion(id: string) {
  try {
    await prisma.institucion.delete({
      where: { id },
    });

    revalidatePath("/instituciones");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting institucion:", error);
    return { error: error.message || "Error al eliminar la institución. Es posible que tenga dependencias asociadas." };
  }
}
