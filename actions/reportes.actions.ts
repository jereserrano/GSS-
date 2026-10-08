"use server";

import { AuditLogRepository } from "@/repositories/auditLog.repository";
import { AprendizRepository } from "@/repositories/aprendiz.repository";
import { AlertaRiesgoRepository } from "@/repositories/alertaRiesgo.repository";
import { AsistenciaRepository } from "@/repositories/asistencia.repository";
import { EvaluacionAprendizRepository } from "@/repositories/evaluacionAprendiz.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Registra un evento de auditoría en la base de datos.
 * Se llama desde Server Actions críticas (crear, editar, eliminar).
 */
export async function logAudit(data: {
  accion: string;
  modulo: string;
  descripcion?: string;
  entidad?: string;
  entidadId?: string;
  usuarioId?: string | null;
  valoresAnteriores?: any;
  valoresNuevos?: any;
}) {
  try {
    await AuditLogRepository.create({
      data: {
        accion: data.accion,
        modulo: data.modulo,
        detalle: data.descripcion || `${data.accion} en ${data.modulo}`,
        userId: data.usuarioId || null,
        entidad: data.entidad ?? null,
        entidadId: data.entidadId ?? null,
        valoresAnteriores: data.valoresAnteriores ? JSON.parse(JSON.stringify(data.valoresAnteriores)) : null,
        valoresNuevos: data.valoresNuevos ? JSON.parse(JSON.stringify(data.valoresNuevos)) : null,
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

/** Helper para obtener las fichas permitidas del usuario actual */
async function getReporteFichaIds() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("No autenticado");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { instructor: true } });
  if (!user) throw new Error("Usuario no encontrado");
  
  const rol = user.rol?.toUpperCase() || "";
  if (rol === "INSTRUCTOR" && user.instructor) {
    const fichas = await prisma.instructorFicha.findMany({ where: { instructorId: user.instructor.id } });
    return { restricted: true, ids: fichas.map(f => f.fichaId), userId: user.id };
  }
  return { restricted: false, ids: [], userId: user.id };
}

/** Genera datos para un reporte y lo devuelve como CSV string */
export async function generarReporteAprendicesCSV(filtros?: { fichaId?: string }) {
  try {
    const auth = await getReporteFichaIds();
    const whereClause: any = {};
    
    if (filtros?.fichaId && filtros.fichaId !== "all") {
      if (auth.restricted && !auth.ids.includes(filtros.fichaId)) throw new Error("No tienes acceso a esta ficha");
      whereClause.fichaId = filtros.fichaId;
    } else if (auth.restricted) {
      whereClause.fichaId = { in: auth.ids };
    }

    const aprendices = await AprendizRepository.findMany({
      where: whereClause,
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

    const header = "Documento;Nombres;Apellidos;Estado;Nivel Riesgo;% Asistencia;Ficha;Programa;Institución";
    const rows = aprendices.map((a) =>
      [
        a.numeroDocumento,
        a.nombres,
        a.apellidos,
        a.estado,
        a.nivelRiesgo,
        a.porcentajeAsistencia.toFixed(1).replace(".", ","),
        a.ficha?.codigo || "",
        a.ficha?.programa?.nombre || "",
        a.ficha?.institucion?.nombre || "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(";")
    );

    const csvContent = "\uFEFF" + [header, ...rows].join("\n");

    await logAudit({
      accion: "EXPORTAR",
      modulo: "REPORTES",
      descripcion: `Descargó reporte de Aprendices (${aprendices.length} registros)`,
      usuarioId: auth.userId,
    });

    return { success: true, csv: csvContent };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al generar reporte" };
  }
}

export async function generarReporteRiesgosCSV(filtros?: { fichaId?: string }) {
  try {
    const auth = await getReporteFichaIds();
    const whereClause: any = {};

    if (filtros?.fichaId && filtros.fichaId !== "all") {
      if (auth.restricted && !auth.ids.includes(filtros.fichaId)) throw new Error("No tienes acceso a esta ficha");
      whereClause.aprendiz = { fichaId: filtros.fichaId };
    } else if (auth.restricted) {
      whereClause.aprendiz = { fichaId: { in: auth.ids } };
    }

    const alertas = await AlertaRiesgoRepository.findMany({
      where: whereClause,
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

    const header = "Documento;Aprendiz;Ficha;Institución;Motivo;Nivel;Fecha;Gestionada;Observaciones";
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
        .join(";")
    );

    const csvContent = "\uFEFF" + [header, ...rows].join("\n");

    await logAudit({
      accion: "EXPORTAR",
      modulo: "REPORTES",
      descripcion: `Descargó reporte de Riesgos (${alertas.length} registros)`,
      usuarioId: auth.userId,
    });

    return { success: true, csv: csvContent };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al generar reporte" };
  }
}

export async function generarReporteAsistenciaCSV(filtros?: { fichaId?: string, fechaInicio?: string, fechaFin?: string }) {
  try {
    const auth = await getReporteFichaIds();
    let whereClause: any = {};
    
    if (filtros?.fichaId && filtros.fichaId !== "all") {
      if (auth.restricted && !auth.ids.includes(filtros.fichaId)) throw new Error("No tienes acceso a esta ficha");
      whereClause.fichaId = filtros.fichaId;
    } else if (auth.restricted) {
      whereClause.fichaId = { in: auth.ids };
    }
    if (filtros?.fechaInicio || filtros?.fechaFin) {
      whereClause.fecha = {};
      if (filtros.fechaInicio) whereClause.fecha.gte = new Date(filtros.fechaInicio);
      if (filtros.fechaFin) whereClause.fecha.lte = new Date(filtros.fechaFin);
    }

    const registros = await AsistenciaRepository.findMany({
      where: whereClause,
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

    const header = "Ficha;Institución;Programa;Instructor;Fecha;Presentes;Faltas;Excusas;Estado";
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
        .join(";")
    );

    const csvContent = "\uFEFF" + [header, ...rows].join("\n");

    await logAudit({
      accion: "EXPORTAR",
      modulo: "REPORTES",
      descripcion: `Descargó reporte de Asistencia (${registros.length} registros)`,
      usuarioId: auth.userId,
    });

    return { success: true, csv: csvContent };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al generar reporte de asistencia" };
  }
}

export async function generarReporteEvaluacionesCSV(filtros?: { fichaId?: string }) {
  try {
    const auth = await getReporteFichaIds();
    const whereClause: any = {};

    if (filtros?.fichaId && filtros.fichaId !== "all") {
      if (auth.restricted && !auth.ids.includes(filtros.fichaId)) throw new Error("No tienes acceso a esta ficha");
      whereClause.aprendiz = { fichaId: filtros.fichaId };
    } else if (auth.restricted) {
      whereClause.aprendiz = { fichaId: { in: auth.ids } };
    }

    const evaluaciones = await EvaluacionAprendizRepository.findMany({
      where: whereClause,
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

    const header = "Ficha;Institución;Documento;Aprendiz;Competencia;Resultado de Aprendizaje;Juicio Valorativo;Fecha Evaluación";
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
        .join(";")
    );

    const csvContent = "\uFEFF" + [header, ...rows].join("\n");

    await logAudit({
      accion: "EXPORTAR",
      modulo: "REPORTES",
      descripcion: `Descargó reporte de Evaluaciones (${evaluaciones.length} registros)`,
      usuarioId: auth.userId,
    });

    return { success: true, csv: csvContent };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al generar reporte de evaluaciones" };
  }
}

export async function getResumenReportes() {
  try {
    const session = await getServerSession(authOptions);
    let userRecord = null;
    if (session?.user?.email) {
      userRecord = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { instructor: true }
      });
    }

    const roleUpper = userRecord?.rol?.toUpperCase() || "";
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

export async function exportAuditoriaCSV(filtros?: { fechaInicio?: string, fechaFin?: string }) {
  try {
    let whereClause: any = {};
    if (filtros?.fechaInicio || filtros?.fechaFin) {
      whereClause.fecha = {};
      if (filtros.fechaInicio) whereClause.fecha.gte = new Date(filtros.fechaInicio);
      if (filtros.fechaFin) {
        const fin = new Date(filtros.fechaFin);
        fin.setHours(23, 59, 59, 999);
        whereClause.fecha.lte = fin;
      }
    }

    const logs = await AuditLogRepository.findMany({
      where: whereClause,
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
        include: { instructor: true }
      });
    }

    const roleUpper = userRecord?.rol?.toUpperCase() || "";
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
