"use server";

import { AlertaRiesgoRepository } from "@/repositories/alertaRiesgo.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";

import { alertaSchema } from "@/schemas";
import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";
import { logAudit } from "./reportes.actions";
import { requireRole } from "@/lib/auth-helpers";

export async function getRiesgosAction(filtros: any = {}) {
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
          { descripcion: { contains: filtros.busqueda } },
        ]
      } : {}),
      ...(filtros.nivel ? { nivel: filtros.nivel } : {}),
    };

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
    const userId = await getSessionUserId();
    const user = await requireRole("ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR");
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
      userId,
      modulo: "Riesgos",
      accion: "CREAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/riesgos");
    await logAudit({ accion: "CREAR", modulo: "RIESGOS", descripcion: `Alerta registrada para aprendiz ID: ${data.aprendizId}`, usuarioId: user.id });
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
    const userId = await getSessionUserId();
    const user = await requireRole("ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR");
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
      userId,
      modulo: "Riesgos",
      accion: "ACTUALIZAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/riesgos");
    await logAudit({ accion: "EDITAR", modulo: "RIESGOS", descripcion: `Alerta actualizada ID: ${id}`, usuarioId: user.id });
    return { success: true, riesgo };
  } catch (error: any) {
    console.error("Error updating riesgo:", error);
    return { error: error.message || "Error al actualizar riesgo" };
  }
}

export async function deleteRiesgo(id: string) {
  try {
    const userId = await getSessionUserId();
    const user = await requireRole("ADMINISTRADOR", "COORDINADOR"); // Solo admins/coordinadores borran alertas
    await AlertaRiesgoRepository.delete({ where: { id } });
    
    await logAudit({
      userId,
      modulo: "Riesgos",
      accion: "ELIMINAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/riesgos");
    await logAudit({ accion: "ELIMINAR", modulo: "RIESGOS", descripcion: `Alerta eliminada ID: ${id}`, usuarioId: user.id });
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
