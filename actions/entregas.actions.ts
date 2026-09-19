"use server";

import { UserRepository } from "@/repositories/user.repository";
import { EntregaRepository } from "@/repositories/entrega.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";

import { entregaSchema } from "@/schemas";
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
import { prisma } from "@/lib/prisma";
import { crearNotificacionSistema } from "./notificaciones.actions";

export async function getEntregasAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    // Obtener sesión actual para filtro de ámbito y seguridad
    const session = await getServerSession();
    let userContext: any = null;
    if (session?.user?.email) {
      userContext = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { rol: true, instructor: true, aprendiz: true }
      });
    }

    const rolNombre = userContext?.rol?.nombre?.toUpperCase() || "";
    let aprendizFiltro = filtros.aprendizId;

    // Si es Aprendiz, estrictamente restringido a sus propias entregas (Anti-IDOR)
    if (rolNombre.includes("APRENDIZ")) {
      if (!userContext?.aprendiz?.id) {
        return { success: true, data: paginatedResponse([], 0, pagina, tamano) };
      }
      aprendizFiltro = userContext.aprendiz.id;
    }

    const where: any = {
      ...(filtros.busqueda ? {
        OR: [
          { aprendiz: { nombres: { contains: filtros.busqueda } } },
          { aprendiz: { apellidos: { contains: filtros.busqueda } } },
          { aprendiz: { numeroDocumento: { contains: filtros.busqueda } } },
          { actividad: { nombre: { contains: filtros.busqueda } } },
        ]
      } : {}),
      ...(filtros.actividadId ? { actividadId: filtros.actividadId } : {}),
      ...(aprendizFiltro ? { aprendizId: aprendizFiltro } : {}),
      ...(filtros.estado ? { estado: filtros.estado } : {}),
    };

    const [data, total] = await TransactionRepository.$transaction([
      EntregaRepository.findMany({
        where,
        skip,
        take,
        include: {
          aprendiz: { select: { id: true, nombres: true, apellidos: true, numeroDocumento: true, emailSena: true } },
          actividad: { 
            select: { 
              id: true,
              nombre: true, 
              fechaVencimiento: true,
              ficha: { select: { id: true, codigo: true } },
              instructor: { select: { nombres: true, apellidos: true } },
              resultadoAprendizaje: { select: { id: true, codigo: true, nombre: true } }
            } 
          },
          instructor: { select: { nombres: true, apellidos: true } }
        },
        orderBy: { fechaEntrega: "desc" },
      }),
      EntregaRepository.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching entregas:", error);
    return { success: false, error: error.message || "Error al obtener entregas" };
  }
}

