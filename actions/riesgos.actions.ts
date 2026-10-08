"use server";

import { AlertaRiesgoRepository } from "@/repositories/alertaRiesgo.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";

import { alertaSchema } from "@/schemas";
import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit.service";
import { requireRole } from "@/lib/auth-helpers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getRiesgosAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    // --- SECURITY: if the caller is an APRENDIZ, ALWAYS restrict to their OWN records only ---
    // This cannot be bypassed from the client side.
    const session = await getServerSession(authOptions);
    const rol = session?.user?.role?.toUpperCase();
    let forcedAprendizId: string | null = null;

    if (rol === "APRENDIZ" && session?.user?.email) {
      const userRecord = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });
      if (userRecord) {
        const aprendizRecord = await prisma.aprendiz.findUnique({
          where: { userId: userRecord.id },
          select: { id: true }
        });
        if (aprendizRecord) {
          forcedAprendizId = aprendizRecord.id;
        }
      }
    }

    const where: any = {
      ...(filtros.busqueda ? {
        OR: [
          { aprendiz: { nombres: { contains: filtros.busqueda } } },
          { aprendiz: { apellidos: { contains: filtros.busqueda } } },
          { aprendiz: { numeroDocumento: { contains: filtros.busqueda } } },
          { descripcion: { contains: filtros.busqueda } },
        ]
      } : {}),
      ...(filtros.nivel ? { nivel: filtros.nivel } : {}),
    };

    if (filtros.fichaIds && filtros.fichaIds.length > 0) {
      where.aprendiz = { ...where.aprendiz, fichaId: { in: filtros.fichaIds } };
    }

    // Force aprendiz filter: if APRENDIZ role, use their own ID (ignore any client-supplied value)
    const effectiveAprendizId = forcedAprendizId ?? filtros.aprendizId ?? null;
    if (effectiveAprendizId) {
      where.aprendizId = effectiveAprendizId;
    }

    const [data, total] = await TransactionRepository.$transaction([
      AlertaRiesgoRepository.findMany({
        where,
        skip,
        take,
        include: {
          aprendiz: { 
            select: { 
              nombres: true, 
              apellidos: true, 
              numeroDocumento: true,
              ficha: { select: { codigo: true } }
            } 
          },
        },
        orderBy: { fechaDeteccion: "desc" },
      }),
      AlertaRiesgoRepository.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching riesgos:", error);
    return { success: false, error: error.message || "Error al obtener riesgos" };
  }
}

export async function createRiesgo(data: any) {
  try {
    const parsed = alertaSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"] as any);
    const riesgo = await AlertaRiesgoRepository.create({
      data: {
        aprendizId: data.aprendizId,
        motivo: data.descripcion || data.motivo,
        nivel: data.nivel || "MEDIO",
        fechaDeteccion: data.fechaDeteccion ? new Date(data.fechaDeteccion) : new Date(),
        gestionada: data.estado === "CERRADO",
        observaciones: data.planAccion || null,
      },
    });

    await logAudit({
      userId: user.id,
      modulo: "Riesgos",
      accion: "CREAR",
      detalle: `Alerta registrada para aprendiz ID: ${data.aprendizId}`,
    });
    revalidatePath("/riesgos");
    return { success: true, riesgo };
  } catch (error: any) {
    console.error("Error creating riesgo:", error);
    return { error: error.message || "Error al registrar riesgo" };
  }
}

export async function updateRiesgo(id: string, data: any) {
  try {
    const parsed = alertaSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"] as any);
    const dataToUpdate: any = {
        motivo: data.descripcion || data.motivo,
        nivel: data.nivel,
        gestionada: data.estado === "CERRADO",
        observaciones: data.planAccion || null,
    };
    if (data.fechaDeteccion) dataToUpdate.fechaDeteccion = new Date(data.fechaDeteccion);

    const riesgo = await AlertaRiesgoRepository.update({
      where: { id },
      data: dataToUpdate,
    });

    await logAudit({
      userId: user.id,
      modulo: "Riesgos",
      accion: "ACTUALIZAR",
      detalle: `Alerta actualizada ID: ${id}`,
    });
    revalidatePath("/riesgos");
    return { success: true, riesgo };
  } catch (error: any) {
    console.error("Error updating riesgo:", error);
    return { error: error.message || "Error al actualizar riesgo" };
  }
}

export async function deleteRiesgo(id: string) {
  try {
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR"] as any);
    await AlertaRiesgoRepository.delete({ where: { id } });
    
    await logAudit({
      userId: user.id,
      modulo: "Riesgos",
      accion: "ELIMINAR",
      detalle: `Alerta eliminada ID: ${id}`,
    });
    revalidatePath("/riesgos");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting riesgo:", error);
    return { error: error.message || "Error al eliminar riesgo" };
  }
}

export async function exportRiesgosCSV() {
  try {
    const riesgos = await AlertaRiesgoRepository.findMany({
      orderBy: { fechaDeteccion: "desc" },
      include: {
        aprendiz: { 
          select: { 
            nombres: true, 
            apellidos: true, 
            numeroDocumento: true,
            ficha: { select: { codigo: true } }
          } 
        },
      },
    });

    const header = "Aprendiz,Documento,Ficha,Motivo,Nivel de Riesgo,Fecha Detección,Estado,Observaciones";
    const rows = riesgos.map((r) =>
      [
        `${r.aprendiz?.nombres ?? ""} ${r.aprendiz?.apellidos ?? ""}`,
        r.aprendiz?.numeroDocumento ?? "",
        r.aprendiz?.ficha?.codigo ?? "",
        r.motivo ?? "",
        r.nivel,
        r.fechaDeteccion ? new Date(r.fechaDeteccion).toLocaleDateString("es-CO") : "",
        r.gestionada ? "CERRADO" : "ABIERTO",
        r.observaciones ?? "",
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting riesgos:", error);
    return { success: false, error: "Error al generar reporte de riesgos" };
  }
}
