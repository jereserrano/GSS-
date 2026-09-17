"use server";

import { UserRepository } from "@/repositories/user.repository";
import { ResultadoAprendizajeRepository } from "@/repositories/resultadoAprendizaje.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";

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

export async function getResultadosAprendizajeAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where = {
      ...(filtros.busqueda ? {
        OR: [
          { codigo: { contains: filtros.busqueda } },
          { nombre: { contains: filtros.busqueda } },
        ]
      } : {}),
      ...(filtros.competenciaId ? { competenciaId: filtros.competenciaId } : {}),
    };

    const [data, total] = await TransactionRepository.$transaction([
      ResultadoAprendizajeRepository.findMany({
        where,
        skip,
        take,
        include: {
          competencia: { select: { nombre: true, codigo: true } },
        },
        orderBy: { codigo: "asc" },
      }),
      ResultadoAprendizajeRepository.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching resultados de aprendizaje:", error);
    return { success: false, error: error.message || "Error al obtener resultados de aprendizaje" };
  }
}

export async function createResultadoAprendizaje(data: any) {
  try {
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    // Nota: A diferencia de las competencias, el código de los RAP puede repetirse entre competencias (ej. RAP1, RAP2)
    // por lo que no forzamos unicidad global a menos que sea necesario por regla de negocio.

    const resultado = await ResultadoAprendizajeRepository.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        competenciaId: data.competenciaId,
        fase: data.fase || "ANALISIS",
      },
    });

    
    await logAudit({
      userId: user.id,
      modulo: "resultados_aprendizaje",
      accion: "CREAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/resultados-aprendizaje");
    return { success: true, resultado };
  } catch (error: any) {
    console.error("Error creating resultado de aprendizaje:", error);
    return { error: error.message || "Error al crear RAP" };
  }
}

export async function updateResultadoAprendizaje(id: string, data: any) {
  try {
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const resultado = await ResultadoAprendizajeRepository.update({
      where: { id },
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        competenciaId: data.competenciaId,
        fase: data.fase,
      },
    });

    
    await logAudit({
      userId: user.id,
      modulo: "resultados_aprendizaje",
      accion: "ACTUALIZAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/resultados-aprendizaje");
    return { success: true, resultado };
  } catch (error: any) {
    console.error("Error updating resultado de aprendizaje:", error);
    return { error: error.message || "Error al actualizar RAP" };
  }
}

export async function deleteResultadoAprendizaje(id: string) {
  try {
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    await ResultadoAprendizajeRepository.delete({ where: { id } });
    
    await logAudit({
      userId: user.id,
      modulo: "resultados_aprendizaje",
      accion: "ELIMINAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/resultados-aprendizaje");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting resultado de aprendizaje:", error);
    return { error: error.message || "Error al eliminar RAP" };
  }
}

export async function exportResultadosAprendizajeCSV() {
  try {
    const resultados = await ResultadoAprendizajeRepository.findMany({
      orderBy: { codigo: "asc" },
      include: {
        competencia: { select: { nombre: true, codigo: true } },
      },
    });

    const header = "Código,Resultado de Aprendizaje (RAP),Competencia Asociada,Fase del Proyecto";
    const rows = resultados.map((r) =>
      [
        r.codigo,
        r.nombre,
        `${r.competencia.codigo} - ${r.competencia.nombre}`,
        r.fase,
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting resultados de aprendizaje:", error);
    return { success: false, error: "Error al generar reporte de RAP" };
  }
}
