"use server";

import { UserRepository } from "@/repositories/user.repository";
import { AsistenciaRepository } from "@/repositories/asistencia.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";

import { asistenciaSchema } from "@/schemas";
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

export async function getAsistenciasAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where = {
      ...(filtros.busqueda ? {
        OR: [
          { ficha: { codigo: { contains: filtros.busqueda } } },
          { instructor: { nombres: { contains: filtros.busqueda } } },
          { instructor: { apellidos: { contains: filtros.busqueda } } },
        ]
      } : {}),
      ...(filtros.fichaId ? { fichaId: filtros.fichaId } : {}),
      ...(filtros.instructorId ? { instructorId: filtros.instructorId } : {}),
    };

    const [data, total] = await TransactionRepository.$transaction([
      AsistenciaRepository.findMany({
        where,
        skip,
        take,
        include: {
          ficha: { 
            select: { 
              codigo: true, 
              programa: { select: { nombre: true } },
              _count: { select: { aprendices: true } }
            } 
          },
          instructor: { select: { nombres: true, apellidos: true } }
        },
        orderBy: { fecha: "desc" },
      }),
      AsistenciaRepository.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching asistencias:", error);
    return { success: false, error: error.message || "Error al obtener asistencias" };
  }
}

import { asistenciaMasivaSchema } from "@/schemas";
import { DetalleAsistenciaRepository } from "@/repositories/detalleAsistencia.repository";

export async function guardarAsistenciaMasiva(data: z.infer<typeof asistenciaMasivaSchema>) {
  try {
    const parsed = asistenciaMasivaSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    
    // Contar estados
    let presentes = 0;
    let faltas = 0;
    let excusas = 0;
    data.detalles.forEach(d => {
      if (d.estado === "PRESENTE") presentes++;
      else if (d.estado === "FALLA") faltas++;
      else if (d.estado === "EXCUSA") excusas++;
    });

    // Usar transacción para atomicidad
    const asistencia = await TransactionRepository.$transaction(async (tx) => {
      // 1. Crear el encabezado
      const asist = await tx.asistencia.create({
        data: {
          fichaId: data.fichaId,
          instructorId: data.instructorId,
          fecha: new Date(data.fecha),
          estado: "REGISTRADA",
          totalPresentes: presentes,
          totalFaltas: faltas,
          totalExcusas: excusas,
        },
      });

      // 2. Crear los detalles masivamente
      if (data.detalles.length > 0) {
        await tx.detalleAsistencia.createMany({
          data: data.detalles.map(d => ({
            asistenciaId: asist.id,
            aprendizId: d.aprendizId,
            estado: d.estado,
            observaciones: d.observaciones || null,
          })),
        });
      }

      return asist;
    });

    await logAudit({
      userId: user.id,
      modulo: "Asistencia",
      accion: "CREAR_MASIVA",
      detalle: `Se registraron ${data.detalles.length} aprendices en la asistencia de la ficha.`,
    });
    revalidatePath("/asistencia");
    return { success: true, asistencia };
  } catch (error: any) {
    console.error("Error creating asistencia masiva:", error);
    return { error: error.message || "Error al registrar la asistencia" };
  }
}

export async function updateAsistencia(id: string, data: z.infer<typeof asistenciaSchema>) {
  try {
    const parsed = asistenciaSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const dataToUpdate: any = {
      fichaId: data.fichaId,
      instructorId: data.instructorId,
      fecha: new Date(data.fecha),
      observaciones: data.tema || null,
      estado: data.estado,
    };
    if (data.totalPresentes !== undefined) dataToUpdate.totalPresentes = parseInt(data.totalPresentes);
    if (data.totalFaltas !== undefined) dataToUpdate.totalFaltas = parseInt(data.totalFaltas);
    if (data.totalExcusas !== undefined) dataToUpdate.totalExcusas = parseInt(data.totalExcusas);

    const asistencia = await AsistenciaRepository.update({
      where: { id },
      data: dataToUpdate,
    });

    
    await logAudit({
      userId: user.id,
      modulo: "Asistencia",
      accion: "ACTUALIZAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/asistencia");
    return { success: true, asistencia };
  } catch (error: any) {
    console.error("Error updating asistencia:", error);
    return { error: error.message || "Error al actualizar sesión de asistencia" };
  }
}

export async function deleteAsistencia(id: string) {
  try {
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    await AsistenciaRepository.delete({ where: { id } });
    
    await logAudit({
      userId: user.id,
      modulo: "Asistencia",
      accion: "ELIMINAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/asistencia");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting asistencia:", error);
    return { error: error.message || "Error al eliminar sesión de asistencia" };
  }
}

export async function exportAsistenciasCSV() {
  try {
    const asistencias = await AsistenciaRepository.findMany({
      orderBy: { fecha: "desc" },
      include: {
        ficha: { 
          select: { 
            codigo: true, 
            programa: { select: { nombre: true } },
            _count: { select: { aprendices: true } }
          } 
        },
        instructor: { select: { nombres: true, apellidos: true } },
      },
    });

    const header = "Fecha,Ficha,Programa,Instructor,Tema,Total Aprendices,Presentes,Faltas,Excusas,Estado";
    const rows = asistencias.map((a) =>
      [
        a.fecha ? new Date(a.fecha).toLocaleDateString("es-CO") : "",
        a.ficha?.codigo ?? "",
        a.ficha?.programa?.nombre ?? "",
        `${a.instructor?.nombres ?? ""} ${a.instructor?.apellidos ?? ""}`,
        a.observaciones ?? "",
        a.ficha?._count?.aprendices ?? 0,
        a.totalPresentes,
        a.totalFaltas,
        a.totalExcusas,
        a.estado,
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting asistencias:", error);
    return { success: false, error: "Error al generar reporte de asistencias" };
  }
}
