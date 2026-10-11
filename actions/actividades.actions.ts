"use server";

import { UserRepository } from "@/repositories/user.repository";
import { ActividadRepository } from "@/repositories/actividad.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";

import { actividadSchema } from "@/schemas";
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
import { sendEmail } from "@/lib/mail";
import { getActividadEmailTemplate } from "@/lib/email-templates";

export async function getActividadesAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    // Obtener sesión actual para filtro de ámbito
    const session = await getServerSession();
    let userContext: any = null;
    if (session?.user?.email) {
      userContext = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { instructor: true, aprendiz: true }
      });
    }

    const rolNombre = userContext?.rol?.toUpperCase() || "";
    let fichaFiltro = filtros.fichaId;

    // Si es Aprendiz, solo puede ver actividades de su ficha y publicadas
    const isAprendiz = rolNombre.includes("APRENDIZ");
    if (isAprendiz && userContext?.aprendiz?.fichaId) {
      fichaFiltro = userContext.aprendiz.fichaId;
    }

    // Si es Instructor, solo ve las actividades que él mismo ha creado
    const isInstructor = rolNombre.includes("INSTRUCT");

    if (isInstructor && !userContext?.instructor?.id) {
      // Si es instructor pero no tiene registro, retornar lista vacía
      return { success: true, data: paginatedResponse([], 0, pagina, tamano) };
    }

    const isAdminOrCoordRegional = rolNombre === "ADMINISTRADOR" || rolNombre === "COORDINADOR_REGIONAL" || rolNombre.includes("ADMIN") || rolNombre.includes("REGIONAL");
    const isCoordAcademico = rolNombre === "COORDINADOR_ACADEMICO" || (rolNombre.includes("COORD") && !rolNombre.includes("SEDE"));
    const isCoordSede = rolNombre === "COORDINADOR_SEDE" || rolNombre.includes("SEDE");

    const baseFichaWhere: any = {};
    if (!isAdminOrCoordRegional && !isAprendiz && !isInstructor) {
      if (isCoordAcademico && userContext?.institucionId) {
        baseFichaWhere.institucionId = userContext.institucionId;
      }
      if (isCoordSede && userContext?.sedeId) {
        baseFichaWhere.sedeId = userContext.sedeId;
      }
    }

    if (filtros.institucionId) baseFichaWhere.institucionId = filtros.institucionId;
    if (isCoordSede && userContext?.sedeId) {
      baseFichaWhere.sedeId = userContext.sedeId;
    } else if (filtros.sedeId) {
      baseFichaWhere.sedeId = filtros.sedeId;
    }
    if (filtros.programaId) baseFichaWhere.programaId = filtros.programaId;

    const where: any = {
      ...(filtros.busqueda ? {
        OR: [
          { nombre: { contains: filtros.busqueda } },
          { descripcion: { contains: filtros.busqueda } },
        ]
      } : {}),
      ...(fichaFiltro ? { fichaId: fichaFiltro } : {}),
      ...(isAprendiz ? { estado: { in: ["ACTIVA", "PUBLICADA"] } } : {}),
      ...(isInstructor ? { instructorId: userContext.instructor.id } : (filtros.instructorId ? { instructorId: filtros.instructorId } : {})),
      ...(Object.keys(baseFichaWhere).length > 0 ? { ficha: baseFichaWhere } : {}),
    };

    const [data, total] = await TransactionRepository.$transaction([
      ActividadRepository.findMany({
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
          instructor: {
            select: { nombres: true, apellidos: true }
          },
          resultadoAprendizaje: {
            select: { codigo: true, nombre: true, competencia: { select: { codigo: true, nombre: true } } }
          },
          entregas: isAprendiz && userContext?.aprendiz ? {
            where: { aprendizId: userContext.aprendiz.id },
            select: { id: true, estado: true, calificacion: true, fechaEntrega: true, retroalimentacion: true }
          } : false,
          _count: { select: { entregas: true } }
        },
        orderBy: { fechaVencimiento: "desc" },
      }),
      ActividadRepository.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching actividades:", error);
    return { success: false, error: error.message || "Error al obtener actividades" };
  }
}

