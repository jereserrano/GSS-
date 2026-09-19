"use server";

import { AuditLogRepository } from "@/repositories/auditLog.repository";
import { AprendizRepository } from "@/repositories/aprendiz.repository";
import { AlertaRiesgoRepository } from "@/repositories/alertaRiesgo.repository";
import { AsistenciaRepository } from "@/repositories/asistencia.repository";
import { EvaluacionAprendizRepository } from "@/repositories/evaluacionAprendiz.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

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

export async function generarReporteEvaluacionesCSV() {
  try {
    const evaluaciones = await EvaluacionAprendizRepository.findMany({
      include: {
        aprendiz: {
          select: {
            nombres: true,
            apellidos: true,
            numeroDocumento: true,
            ficha: {
              select: { codigo: true, institucion: { select: { nombre: true } } }
            }
          }
        },
        resultadoAprendizaje: {
          select: {
            nombre: true,
            codigo: true,
            competencia: { select: { nombre: true, codigo: true } }
          }
        }
      },
      orderBy: [{ aprendiz: { ficha: { codigo: "asc" } } }, { aprendiz: { apellidos: "asc" } }],
    });

    const header = "Ficha,Institución,Documento,Aprendiz,Competencia,Resultado de Aprendizaje,Juicio Valorativo,Fecha Evaluación";
    const rows = evaluaciones.map((e) =>
      [
        e.aprendiz?.ficha?.codigo || "",
        e.aprendiz?.ficha?.institucion?.nombre || "",
        e.aprendiz?.numeroDocumento || "",
        `${e.aprendiz?.nombres || ""} ${e.aprendiz?.apellidos || ""}`,
        `[${e.resultadoAprendizaje?.competencia?.codigo}] ${e.resultadoAprendizaje?.competencia?.nombre}`,
        `[${e.resultadoAprendizaje?.codigo}] ${e.resultadoAprendizaje?.nombre}`,
        e.juicio,
        e.fecha ? new Date(e.fecha).toLocaleDateString("es-CO") : "Pendiente",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    return { success: false, error: "Error al generar reporte de evaluaciones" };
  }
}

export async function getResumenReportes() {
  try {
    const session = await getServerSession(authOptions);
    let userRecord = null;
    if (session?.user?.email) {
      userRecord = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { rol: true, instructor: true }
      });
    }

    const roleUpper = userRecord?.rol?.nombre?.toUpperCase() || "";
    const isInstructor = roleUpper.includes("INSTRUCT") && userRecord?.instructor?.id;
    
    let aprendizWhere: any = {};
    let alertaWhere: any = { gestionada: false };
    let asistenciaWhere: any = {};
    let evaluacionWhere: any = {};

    if (isInstructor) {
      const fichaIds = (await prisma.instructorFicha.findMany({
        where: { instructorId: userRecord!.instructor!.id },
        select: { fichaId: true }
      })).map(f => f.fichaId);

      aprendizWhere = { fichaId: { in: fichaIds } };
      alertaWhere = { gestionada: false, aprendiz: { fichaId: { in: fichaIds } } };
      asistenciaWhere = { fichaId: { in: fichaIds } };
      evaluacionWhere = { aprendiz: { fichaId: { in: fichaIds } } };
    }

    const [totalAprendices, alertasActivas, totalAsistencias, totalEvaluaciones] =
      await TransactionRepository.$transaction([
        AprendizRepository.count({ where: aprendizWhere }),
        AlertaRiesgoRepository.count({ where: alertaWhere }),
        AsistenciaRepository.count({ where: asistenciaWhere }),
        EvaluacionAprendizRepository.count({ where: evaluacionWhere }),
      ]);


    return {
      success: true,
      data: { totalAprendices, alertasActivas, totalAsistencias, totalEvaluaciones },
    };
  } catch (error: any) {
    console.error("DEBUG ERROR getResumenReportes:", error);
    return { success: false, error: "Error al obtener resumen: " + error.message };
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

export async function getReportesListadosAction() {
  try {
    const session = await getServerSession(authOptions);
    let userRecord = null;
    if (session?.user?.email) {
      userRecord = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { rol: true, instructor: true }
      });
    }

    const roleUpper = userRecord?.rol?.nombre?.toUpperCase() || "";
    const isInstructor = roleUpper.includes("INSTRUCT") && userRecord?.instructor?.id;
    
    let aprendizWhere: any = {};
    let alertaWhere: any = { gestionada: false };
    let asistenciaWhere: any = {};

    if (isInstructor) {
      const fichaIds = (await prisma.instructorFicha.findMany({
        where: { instructorId: userRecord!.instructor!.id },
        select: { fichaId: true }
      })).map(f => f.fichaId);

      aprendizWhere = { fichaId: { in: fichaIds } };
      alertaWhere = { gestionada: false, aprendiz: { fichaId: { in: fichaIds } } };
      asistenciaWhere = { fichaId: { in: fichaIds } };
    }

    const [aprendices, alertas, asistencias] = await TransactionRepository.$transaction([
      AprendizRepository.findMany({
        take: 50,
        where: aprendizWhere,
        orderBy: { apellidos: "asc" },
        include: { ficha: { include: { institucion: true } } },
      }),
      AlertaRiesgoRepository.findMany({
        take: 50,
        where: alertaWhere,
        orderBy: { fechaDeteccion: "desc" },
        include: { aprendiz: { include: { ficha: true } } },
      }),
      AsistenciaRepository.findMany({
        take: 50,
        where: asistenciaWhere,
        orderBy: { fecha: "desc" },
        include: { ficha: true },
      }),
    ]);
    return { success: true, data: { aprendices, alertas, asistencias } };
  } catch (error: any) {
    console.error("Error fetching report lists:", error);
    return { success: false, error: "Error al obtener listados para reportes" };
  }
}
