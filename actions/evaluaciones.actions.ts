"use server";

import { EvaluacionAprendizRepository } from "@/repositories/evaluacionAprendiz.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";

import { evaluacionSchema } from "@/schemas";
import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit.service";
import { requireRole } from "@/lib/rbac";

export async function getEvaluacionesAction(filtros: any = {}) {
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
          { resultadoAprendizaje: { nombre: { contains: filtros.busqueda } } },
          { resultadoAprendizaje: { codigo: { contains: filtros.busqueda } } },
        ]
      } : {}),
      ...(filtros.rapId ? { resultadoAprendizajeId: filtros.rapId } : {}),
      ...(filtros.instructorFichaIds?.length ? { aprendiz: { fichaId: { in: filtros.instructorFichaIds } } } : {}),
    };

    const [data, total] = await TransactionRepository.$transaction([
      EvaluacionAprendizRepository.findMany({
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
          resultadoAprendizaje: { select: { codigo: true, nombre: true } },
        },
        orderBy: { actualizadoEn: "desc" },
      }),
      EvaluacionAprendizRepository.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching evaluaciones:", error);
    return { success: false, error: error.message || "Error al obtener evaluaciones" };
  }
}

export async function createEvaluacion(data: any) {
  try {
    const parsed = evaluacionSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const existing = await EvaluacionAprendizRepository.findFirst({
      where: {
        resultadoAprendizajeId: data.resultadoAprendizajeId,
        aprendizId: data.aprendizId
      }
    });
    
    if (existing) {
      return { error: "El aprendiz ya tiene una evaluación para este RAP. Por favor actualícela en su lugar." };
    }

    const evaluacion = await EvaluacionAprendizRepository.create({
      data: {
        resultadoAprendizajeId: data.resultadoAprendizajeId,
        aprendizId: data.aprendizId,
        juicio: data.juicio || "PENDIENTE",
        fecha: data.fechaEvaluacion ? new Date(data.fechaEvaluacion) : null,
        observaciones: data.observaciones || null,
      },
    });

    await logAudit({
      userId: user.id,
      modulo: "Evaluaciones",
      accion: "CREAR",
      detalle: `Evaluación registrada para aprendiz ID: ${data.aprendizId}`,
    });
    revalidatePath("/evaluaciones");
    return { success: true, evaluacion };
  } catch (error: any) {
    console.error("Error creating evaluacion:", error);
    return { error: error.message || "Error al registrar juicio valorativo" };
  }
}

export async function updateEvaluacion(id: string, data: any) {
  try {
    const parsed = evaluacionSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const evaluacion = await EvaluacionAprendizRepository.update({
      where: { id },
      data: {
        juicio: data.juicio,
        fecha: data.fechaEvaluacion ? new Date(data.fechaEvaluacion) : null,
        observaciones: data.observaciones || null,
      },
    });

    await logAudit({
      userId: user.id,
      modulo: "Evaluaciones",
      accion: "ACTUALIZAR",
      detalle: `Evaluación actualizada ID: ${id}`,
    });
    revalidatePath("/evaluaciones");
    return { success: true, evaluacion };
  } catch (error: any) {
    console.error("Error updating evaluacion:", error);
    return { error: error.message || "Error al actualizar juicio valorativo" };
  }
}

export async function deleteEvaluacion(id: string) {
  try {
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR"]); // Instructores no pueden borrar
    await EvaluacionAprendizRepository.delete({ where: { id } });
    
    await logAudit({
      userId: user.id,
      modulo: "Evaluaciones",
      accion: "ELIMINAR",
      detalle: `Evaluación eliminada ID: ${id}`,
    });
    revalidatePath("/evaluaciones");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting evaluacion:", error);
    return { error: error.message || "Error al eliminar evaluación" };
  }
}

export async function exportEvaluacionesCSV() {
  try {
    const evaluaciones = await EvaluacionAprendizRepository.findMany({
      orderBy: { actualizadoEn: "desc" },
      include: {
        aprendiz: { 
          select: { 
            nombres: true, 
            apellidos: true, 
            numeroDocumento: true,
            ficha: { select: { codigo: true } }
          } 
        },
        resultadoAprendizaje: { select: { codigo: true, nombre: true } },
      },
    });

    const header = "Aprendiz,Documento,Ficha,RAP (Código),RAP (Nombre),Juicio Valorativo,Fecha Evaluación,Observaciones";
    const rows = evaluaciones.map((e) =>
      [
        `${e.aprendiz?.nombres ?? ""} ${e.aprendiz?.apellidos ?? ""}`,
        e.aprendiz?.numeroDocumento ?? "",
        e.aprendiz?.ficha?.codigo ?? "",
        e.resultadoAprendizaje?.codigo ?? "",
        e.resultadoAprendizaje?.nombre ?? "",
        e.juicio,
        e.fecha ? new Date(e.fecha).toLocaleDateString("es-CO") : "",
        e.observaciones ?? "",
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting evaluaciones:", error);
    return { success: false, error: "Error al generar reporte de evaluaciones" };
  }
}