export async function createEntrega(data: z.infer<typeof entregaSchema>) {
  try {
    const parsed = entregaSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR", "APRENDIZ"]);
    
    // Obtener contexto de aprendiz si el rol es APRENDIZ
    let aprendizId = data.aprendizId;
    const isAprendiz = user.rol.nombre.toUpperCase().includes("APRENDIZ");
    if (isAprendiz) {
      const aprendizRecord = await prisma.aprendiz.findUnique({
        where: { userId: user.id }
      });
      if (!aprendizRecord) {
        return { error: "No se encontró el registro de aprendiz vinculado a tu cuenta." };
      }
      aprendizId = aprendizRecord.id; // Protección Anti-IDOR
    }

    // Verificar si ya existe una entrega previa
    const existing = await EntregaRepository.findUnique({
      where: {
        actividadId_aprendizId: {
          actividadId: data.actividadId,
          aprendizId: aprendizId
        }
      }
    });

    let entrega: any;
    if (existing) {
      if (existing.estado === "APROBADA") {
        return { error: "Esta actividad ya fue APROBADA y no requiere un nuevo envío de evidencias." };
      }

      // Reentrega / Actualización de evidencia
      entrega = await EntregaRepository.update({
        where: { id: existing.id },
        data: {
          urlArchivo: data.urlArchivo || existing.urlArchivo,
          comentario: data.comentario || existing.comentario,
          fechaEntrega: new Date(),
          estado: "PENDIENTE",
          calificacion: null,
          retroalimentacion: null,
          fechaEvaluacion: null,
        },
        include: {
          actividad: { include: { ficha: true, instructor: true } },
          aprendiz: true
        }
      });
    } else {
      const initialEstado = isAprendiz ? "PENDIENTE" : (data.estado || "PENDIENTE");
      const initialCalificacion = isAprendiz ? null : (data.calificacion || null);
      const initialRetro = isAprendiz ? null : (data.retroalimentacion || null);

      entrega = await EntregaRepository.create({
        data: {
          actividadId: data.actividadId,
          aprendizId: aprendizId,
          urlArchivo: data.urlArchivo || null,
          comentario: data.comentario || null,
          estado: initialEstado,
          fechaEntrega: data.fechaEntrega ? new Date(data.fechaEntrega) : new Date(),
          calificacion: initialCalificacion,
          retroalimentacion: initialRetro,
        },
        include: {
          actividad: { include: { ficha: true, instructor: true } },
          aprendiz: true
        }
      });
    }

    await logAudit({
      userId: user.id,
      modulo: "Entregas",
      accion: existing ? "ACTUALIZAR" : "CREAR",
      detalle: `Entrega de actividad ID ${data.actividadId} por aprendiz ID ${aprendizId}`,
    });

    // Notificar al instructor responsable de la actividad
    try {
      const actividad = entrega.actividad;
      const instructorUserId = actividad?.instructor?.userId;
      if (instructorUserId) {
        await crearNotificacionSistema(
          instructorUserId,
          `Nueva evidencia entregada: ${actividad.nombre}`,
          `El aprendiz ${entrega.aprendiz.nombres} ${entrega.aprendiz.apellidos} ha enviado su evidencia para "${actividad.nombre}".`,
          "INFO"
        );
      }
    } catch (notifErr) {
      console.error("Error notificando al instructor:", notifErr);
    }

    revalidatePath("/entregas");
    revalidatePath("/actividades");
    revalidatePath("/dashboard");
    return { success: true, entrega };
  } catch (error: any) {
    console.error("Error creating entrega:", error);
    return { error: error.message || "Error al registrar la entrega" };
  }
}

export async function evaluarEntregaAction(
  id: string,
  evaluacionData: {
    estado: "APROBADA" | "NO_APROBADA" | "CALIFICADA";
    calificacion?: string;
    retroalimentacion?: string;
  }
) {
  try {
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);

    const instructorRecord = await prisma.instructor.findUnique({
      where: { userId: user.id }
    });

    const entrega = await EntregaRepository.update({
      where: { id },
      data: {
        estado: evaluacionData.estado,
        calificacion: evaluacionData.calificacion || null,
        retroalimentacion: evaluacionData.retroalimentacion || null,
        instructorId: instructorRecord?.id || null,
        fechaEvaluacion: new Date(),
      },
      include: {
        actividad: {
          select: {
            id: true,
            nombre: true,
            resultadoAprendizajeId: true,
          }
        },
        aprendiz: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            userId: true,
          }
        }
      }
    });

    // Sincronizar automáticamente con EvaluacionAprendiz si la actividad está asociada a un RAP
    if (entrega.actividad?.resultadoAprendizajeId) {
      const rapId = entrega.actividad.resultadoAprendizajeId;
      const juicio = evaluacionData.estado === "APROBADA" ? "APROBADO" : "DEFICIENTE";

      const evalExistente = await prisma.evaluacionAprendiz.findFirst({
        where: {
          resultadoAprendizajeId: rapId,
          aprendizId: entrega.aprendiz.id
        }
      });

      if (evalExistente) {
        await prisma.evaluacionAprendiz.update({
          where: { id: evalExistente.id },
          data: {
            juicio,
            fecha: new Date(),
            observaciones: evaluacionData.retroalimentacion || evalExistente.observaciones,
          }
        });
      } else {
        await prisma.evaluacionAprendiz.create({
          data: {
            resultadoAprendizajeId: rapId,
            aprendizId: entrega.aprendiz.id,
            juicio,
            fecha: new Date(),
            observaciones: evaluacionData.retroalimentacion || null,
          }
        });
      }
    }

    await logAudit({
      userId: user.id,
      modulo: "Entregas",
      accion: "ACTUALIZAR",
      detalle: `Evaluación registrada para entrega ID: ${id}, Juicio: ${evaluacionData.estado}`,
    });

    // Notificar dinámicamente al aprendiz con el resultado
    if (entrega.aprendiz?.userId) {
      try {
        const estadoEtiqueta = evaluacionData.estado === "APROBADA" ? "APROBADA ✅" : 
                               evaluacionData.estado === "NO_APROBADA" ? "NO APROBADA ⚠️" : "CALIFICADA 📝";
        await crearNotificacionSistema(
          entrega.aprendiz.userId,
          `Tu entrega ha sido evaluada: ${entrega.actividad.nombre}`,
          `Resultado: ${estadoEtiqueta}. Retroalimentación del instructor: ${evaluacionData.retroalimentacion || "Sin comentarios."}`,
          evaluacionData.estado === "APROBADA" ? "EXITO" : "ALERTA",
          "/actividades"
        );
      } catch (notifErr) {
        console.error("Error enviando notificación al aprendiz:", notifErr);
      }
    }

    revalidatePath("/entregas");
    revalidatePath("/evaluaciones");
    revalidatePath("/actividades");
    revalidatePath("/resultados");
    revalidatePath("/dashboard");
    return { success: true, entrega };
  } catch (error: any) {
    console.error("Error evaluando entrega:", error);
    return { error: error.message || "Error al evaluar entrega" };
  }
}

