"use server";

import { UserRepository } from "@/repositories/user.repository";
import { FichaRepository } from "@/repositories/ficha.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";

import { fichaSchema } from "@/schemas";
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

export async function getFichasAction(filtros: {
  busqueda?: string;
  institucionId?: string;
  programaId?: string;
  estado?: string;
  pagina?: number;
  tamano?: number;
} = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where: any = {
      ...(filtros.busqueda
        ? {
            OR: [
              { codigo: { contains: filtros.busqueda } },
              { programa: { nombre: { contains: filtros.busqueda } } },
              { institucion: { nombre: { contains: filtros.busqueda } } },
            ],
          }
        : {}),
      ...(filtros.institucionId ? { institucionId: filtros.institucionId } : {}),
      ...(filtros.programaId ? { programaId: filtros.programaId } : {}),
      ...(filtros.estado ? { estado: filtros.estado.toUpperCase() } : {}),
    };

    const [data, total] = await TransactionRepository.$transaction([
      FichaRepository.findMany({
        where,
        skip,
        take,
        include: {
          programa: { select: { nombre: true, codigo: true } },
          institucion: { select: { nombre: true } },
          sede: { select: { nombre: true } },
          _count: { select: { aprendices: true } },
        },
        orderBy: { codigo: "desc" },
      }),
      FichaRepository.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching fichas:", error);
    return { success: false, error: error.message || "Error al obtener fichas" };
  }
}

export async function createFicha(data: z.infer<typeof fichaSchema>) {
  try {
    const parsed = fichaSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const existing = await FichaRepository.findUnique({ where: { codigo: data.codigo } });
    if (existing) {
      return { error: "Ya existe una ficha con ese código" };
    }

    const ficha = await FichaRepository.create({
      data: {
        codigo: data.codigo,
        programaId: data.programaId,
        institucionId: data.institucionId,
        sedeId: data.sedeId,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: new Date(data.fechaFin),
        jornada: data.jornada || null,
        estado: data.estado || "ACTIVO",
      },
    });

    
    await logAudit({
      userId: user.id,
      modulo: "Fichas",
      accion: "CREAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/fichas");
    return { success: true, ficha };
  } catch (error: any) {
    console.error("Error creating ficha:", error);
    return { error: error.message || "Error al crear la ficha" };
  }
}

export async function updateFicha(id: string, data: z.infer<typeof fichaSchema>) {
  try {
    const parsed = fichaSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const ficha = await FichaRepository.update({
      where: { id },
      data: {
        codigo: data.codigo,
        programaId: data.programaId,
        institucionId: data.institucionId,
        sedeId: data.sedeId,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: new Date(data.fechaFin),
        jornada: data.jornada || null,
        estado: data.estado,
      },
    });

    
    await logAudit({
      userId: user.id,
      modulo: "Fichas",
      accion: "ACTUALIZAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/fichas");
    return { success: true, ficha };
  } catch (error: any) {
    console.error("Error updating ficha:", error);
    return { error: error.message || "Error al actualizar la ficha" };
  }
}

export async function deleteFicha(id: string) {
  try {
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    await FichaRepository.delete({ where: { id } });
    
    await logAudit({
      userId: user.id,
      modulo: "Fichas",
      accion: "ELIMINAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/fichas");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting ficha:", error);
    return { error: error.message || "Error al eliminar la ficha" };
  }
}

export async function exportFichasCSV() {
  try {
    const fichas = await FichaRepository.findMany({
      orderBy: { codigo: "desc" },
      include: {
        programa: { select: { nombre: true, codigo: true } },
        institucion: { select: { nombre: true } },
        sede: { select: { nombre: true } },
        _count: { select: { aprendices: true } },
      },
    });

    const header = "Número de Ficha,Programa,Código Programa,Institución,Sede,Fecha Inicio,Fecha Fin,Jornada,Total Aprendices,Estado";
    const rows = fichas.map((f) =>
      [
        f.codigo,
        f.programa?.nombre ?? "",
        f.programa?.codigo ?? "",
        f.institucion?.nombre ?? "",
        f.sede?.nombre ?? "",
        f.fechaInicio ? new Date(f.fechaInicio).toLocaleDateString("es-CO") : "",
        f.fechaFin ? new Date(f.fechaFin).toLocaleDateString("es-CO") : "",
        f.jornada ?? "",
        f._count.aprendices,
        f.estado,
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting fichas:", error);
    return { success: false, error: "Error al generar reporte de fichas" };
  }
}