export async function createActividad(data: z.infer<typeof actividadSchema>) {
  try {
    const parsed = actividadSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    
    // Obtener instructor vinculado si el usuario es un instructor
    const instructorRecord = await prisma.instructor.findUnique({
      where: { userId: user.id }
    });

    const instructorId = instructorRecord?.id || data.instructorId || null;
    const estadoActividad = data.estado || "PUBLICADA";

    const actividad = await ActividadRepository.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        instrucciones: data.instrucciones || null,
        tipo: (data.tipo as any) || "TALLER",
        fichaId: data.fichaId,
        instructorId,
        resultadoAprendizajeId: data.resultadoAprendizajeId || null,

        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : new Date(),
        fechaVencimiento: new Date((data.fechaFin || data.fechaVencimiento) as string | number | Date),
        estado: estadoActividad as any,
      },
    });

    await logAudit({
      userId: user.id,
      modulo: "Actividades",
      accion: "CREAR",
      detalle: `Actividad creada: "${data.nombre}" para ficha ${data.fichaId}`,
    });

    // Notificar dinámicamente a todos los aprendices en formación de la ficha si está activa o publicada
    if (estadoActividad === "PUBLICADA" || estadoActividad === "ACTIVA") {
      try {
        const aprendices = await prisma.aprendiz.findMany({
          where: { fichaId: data.fichaId, estado: "EN_FORMACION" },
          select: {
            userId: true,
            nombres: true,
            emailPersonal: true,
            emailSena: true,
            user: { select: { email: true } },
          }
        });

        const [fichaInfo, instructorInfo, rapInfo] = await Promise.all([
          prisma.ficha.findUnique({ where: { id: data.fichaId }, select: { codigo: true } }),
          instructorId
            ? prisma.instructor.findUnique({ where: { id: instructorId }, select: { nombres: true, apellidos: true } })
            : Promise.resolve(null),
          data.resultadoAprendizajeId
            ? prisma.resultadoAprendizaje.findUnique({ where: { id: data.resultadoAprendizajeId }, select: { nombre: true } })
            : Promise.resolve(null),
        ]);

        const fechaVenceFormatted = new Date((data.fechaFin || data.fechaVencimiento) as string | number | Date).toLocaleDateString("es-CO");
        for (const ap of aprendices) {
          // Notificación in-app (el correo se envía abajo con la plantilla específica de actividad)
          if (ap.userId) {
            await crearNotificacionSistema(
              ap.userId,
              `Nueva actividad: ${data.nombre}`,
              `Se ha publicado la actividad "${data.nombre}". Fecha límite de entrega: ${fechaVenceFormatted}.`,
              "INFO",
              "/actividades",  // ← enlace para el aprendiz
              false
            );
          }

          // Correo al correo PERSONAL del aprendiz (respaldo: institucional / correo de cuenta)
          const destino = ap.emailPersonal || ap.emailSena || ap.user?.email;
          if (destino) {
            sendEmail({
              to: destino,
              subject: `Nueva actividad: ${data.nombre} - GSS`,
              html: getActividadEmailTemplate({
                aprendizNombre: ap.nombres,
                actividadNombre: data.nombre,
                descripcion: data.descripcion || null,
                instructorNombre: instructorInfo ? `${instructorInfo.nombres} ${instructorInfo.apellidos}` : null,
                fichaCodigo: fichaInfo?.codigo || null,
                rapNombre: rapInfo?.nombre || null,
                fechaVencimiento: fechaVenceFormatted,
                enlace: "/actividades",
              }),
            }).catch((err) => console.error(`Error enviando correo de actividad a ${destino}:`, err));
          } else {
            console.warn(`Aprendiz ${ap.nombres} no tiene correo registrado; no se envió el correo de la actividad.`);
          }
        }
      } catch (notifErr) {
        console.error("Error enviando notificaciones a aprendices:", notifErr);
      }
    }

    revalidatePath("/actividades");
    revalidatePath("/dashboard");
    return { success: true, actividad };
  } catch (error: any) {
    console.error("Error creating actividad:", error);
    return { error: error.message || "Error al crear actividad" };
  }
}

