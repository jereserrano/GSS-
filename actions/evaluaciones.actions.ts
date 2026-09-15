"use server";

import { prisma } from "@/lib/prisma";
import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";
import { logAudit } from "./reportes.actions";
import { requireRole } from "@/lib/auth-helpers";

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
    };

    const [data, total] = await prisma.$transaction([
      prisma.evaluacionAprendiz.findMany({
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
      prisma.evaluacionAprendiz.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching evaluaciones:", error);
    return { success: false, error: error.message || "Error al obtener evaluaciones" };
  }
}

export async function createEvaluacion(data: any) {
  try {
    const user = await requireRole("ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR");
    const existing = await prisma.evaluacionAprendiz.findFirst({
      where: {
        resultadoAprendizajeId: data.resultadoAprendizajeId,
        aprendizId: data.aprendizId
      }
    });
    
    if (existing) {
      return { error: "El aprendiz ya tiene una evaluación para este RAP. Por favor actualícela en su lugar." };
    }

    const evaluacion = await prisma.evaluacionAprendiz.create({
      data: {
        resultadoAprendizajeId: data.resultadoAprendizajeId,
        aprendizId: data.aprendizId,
        juicio: data.juicio || "POR_EVALUAR",
        fecha: data.fechaEvaluacion ? new Date(data.fechaEvaluacion) : null,
        observaciones: data.observaciones || null,
      },
    });

    revalidatePath("/evaluaciones");
    await logAudit({ accion: "CREAR", modulo: "EVALUACIONES", descripcion: `Evaluación registrada para aprendiz ID: ${data.aprendizId}`, usuarioId: user.id });
    return { success: true, evaluacion };
  } catch (error: any) {
    console.error("Error creating evaluacion:", error);
    return { error: error.message || "Error al registrar juicio valorativo" };
  }
}

export async function updateEvaluacion(id: string, data: any) {
  try {
    const user = await requireRole("ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR");
    const evaluacion = await prisma.evaluacionAprendiz.update({
      where: { id },
      data: {
        juicio: data.juicio,
        fecha: data.fechaEvaluacion ? new Date(data.fechaEvaluacion) : null,
        observaciones: data.observaciones || null,
      },
    });

    revalidatePath("/evaluaciones");
    await logAudit({ accion: "EDITAR", modulo: "EVALUACIONES", descripcion: `Evaluación actualizada ID: ${id}`, usuarioId: user.id });
    return { success: true, evaluacion };
  } catch (error: any) {
    console.error("Error updating evaluacion:", error);
    return { error: error.message || "Error al actualizar juicio valorativo" };
  }
}

export async function deleteEvaluacion(id: string) {
  try {
    const user = await requireRole("ADMINISTRADOR", "COORDINADOR"); // Instructores no pueden borrar
    await prisma.evaluacionAprendiz.delete({ where: { id } });
    revalidatePath("/evaluaciones");
    await logAudit({ accion: "ELIMINAR", modulo: "EVALUACIONES", descripcion: `Evaluación eliminada ID: ${id}`, usuarioId: user.id });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting evaluacion:", error);
    return { error: error.message || "Error al eliminar evaluación" };
  }
}

export async function exportEvaluacionesCSV() {
  try {
    const evaluaciones = await prisma.evaluacionAprendiz.findMany({
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
