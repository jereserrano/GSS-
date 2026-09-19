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

    const where: any = {
      ...(filtros.busqueda ? {
        OR: [
          { institucionNombre: { contains: filtros.busqueda } },
          { responsable: { contains: filtros.busqueda } },
        ]
      } : {}),
    };

    if (filtros.aprendizId) {
      where.aprendizId = filtros.aprendizId;
    } else if (filtros.fichaIds && filtros.fichaIds.length > 0) {
      where.fichaId = { in: filtros.fichaIds };
    }

    const [data, total] = await TransactionRepository.$transaction([
      VisitaSeguimientoRepository.findMany({
        where,
        include: {
          aprendiz: true,
          ficha: { include: { programa: true } }
        },
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
    if (!parsed.success) {
      console.error("Zod Validation Error (create):", parsed.error.errors);
      return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    }
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    
    // Si la visita está vinculada a una ficha o institución
    let nombreInstitucion = data.institucionNombre || "Institución";
    if (data.fichaId) {
      // Buscar la institución a través de la ficha
      const fichaData = await TransactionRepository.$queryRaw`SELECT i.nombre FROM fichas f JOIN instituciones i ON f.institucionId = i.id WHERE f.id = ${data.fichaId}`;
      if (Array.isArray(fichaData) && fichaData.length > 0 && (fichaData[0] as any).nombre) {
         nombreInstitucion = (fichaData[0] as any).nombre;
      }
    } else if (data.institucionId) {
      const institucion = await InstitucionRepository.findUnique({ where: { id: data.institucionId } });
      if (institucion) nombreInstitucion = institucion.nombre;
    }

    const seguimiento = await VisitaSeguimientoRepository.create({
      data: {
        aprendizId: data.aprendizId,
        fichaId: data.fichaId,
        institucionNombre: nombreInstitucion,
        fecha: new Date(data.fecha),
        responsable: data.responsable,
        novedades: typeof data.novedades === "number" ? data.novedades : data.novedades ? parseInt(String(data.novedades)) || 0 : 0,
        estado: (data.estado as any) || "PROGRAMADA",
        observaciones: data.observaciones || null,
      },
    });

    await logAudit({
      userId: user.id,
      modulo: "Seguimientos",
      accion: "CREAR",
      detalle: `Visita programada a aprendiz ${data.aprendizId} en ficha ${data.fichaId}`,
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
    if (!parsed.success) {
      console.error("Zod Validation Error (update):", parsed.error.errors);
      return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    }
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    
    let nombreInstitucion = data.institucionNombre;
    if (data.fichaId) {
      const fichaData = await TransactionRepository.$queryRaw`SELECT i.nombre FROM fichas f JOIN instituciones i ON f.institucionId = i.id WHERE f.id = ${data.fichaId}`;
      if (Array.isArray(fichaData) && fichaData.length > 0 && (fichaData[0] as any).nombre) {
         nombreInstitucion = (fichaData[0] as any).nombre;
      }
    } else if (data.institucionId) {
      const institucion = await InstitucionRepository.findUnique({ where: { id: data.institucionId } });
      if (institucion) nombreInstitucion = institucion.nombre;
    }

    const dataToUpdate: any = {
        aprendizId: data.aprendizId,
        fichaId: data.fichaId,
        fecha: new Date(data.fecha),
        responsable: data.responsable,
        estado: data.estado as any,
        observaciones: data.observaciones || null,
    };
    if (nombreInstitucion) {
      dataToUpdate.institucionNombre = nombreInstitucion;
    }

    if (data.novedades !== undefined) {
      dataToUpdate.novedades = typeof data.novedades === "number" ? data.novedades : parseInt(String(data.novedades)) || 0;
    }

    const seguimiento = await VisitaSeguimientoRepository.update({
      where: { id },
      data: dataToUpdate,
    });

    await logAudit({
      userId: user.id,
      modulo: "Seguimientos",
      accion: "ACTUALIZAR",
      detalle: `Visita actualizada ID: ${id}`,
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