export async function updateActividad(id: string, data: z.infer<typeof actividadSchema>) {
  try {
    const parsed = actividadSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const actividad = await ActividadRepository.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        instrucciones: data.instrucciones || data.descripcion || null,
        tipo: data.tipo as any,
        fichaId: data.fichaId,
        resultadoAprendizajeId: data.resultadoAprendizajeId || null,
        ...(data.fechaInicio ? { fechaInicio: new Date(data.fechaInicio) } : {}),
        fechaVencimiento: new Date((data.fechaFin || data.fechaVencimiento) as string | number | Date),
        ...(data.estado ? { estado: data.estado as any } : {}),
      },
    });

    await logAudit({
      userId: user.id,
      modulo: "Actividades",
      accion: "ACTUALIZAR",
      detalle: `Actividad actualizada ID: ${id}`,
    });
    revalidatePath("/actividades");
    revalidatePath("/gestor-actividades");
    revalidatePath("/dashboard");
    return { success: true, actividad };
  } catch (error: any) {
    console.error("Error updating actividad:", error);
    return { error: error.message || "Error al actualizar actividad" };
  }
}

export async function deleteActividad(id: string) {
  try {
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    
    // Eliminar primero las entregas asociadas para evitar restricción de clave foránea
    await prisma.entrega.deleteMany({
      where: { actividadId: id }
    });

    await ActividadRepository.delete({ where: { id } });
    
    await logAudit({
      userId: user.id,
      modulo: "Actividades",
      accion: "ELIMINAR",
      detalle: `Actividad eliminada ID: ${id}`,
    });
    revalidatePath("/actividades");
    revalidatePath("/gestor-actividades");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting actividad:", error);
    return { error: error.message || "Error al eliminar actividad" };
  }
}

export async function exportActividadesCSV() {
  try {
    const session = await getServerSession();
    let whereClause: any = {};
    if (session?.user?.email) {
      const userRecord = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { rol: true, sedeId: true }
      });
      const roleUpper = userRecord?.rol?.toUpperCase() || "";
      if ((roleUpper === "COORDINADOR_SEDE" || (roleUpper.includes("COORD") && roleUpper.includes("SEDE"))) && userRecord?.sedeId) {
        whereClause.ficha = { sedeId: userRecord.sedeId };
      }
    }

    const actividades = await ActividadRepository.findMany({
      where: whereClause,
      orderBy: { fechaVencimiento: "desc" },
      include: {
        ficha: {
          select: {
            codigo: true,
            programa: { select: { nombre: true } },
            _count: { select: { aprendices: true } }
          }
        },
        _count: { select: { entregas: true } }
      },
    });

    const header = "Actividad,Tipo,Ficha,Programa,Fecha Vencimiento,Entregas,Total Aprendices";
    const rows = actividades.map((a) =>
      [
        a.nombre,
        a.tipo,
        a.ficha?.codigo ?? "",
        a.ficha?.programa?.nombre ?? "",
        a.fechaVencimiento ? new Date(a.fechaVencimiento).toLocaleDateString("es-CO") : "",
        a._count.entregas,
        a.ficha?._count?.aprendices ?? 0,
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting actividades:", error);
    return { success: false, error: "Error al generar reporte de actividades" };
  }
}

export async function getActividadesByFichaAction(fichaId: string) {
  try {
    const session = await getServerSession();
    if (session?.user?.email) {
      const userRecord = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { rol: true, sedeId: true }
      });
      const roleUpper = userRecord?.rol?.toUpperCase() || "";
      if ((roleUpper === "COORDINADOR_SEDE" || (roleUpper.includes("COORD") && roleUpper.includes("SEDE"))) && userRecord?.sedeId) {
        const ficha = await prisma.ficha.findUnique({ where: { id: fichaId }, select: { sedeId: true } });
        if (ficha && ficha.sedeId && ficha.sedeId !== userRecord.sedeId) {
          return { success: false, error: "Esta ficha no pertenece a tu sede asignada." };
        }
      }
    }

    const actividades = await prisma.actividad.findMany({
      where: { fichaId },
      include: {
        resultadoAprendizaje: {
          include: {
            competencia: true
          }
        },
        entregas: {
          include: {
            aprendiz: {
              include: { user: true }
            }
          }
        }
      },
      orderBy: { fechaVencimiento: "desc" }
    });
    return { success: true, data: actividades };
  } catch (error: any) {
    return { success: false, error: "Error al cargar actividades" };
  }
}
