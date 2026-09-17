"use server";

import { UserRepository } from "@/repositories/user.repository";
import { VisitaSeguimientoRepository } from "@/repositories/visitaSeguimiento.repository";
import { InstitucionRepository } from "@/repositories/institucion.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";

import { visitaSchema } from "@/schemas";
import { z } from "zod";
import { logAudit } from "@/lib/audit.service";
import { getServerSession } from "next-auth/next";
import { requireRole, requireInstitutionAccess } from "@/lib/rbac";

async function getSessionUserId() {
  try {
    const session = await getServerSession();
    if (session?.user?.email) {
      const user = await UserRepository.findUnique({ where: { email: session.user.email } });
      return user?.id || null;
    }
  } catch (e) {}
  return null;
}

import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";

export async function getSeguimientosAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where = {
      ...(filtros.busqueda ? {
        OR: [
          { institucionNombre: { contains: filtros.busqueda } },
          { responsable: { contains: filtros.busqueda } },
        ]
      } : {}),
    };

    const [data, total] = await TransactionRepository.$transaction([
      VisitaSeguimientoRepository.findMany({
        where,
        skip,
        take,
        orderBy: { fecha: "desc" },
      }),
      VisitaSeguimientoRepository.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching seguimientos:", error);
    return { success: false, error: error.message || "Error al obtener seguimientos" };
  }
}

export async function createSeguimiento(data: z.infer<typeof visitaSchema>) {
  try {
    const parsed = visitaSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const institucion = await InstitucionRepository.findUnique({ where: { id: data.institucionId } });
    const seguimiento = await VisitaSeguimientoRepository.create({
      data: {
        institucionNombre: institucion ? institucion.nombre : data.institucionId,
        fecha: new Date(data.fecha),
        responsable: data.responsable,
        novedades: data.novedades ? parseInt(data.novedades) : 0,
        estado: data.estado || "PROGRAMADA",
        observaciones: data.observaciones || null,
      },
    });

    
    await logAudit({
      userId: user.id,
      modulo: "Seguimientos",
      accion: "CREAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/seguimiento");
    return { success: true, seguimiento };
  } catch (error: any) {
    console.error("Error creating seguimiento:", error);
    return { error: error.message || "Error al crear visita de seguimiento" };
  }
}

export async function updateSeguimiento(id: string, data: z.infer<typeof visitaSchema>) {
  try {
    const parsed = visitaSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const institucion = data.institucionId ? await InstitucionRepository.findUnique({ where: { id: data.institucionId } }) : null;
    const dataToUpdate: any = {
        fecha: new Date(data.fecha),
        responsable: data.responsable,
        estado: data.estado,
        observaciones: data.observaciones || null,
    };
    if (institucion) dataToUpdate.institucionNombre = institucion.nombre;
    if (data.novedades !== undefined) dataToUpdate.novedades = parseInt(data.novedades) || 0;

    const seguimiento = await VisitaSeguimientoRepository.update({
      where: { id },
      data: dataToUpdate,
    });

    
    await logAudit({
      userId: user.id,
      modulo: "Seguimientos",
      accion: "ACTUALIZAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/seguimiento");
    return { success: true, seguimiento };
  } catch (error: any) {
    console.error("Error updating seguimiento:", error);
    return { error: error.message || "Error al actualizar visita de seguimiento" };
  }
}

export async function deleteSeguimiento(id: string) {
  try {
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    await VisitaSeguimientoRepository.delete({ where: { id } });
    
    await logAudit({
      userId: user.id,
      modulo: "Seguimientos",
      accion: "ELIMINAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/seguimiento");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting seguimiento:", error);
    return { error: error.message || "Error al eliminar visita de seguimiento" };
  }
}

export async function exportSeguimientosCSV() {
  try {
    const seguimientos = await VisitaSeguimientoRepository.findMany({
      orderBy: { fecha: "desc" },
    });

    const header = "Institución,Fecha de Visita,Responsable,Estado,Novedades,Observaciones";
    const rows = seguimientos.map((s) =>
      [
        s.institucionNombre,
        s.fecha ? new Date(s.fecha).toLocaleDateString("es-CO") : "",
        s.responsable,
        s.estado,
        s.novedades > 0 ? "Con novedades" : "Sin novedades",
        s.observaciones ?? "",
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting seguimientos:", error);
    return { success: false, error: "Error al generar reporte de seguimientos" };
  }
}
