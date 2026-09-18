"use server";

import { z } from "zod";
import { documentoSchema } from "@/schemas";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit.service";
import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";

export async function getDocumentosAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where: any = {};
    if (filtros.busqueda) {
      where.OR = [
        { nombre: { contains: filtros.busqueda } },
        { tipo: { contains: filtros.busqueda } },
      ];
    }
    if (filtros.institucionId) {
      where.institucionId = filtros.institucionId;
    }

    const [documentos, total] = await prisma.$transaction([
      prisma.documento.findMany({
        where,
        skip,
        take,
        orderBy: { creadoEn: "desc" },
      }),
      prisma.documento.count({ where }),
    ]);

    // Opcionalmente resolver el nombre de la institución para la vista
    const institucionIds = Array.from(new Set(documentos.map(d => d.institucionId).filter(Boolean))) as string[];
    const instituciones = institucionIds.length > 0 
      ? await prisma.institucion.findMany({
          where: { id: { in: institucionIds } },
          select: { id: true, nombre: true }
        })
      : [];
    const instMap = new Map(instituciones.map(i => [i.id, i.nombre]));

    const dataConInstitucion = documentos.map(d => ({
      ...d,
      institucion: d.institucionId ? { id: d.institucionId, nombre: instMap.get(d.institucionId) || "Institución" } : null,
    }));

    return { success: true, data: paginatedResponse(dataConInstitucion, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error al obtener documentos:", error);
    return { success: false, error: "Error al obtener documentos: " + (error.message || "") };
  }
}

export async function createDocumento(data: z.infer<typeof documentoSchema>) {
  try {
    const parsed = documentoSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };

    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    
    const documento = await prisma.documento.create({
      data: {
        nombre: data.nombre.trim(),
        tipo: data.tipo || "OTRO",
        institucionId: data.institucionId || null,
        url: data.url.trim(),
      },
    });

    await logAudit({
      userId: user.id,
      modulo: "Documentos",
      accion: "CREAR",
      detalle: `Documento registrado: "${documento.nombre}"`,
    });

    revalidatePath("/documentos");
    return { success: true, documento };
  } catch (error: any) {
    console.error("Error al registrar documento:", error);
    return { error: error.message || "Error al registrar documento" };
  }
}

export async function updateDocumento(id: string, data: z.infer<typeof documentoSchema>) {
  try {
    const parsed = documentoSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };

    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);

    const documento = await prisma.documento.update({
      where: { id },
      data: {
        nombre: data.nombre.trim(),
        tipo: data.tipo || "OTRO",
        institucionId: data.institucionId || null,
        url: data.url.trim(),
      },
    });

    await logAudit({
      userId: user.id,
      modulo: "Documentos",
      accion: "ACTUALIZAR",
      detalle: `Documento actualizado: "${documento.nombre}"`,
    });

    revalidatePath("/documentos");
    return { success: true, documento };
  } catch (error: any) {
    console.error("Error al actualizar documento:", error);
    return { error: error.message || "Error al actualizar documento" };
  }
}

export async function deleteDocumento(id: string) {
  try {
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR"]);
    
    await prisma.documento.delete({ where: { id } });

    await logAudit({
      userId: user.id,
      modulo: "Documentos",
      accion: "ELIMINAR",
      detalle: `Documento eliminado ID: ${id}`,
    });

    revalidatePath("/documentos");
    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar documento:", error);
    return { error: error.message || "Error al eliminar documento" };
  }
}

export async function exportDocumentosCSV() {
  try {
    const documentos = await prisma.documento.findMany({
      orderBy: { creadoEn: "desc" },
    });

    const institucionIds = Array.from(new Set(documentos.map(d => d.institucionId).filter(Boolean))) as string[];
    const instituciones = institucionIds.length > 0 
      ? await prisma.institucion.findMany({
          where: { id: { in: institucionIds } },
          select: { id: true, nombre: true }
        })
      : [];
    const instMap = new Map(instituciones.map(i => [i.id, i.nombre]));

    const header = "Nombre,Tipo,Institución,URL,Fecha de Registro";
    const rows = documentos.map((d) =>
      [
        d.nombre ?? "",
        d.tipo ?? "",
        d.institucionId ? (instMap.get(d.institucionId) || d.institucionId) : "General",
        d.url ?? "",
        d.creadoEn ? new Date(d.creadoEn).toLocaleDateString("es-CO") : "",
      ]
        .map((v: any) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting documentos:", error);
    return { success: false, error: "Error al generar reporte de documentos" };
  }
}
