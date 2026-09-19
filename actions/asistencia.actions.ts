"use server";

import { AsistenciaRepository } from "@/repositories/asistencia.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";
import { prisma } from "@/lib/prisma";

import { asistenciaSchema } from "@/schemas";
import { z } from "zod";
import { logAudit } from "@/lib/audit.service";
import { requireRole } from "@/lib/rbac";
import * as XLSX from "xlsx";


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


export async function guardarAsistenciaMasiva(data: z.infer<typeof asistenciaMasivaSchema>) {
  try {
    const parsed = asistenciaMasivaSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);

    // Los Instructores solo pueden registrar asistencia en fichas que tienen asignadas
    if ((user as any).rol?.nombre?.toUpperCase() === "INSTRUCTOR") {
      const instructorRecord = await prisma.instructor.findUnique({
        where: { userId: user.id }
      });
      if (!instructorRecord) {
        return { success: false, error: "No tienes un perfil de instructor asociado." };
      }

      const asignacion = await prisma.instructorFicha.findFirst({
        where: { instructorId: instructorRecord.id, fichaId: data.fichaId },
      });
      if (!asignacion) {
        return { success: false, error: "No tienes permiso para registrar asistencia en esta ficha." };
      }
    }
    
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
      accion: "CREAR",
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
    const dataRaw = data as any;
    const dataToUpdate: any = {
      fichaId: data.fichaId,
      instructorId: data.instructorId,
      fecha: new Date(data.fecha as string),
      observaciones: data.tema || null,
      estado: dataRaw.estado,
    };
    if (dataRaw.totalPresentes !== undefined) dataToUpdate.totalPresentes = parseInt(dataRaw.totalPresentes);
    if (dataRaw.totalFaltas !== undefined) dataToUpdate.totalFaltas = parseInt(dataRaw.totalFaltas);
    if (dataRaw.totalExcusas !== undefined) dataToUpdate.totalExcusas = parseInt(dataRaw.totalExcusas);

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

export async function exportAsistenciasXLSX(fechaInicio?: string, fechaFin?: string, fichaId?: string) {
  try {
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);

    // Si es instructor, filtrar solo por sus propias asistencias
    let instructorFiltroId: string | undefined;
    const instructorRecord = await prisma.instructor.findUnique({ where: { userId: user.id } });
    if (instructorRecord) {
      instructorFiltroId = instructorRecord.id;
    }

    const whereClause: any = {
      ...(instructorFiltroId ? { instructorId: instructorFiltroId } : {}),
    };

    if (fichaId) {
      whereClause.fichaId = fichaId;
    }
    
    if (fechaInicio || fechaFin) {
      whereClause.fecha = {};
      if (fechaInicio) {
        const inicio = new Date(fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        whereClause.fecha.gte = inicio;
      }
      if (fechaFin) {
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        whereClause.fecha.lte = fin;
      }
    }

    const asistencias = await AsistenciaRepository.findMany({
      where: whereClause,
      orderBy: { fecha: "desc" },
      include: {
        ficha: {
          select: {
            codigo: true,
            programa: { select: { nombre: true } },
            _count: { select: { aprendices: true } },
          },
        },
        instructor: { select: { nombres: true, apellidos: true } },
        detalles: {
          include: {
            aprendiz: { select: { nombres: true, apellidos: true, numeroDocumento: true, tipoDocumento: true } }
          }
        }
      },
    });

    const rows = asistencias.flatMap((a) => {
      const baseRow = {
        "Fecha": a.fecha ? new Date(a.fecha).toLocaleDateString("es-CO") : "",
        "Ficha": a.ficha?.codigo ?? "",
        "Programa": a.ficha?.programa?.nombre ?? "",
        "Instructor": `${a.instructor?.nombres ?? ""} ${a.instructor?.apellidos ?? ""}`.trim(),
        "Tema / Obs. General": a.observaciones ?? "",
        "Estado Sesión": a.estado ?? "",
      };

      if (!a.detalles || a.detalles.length === 0) {
        return [{
          ...baseRow,
          "Aprendiz": "Sin detalles",
          "Documento": "",
          "Estado Asistencia": "",
          "Obs. Asistencia": "",
        }];
      }

      return a.detalles.map(d => ({
        ...baseRow,
        "Aprendiz": `${d.aprendiz?.nombres ?? ""} ${d.aprendiz?.apellidos ?? ""}`.trim(),
        "Documento": `${d.aprendiz?.tipoDocumento ?? ""} ${d.aprendiz?.numeroDocumento ?? ""}`.trim(),
        "Estado Asistencia": d.estado ?? "",
        "Obs. Asistencia": d.observaciones ?? "",
      }));
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencias");

    // Retornar como base64 para que el cliente lo descargue
    const base64 = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    return { success: true, base64 };
  } catch (error: any) {
    console.error("Error exporting asistencias XLSX:", error);
    return { success: false, error: "Error al generar reporte de asistencias" };
  }
}