export async function updateEntrega(id: string, data: z.infer<typeof entregaSchema>) {
  try {
    const parsed = entregaSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const dataToUpdate: any = {
      estado: data.estado,
      calificacion: data.calificacion || null,
      comentario: data.comentario || null,
      retroalimentacion: data.retroalimentacion || null,
    };
    if (data.fechaEntrega) dataToUpdate.fechaEntrega = new Date(data.fechaEntrega);

    const entrega = await EntregaRepository.update({
      where: { id },
      data: dataToUpdate,
    });

    await logAudit({
      userId: user.id,
      modulo: "Entregas",
      accion: "ACTUALIZAR",
      detalle: `Entrega actualizada ID: ${id}`,
    });
    revalidatePath("/entregas");
    revalidatePath("/dashboard");
    return { success: true, entrega };
  } catch (error: any) {
    console.error("Error updating entrega:", error);
    return { error: error.message || "Error al actualizar entrega" };
  }
}

export async function deleteEntrega(id: string) {
  try {
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    await EntregaRepository.delete({ where: { id } });
    
    await logAudit({
      userId: user.id,
      modulo: "Entregas",
      accion: "ELIMINAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/entregas");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting entrega:", error);
    return { error: error.message || "Error al eliminar entrega" };
  }
}

export async function exportEntregasCSV() {
  try {
    const entregas = await EntregaRepository.findMany({
      orderBy: { fechaEntrega: "desc" },
      include: {
        aprendiz: { select: { nombres: true, apellidos: true, numeroDocumento: true } },
        actividad: { select: { nombre: true, fechaVencimiento: true } },
      },
    });

    const header = "Actividad,Fecha de Vencimiento,Aprendiz,Documento,Fecha de Entrega,Estado,Calificación";
    const rows = entregas.map((e) =>
      [
        e.actividad?.nombre ?? "",
        e.actividad?.fechaVencimiento ? new Date(e.actividad.fechaVencimiento).toLocaleDateString("es-CO") : "",
        `${e.aprendiz?.nombres ?? ""} ${e.aprendiz?.apellidos ?? ""}`,
        e.aprendiz?.numeroDocumento ?? "",
        e.fechaEntrega ? new Date(e.fechaEntrega).toLocaleDateString("es-CO") : "No entregado",
        e.estado,
        e.calificacion ?? "",
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting entregas:", error);
    return { success: false, error: "Error al generar reporte de entregas" };
  }
}
