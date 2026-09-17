"use server";

import { InstitucionRepository } from "@/repositories/institucion.repository";

import { institucionSchema } from "@/schemas";
import { revalidatePath } from "next/cache";
import { logAudit } from "./reportes.actions";
import { requireRole } from "@/lib/auth-helpers";

export async function createInstitucion(data: any) {
  try {
    const parsed = institucionSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    const userId = await getSessionUserId();
    const user = await requireRole("ADMINISTRADOR", "COORDINADOR");
    const existing = await InstitucionRepository.findUnique({ where: { nit: data.nit } });
    if (existing) {
      return { error: "Ya existe una institución con este NIT" };
    }

    const inst = await InstitucionRepository.create({
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

    
    await logAudit({
      userId,
      modulo: "Institución",
      accion: "CREAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/instituciones");
    await logAudit({ accion: "CREAR", modulo: "INSTITUCIONES", descripcion: `Institución creada: ${inst.nombre} (NIT: ${inst.nit})`, usuarioId: user.id });
    return { success: true, institucion: inst };
  } catch (error: any) {
    console.error("Error creating institucion:", error);
    return { error: error.message || "Error al crear la institución" };
  }
}

export async function updateInstitucion(id: string, data: any) {
  try {
    const parsed = institucionSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    const userId = await getSessionUserId();
    const user = await requireRole("ADMINISTRADOR", "COORDINADOR");
    const inst = await InstitucionRepository.update({
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

    
    await logAudit({
      userId,
      modulo: "Institución",
      accion: "ACTUALIZAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/instituciones");
    
    await logAudit({
      userId,
      modulo: "Institución",
      accion: "ACTUALIZAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath(`/instituciones/${id}`);
    await logAudit({ accion: "EDITAR", modulo: "INSTITUCIONES", descripcion: `Institución actualizada: ${inst.nombre}`, usuarioId: user.id });
    return { success: true, institucion: inst };
  } catch (error: any) {
    console.error("Error updating institucion:", error);
    return { error: error.message || "Error al actualizar la institución" };
  }
}

export async function deleteInstitucion(id: string) {
  try {
    const userId = await getSessionUserId();
    const user = await requireRole("ADMINISTRADOR"); // Solo admins borran
    const inst = await InstitucionRepository.delete({
      where: { id },
    });

    
    await logAudit({
      userId,
      modulo: "Institución",
      accion: "ELIMINAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/instituciones");
    await logAudit({ accion: "ELIMINAR", modulo: "INSTITUCIONES", descripcion: `Institución eliminada: ${inst.nombre}`, usuarioId: user.id });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting institucion:", error);
    return { error: error.message || "Error al eliminar la institución. Es posible que tenga dependencias asociadas." };
  }
}

export async function exportInstitucionesCSV() {
  try {
    const instituciones = await InstitucionRepository.findMany({
      orderBy: { nombre: "asc" },
      include: {
        sedes: { select: { id: true } }
      }
    });

    const header = "NIT,Nombre,Municipio,Departamento,Dirección,Teléfono,Email,Rector,Estado,Total Sedes";
    const rows = instituciones.map((i) =>
      [
        i.nit,
        i.nombre,
        i.municipio,
        i.departamento,
        i.direccion,
        i.telefono,
        i.email,
        i.rector,
        i.estado,
        i.sedes.length
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting instituciones:", error);
    return { success: false, error: "Error al generar reporte de instituciones" };
  }
}
