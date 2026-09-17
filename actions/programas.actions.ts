"use server";

import { UserRepository } from "@/repositories/user.repository";
import { ProgramaRepository } from "@/repositories/programa.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";

import { programaSchema } from "@/schemas";
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

export async function getProgramasAction(filtros: {
  busqueda?: string;
  pagina?: number;
  tamano?: number;
} = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where: any = filtros.busqueda
      ? {
          OR: [
            { nombre: { contains: filtros.busqueda } },
            { codigo: { contains: filtros.busqueda } },
          ],
        }
      : {};

    const [data, total] = await TransactionRepository.$transaction([
      ProgramaRepository.findMany({
        where,
        skip,
        take,
        include: {
          _count: { select: { fichas: true, competencias: true } },
        },
        orderBy: { nombre: "asc" },
      }),
      ProgramaRepository.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching programas:", error);
    return { success: false, error: error.message || "Error al obtener programas" };
  }
}

export async function createPrograma(data: z.infer<typeof programaSchema>) {
  try {
    const parsed = programaSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const existing = await ProgramaRepository.findUnique({ where: { codigo: data.codigo } });
    if (existing) {
      return { error: "Ya existe un programa con ese código SENA" };
    }

    const programa = await ProgramaRepository.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        nivelFormacion: data.nivelFormacion || "TECNICO",
        estado: data.estado || "ACTIVO",
      },
    });

    
    await logAudit({
      userId: user.id,
      modulo: "Programas",
      accion: "CREAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/programas");
    return { success: true, programa };
  } catch (error: any) {
    console.error("Error creating programa:", error);
    return { error: error.message || "Error al crear el programa" };
  }
}

export async function updatePrograma(id: string, data: z.infer<typeof programaSchema>) {
  try {
    const parsed = programaSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const programa = await ProgramaRepository.update({
      where: { id },
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        nivelFormacion: data.nivelFormacion,
        estado: data.estado,
      },
    });

    
    await logAudit({
      userId: user.id,
      modulo: "Programas",
      accion: "ACTUALIZAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/programas");
    return { success: true, programa };
  } catch (error: any) {
    console.error("Error updating programa:", error);
    return { error: error.message || "Error al actualizar el programa" };
  }
}

export async function deletePrograma(id: string) {
  try {
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    await ProgramaRepository.delete({ where: { id } });
    
    await logAudit({
      userId: user.id,
      modulo: "Programas",
      accion: "ELIMINAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/programas");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting programa:", error);
    return { error: error.message || "Error al eliminar el programa. Verifique que no tenga fichas asociadas." };
  }
}

export async function exportProgramasCSV() {
  try {
    const programas = await ProgramaRepository.findMany({
      orderBy: { nombre: "asc" },
      include: {
        _count: { select: { fichas: true, competencias: true } },
      },
    });

    const header = "Código SENA,Nombre del Programa,Nivel de Formación,Total Fichas,Total Competencias,Estado";
    const rows = programas.map((p) =>
      [
        p.codigo,
        p.nombre,
        p.nivelFormacion,
        p._count.fichas,
        p._count.competencias,
        p.estado,
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting programas:", error);
    return { success: false, error: "Error al generar reporte de programas" };
  }
}

export async function getProgramaCompleto(programaId: string) {
  try {
    const programa = await ProgramaRepository.findUnique({
      where: { id: programaId },
      include: {
        competencias: {
          include: {
            resultadosAprendizaje: true,
          },
          orderBy: { nombre: "asc" }
        }
      }
    });

    if (!programa) return { success: false, error: "Programa no encontrado" };
    return { success: true, data: programa };
  } catch (error: any) {
    console.error("Error fetching programa completo:", error);
    return { success: false, error: "Error al cargar la información del programa" };
  }
}
