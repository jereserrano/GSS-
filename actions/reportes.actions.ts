"use server";

import { AuditLogRepository } from "@/repositories/auditLog.repository";
import { AprendizRepository } from "@/repositories/aprendiz.repository";
import { AlertaRiesgoRepository } from "@/repositories/alertaRiesgo.repository";
import { AsistenciaRepository } from "@/repositories/asistencia.repository";
import { EvaluacionAprendizRepository } from "@/repositories/evaluacionAprendiz.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";

import { revalidatePath } from "next/cache";

/**
 * Registra un evento de auditoría en la base de datos.
 * Se llama desde Server Actions críticas (crear, editar, eliminar).
 */
export async function logAudit(data: {
  accion: string;
  modulo: string;
  descripcion?: string;
  entidadId?: string;
  usuarioId?: string;
}) {
  try {
    await AuditLogRepository.create({
      data: {
        accion: data.accion,
        modulo: data.modulo,
        detalle: data.descripcion || `${data.accion} en ${data.modulo}`,
        userId: data.usuarioId || null,
      },
    });
  } catch (error) {
    console.error("Error registering audit log:", error);
  }
}

export async function getAuditLogsAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = 20;
    const skip = (pagina - 1) * tamano;

    const where = filtros.modulo ? { modulo: filtros.modulo } : {};

    const [data, total] = await TransactionRepository.$transaction([
      AuditLogRepository.findMany({
        where,
        skip,
        take: tamano,
        include: {
          user: { select: { nombre: true, email: true } },
        },
        orderBy: { fecha: "desc" },
      }),
      AuditLogRepository.count({ where }),
    ]);

    return {
      success: true,
      data: {
        data,
        total,
        page: pagina,
        pageSize: tamano,
        totalPages: Math.ceil(total / tamano),
      },
    };
  } catch (error: any) {
    console.error("Error fetching audit logs:", error);
    return { success: false, error: "Error al obtener auditoría" };
  }
}

/** Genera datos para un reporte y lo devuelve como CSV string */
export async function generarReporteAprendicesCSV() {
  try {
    const aprendices = await AprendizRepository.findMany({
      select: {
        numeroDocumento: true,
        nombres: true,
        apellidos: true,
        estado: true,
        nivelRiesgo: true,
        porcentajeAsistencia: true,
        ficha: {
          select: {
            codigo: true,
            programa: { select: { nombre: true } },
            institucion: { select: { nombre: true } },
          },
        },
      },
      orderBy: [{ ficha: { codigo: "asc" } }, { apellidos: "asc" }],
    });

    const header = "Documento,Nombres,Apellidos,Estado,Nivel Riesgo,% Asistencia,Ficha,Programa,Institución";
    const rows = aprendices.map((a) =>
      [
        a.numeroDocumento,
        a.nombres,
        a.apellidos,
        a.estado,
        a.nivelRiesgo,
        a.porcentajeAsistencia.toFixed(1),
        a.ficha?.codigo || "",
        a.ficha?.programa?.nombre || "",
        a.ficha?.institucion?.nombre || "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    return { success: false, error: "Error al generar reporte" };
  }
}

export async function generarReporteRiesgosCSV() {
  try {
    const alertas = await AlertaRiesgoRepository.findMany({
      include: {
        aprendiz: {
          select: {
            nombres: true,
            apellidos: true,
            numeroDocumento: true,
            ficha: { select: { codigo: true, institucion: { select: { nombre: true } } } },
          },
        },
      },
      orderBy: [{ nivel: "desc" }, { fechaDeteccion: "desc" }],
    });

    const header = "Documento,Aprendiz,Ficha,Institución,Motivo,Nivel,Fecha,Gestionada,Observaciones";
    const rows = alertas.map((a) =>
      [
        a.aprendiz.numeroDocumento,
        `${a.aprendiz.nombres} ${a.aprendiz.apellidos}`,
        a.aprendiz.ficha?.codigo || "",
        a.aprendiz.ficha?.institucion?.nombre || "",
        a.motivo,
        a.nivel,
        a.fechaDeteccion.toLocaleDateString("es-CO"),
        a.gestionada ? "Sí" : "No",
        a.observaciones || "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    return { success: false, error: "Error al generar reporte" };
  }
}

export async function generarReporteAsistenciaCSV() {
  try {
    const registros = await AsistenciaRepository.findMany({
      include: {
        ficha: {
          select: {
            codigo: true,
            programa: { select: { nombre: true } },
            institucion: { select: { nombre: true } },
          },
        },
        instructor: { select: { nombres: true, apellidos: true } },
      },
      orderBy: [{ ficha: { codigo: "asc" } }, { fecha: "desc" }],
    });

    const header = "Ficha,Institución,Programa,Instructor,Fecha,Presentes,Faltas,Excusas,Estado";
    const rows = registros.map((r) =>
      [
        r.ficha?.codigo || "",
        r.ficha?.institucion?.nombre || "",
        r.ficha?.programa?.nombre || "",
        `${r.instructor?.nombres || ""} ${r.instructor?.apellidos || ""}`,
        r.fecha.toLocaleDateString("es-CO"),
        r.totalPresentes,
        r.totalFaltas,
        r.totalExcusas,
        r.estado,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    return { success: false, error: "Error al generar reporte de asistencia" };
  }
}

export async function getResumenReportes() {
  try {
    const [totalAprendices, alertasActivas, totalAsistencias, totalEvaluaciones] =
      await TransactionRepository.$transaction([
        AprendizRepository.count(),
        AlertaRiesgoRepository.count({ where: { gestionada: false } }),
        AsistenciaRepository.count(),
        EvaluacionAprendizRepository.count(),
      ]);

    revalidatePath("/reportes");
    return {
      success: true,
      data: { totalAprendices, alertasActivas, totalAsistencias, totalEvaluaciones },
    };
  } catch (error: any) {
    return { success: false, error: "Error al obtener resumen" };
  }
}

export async function exportAuditoriaCSV() {
  try {
    const logs = await AuditLogRepository.findMany({
      orderBy: { fecha: "desc" },
      include: {
        user: { select: { nombre: true, email: true } },
      },
    });

    const header = "Acción,Módulo,Detalle,Usuario,Email,Fecha,Hora";
    const rows = logs.map((log) =>
      [
        log.accion,
        log.modulo,
        log.detalle ?? "",
        log.user?.nombre ?? "Sistema",
        log.user?.email ?? "—",
        log.fecha ? new Date(log.fecha).toLocaleDateString("es-CO") : "",
        log.fecha ? new Date(log.fecha).toLocaleTimeString("es-CO") : "",
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting auditoria:", error);
    return { success: false, error: "Error al generar reporte de auditoría" };
  }
}
