"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function createCriterioEvaluacion(data: { codigo?: string, descripcion: string, resultadoAprendizajeId: string }) {
  try {
    await requireRole("ADMINISTRADOR", "COORDINADOR");
    if (!data.descripcion || !data.resultadoAprendizajeId) {
      return { success: false, error: "Datos incompletos" };
    }
    const res = await prisma.criterioEvaluacion.create({ data });
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: "Error al crear el Criterio de Evaluación" };
  }
}

export async function createInstrumentoEvaluacion(data: { nombre: string, tipo: string, criterioEvaluacionId: string }) {
  try {
    await requireRole("ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR");
    if (!data.nombre || !data.tipo || !data.criterioEvaluacionId) {
      return { success: false, error: "Datos incompletos" };
    }
    const res = await prisma.instrumentoEvaluacion.create({ data });
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: "Error al crear el Instrumento de Evaluación" };
  }
}
