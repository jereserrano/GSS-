"use server";

import { UserRepository } from "@/repositories/user.repository";
import { EntregaRepository } from "@/repositories/entrega.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";

import { entregaSchema } from "@/schemas";
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

export async function getEntregasAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where = {
      ...(filtros.busqueda ? {
        OR: [
          { aprendiz: { nombres: { contains: filtros.busqueda } } },
          { aprendiz: { apellidos: { contains: filtros.busqueda } } },
          { aprendiz: { numeroDocumento: { contains: filtros.busqueda } } },
          { actividad: { nombre: { contains: filtros.busqueda } } },
        ]
      } : {}),
      ...(filtros.actividadId ? { actividadId: filtros.actividadId } : {}),
      ...(filtros.aprendizId ? { aprendizId: filtros.aprendizId } : {}),
    };

    const [data, total] = await TransactionRepository.$transaction([
      EntregaRepository.findMany({
        where,
        skip,
        take,
        include: {
          aprendiz: { select: { nombres: true, apellidos: true, numeroDocumento: true } },
          actividad: { select: { nombre: true, fechaVencimiento: true } },
        },
        orderBy: { fechaEntrega: "desc" },
      }),
      EntregaRepository.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching entregas:", error);
    return { success: false, error: error.message || "Error al obtener entregas" };
  }
}

export async function createEntrega(data: z.infer<typeof entregaSchema>) {
  try {
    const parsed = entregaSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const existing = await EntregaRepository.findUnique({
      where: {
        actividadId_aprendizId: {
          actividadId: data.actividadId,
          aprendizId: data.aprendizId
        }
      }
    });
    if (existing) {
      return { error: "El aprendiz ya tiene una entrega registrada para esta actividad" };
    }

    const entrega = await EntregaRepository.create({
      data: {
        actividadId: data.actividadId,
        aprendizId: data.aprendizId,
        estado: data.estado || "PENDIENTE",
        fechaEntrega: data.fechaEntrega ? new Date(data.fechaEntrega) : new Date(),
        calificacion: data.calificacion || null,
        comentario: data.retroalimentacion || null,
      },
    });

    
    await logAudit({
      userId: user.id,
      modulo: "Entregas",
      accion: "CREAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/entregas");
    return { success: true, entrega };
  } catch (error: any) {
    console.error("Error creating entrega:", error);
    return { error: error.message || "Error al crear entrega" };
  }
}

export async function updateEntrega(id: string, data: z.infer<typeof entregaSchema>) {
  try {
    const parsed = entregaSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const dataToUpdate: any = {
      estado: data.estado,
      calificacion: data.calificacion || null,
      comentario: data.retroalimentacion || null,
    };
    if (data.fechaEntrega) dataToUpdate.fechaEntrega = new Date(data.fechaEntrega);

    const entrega = await EntregaRepository.update({
      where: { id },
      data: dataToUpdate,
    });

    
    await logAudit({
      userId: user.id,
      modulo: "Entregas",
      accion: "ACTUALIZAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/entregas");
    return { success: true, entrega };
  } catch (error: any) {
    console.error("Error updating entrega:", error);
    return { error: error.message || "Error al actualizar entrega" };
  }
}

export async function deleteEntrega(id: string) {
  try {
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    await EntregaRepository.delete({ where: { id } });
    
    await logAudit({
      userId: user.id,
      modulo: "Entregas",
      accion: "ELIMINAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/entregas");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting entrega:", error);
    return { error: error.message || "Error al eliminar entrega" };
  }
}

export async function exportEntregasCSV() {
  try {
    const entregas = await EntregaRepository.findMany({
      orderBy: { fechaEntrega: "desc" },
      include: {
        aprendiz: { select: { nombres: true, apellidos: true, numeroDocumento: true } },
        actividad: { select: { nombre: true, fechaVencimiento: true } },
      },
    });

    const header = "Actividad,Fecha de Vencimiento,Aprendiz,Documento,Fecha de Entrega,Estado,Calificación";
    const rows = entregas.map((e) =>
      [
        e.actividad?.nombre ?? "",
        e.actividad?.fechaVencimiento ? new Date(e.actividad.fechaVencimiento).toLocaleDateString("es-CO") : "",
        `${e.aprendiz?.nombres ?? ""} ${e.aprendiz?.apellidos ?? ""}`,
        e.aprendiz?.numeroDocumento ?? "",
        e.fechaEntrega ? new Date(e.fechaEntrega).toLocaleDateString("es-CO") : "No entregado",
        e.estado,
        e.calificacion ?? "",
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting entregas:", error);
    return { success: false, error: "Error al generar reporte de entregas" };
  }
}
