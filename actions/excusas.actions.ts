"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { enviarMensajeAction } from "./mensajes.actions";
import { crearNotificacionSistema } from "./notificaciones.actions";
import { logAudit } from "@/lib/audit.service";
import { recalcularRiesgoAprendiz } from "@/services/riesgo.service";

// ─────────────────────────────────────────────
// ROLES CON PERMISO DE REVISAR EXCUSAS
// ─────────────────────────────────────────────
const ROLES_REVISORES = ["INSTRUCTOR", "ADMINISTRADOR", "COORDINADOR", "APOYO_COORDINACION"];

export async function getDestinatariosExcusaAction() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "APRENDIZ") return { success: false, data: [] };

    const aprendiz = await prisma.aprendiz.findUnique({
      where: { userId: session.user.id },
      include: {
        ficha: {
          include: { instructores: { include: { instructor: { include: { user: true } } } } },
        },
      },
    });

    const destinatarios = [];
    if (aprendiz?.ficha?.instructores) {
      for (const instFicha of aprendiz.ficha.instructores) {
        if (instFicha.instructor?.user) {
          destinatarios.push({
            id: instFicha.instructor.user.id,
            nombre: `${instFicha.instructor.user.nombre} (${instFicha.rolFicha === "LIDER_TECNICO" ? "Líder" : "Instructor"})`,
            role: "INSTRUCTOR",
          });
        }
      }
    }

    const apoyos = await prisma.user.findMany({ where: { rol: "APOYO_COORDINACION", estado: "ACTIVO" } });
    for (const apoyo of apoyos) {
      destinatarios.push({
        id: apoyo.id,
        nombre: `${apoyo.nombre} (Apoyo)`,
        role: "APOYO_COORDINACION",
      });
    }

    return { success: true, data: destinatarios };
  } catch (error) {
    return { success: false, error: "Error al cargar destinatarios" };
  }
}

// ─────────────────────────────────────────────
// CREAR EXCUSA (aprendiz)
// ─────────────────────────────────────────────
export async function crearExcusaAction(data: {
  motivo: string;
  descripcion?: string;
  archivoUrl?: string;
  fechaInicio: string;
  fechaFin: string;
  destinatarioId?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "APRENDIZ") {
      return { success: false, error: "No autorizado" };
    }

    // Buscar perfil aprendiz con su ficha e instructores
    const aprendiz = await prisma.aprendiz.findUnique({
      where: { userId: session.user.id },
      include: {
        ficha: {
          include: {
            instructores: {
              include: { instructor: { include: { user: { select: { id: true, nombre: true } } } } },
            },
          },
        },
      },
    });

    if (!aprendiz) {
      return { success: false, error: "No se encontró el perfil de aprendiz." };
    }

    // EX-2: Validar plazo máximo
    const config = await prisma.configuracionSistema.findFirst();
    const maxDias = config?.diasMaximoExcusa ?? 3;
    const diasDiferencia = Math.floor((new Date().getTime() - new Date(data.fechaFin).getTime()) / (1000 * 3600 * 24));
    if (diasDiferencia > maxDias) {
      return { success: false, error: `El plazo máximo para radicar esta excusa (${maxDias} días) ha vencido.` };
    }

    const excusa = await prisma.excusa.create({
      data: {
        aprendizId: aprendiz.id,
        motivo: data.motivo,
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.archivoUrl ? { archivoUrl: data.archivoUrl } : {}),
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: new Date(data.fechaFin),
        estado: "PENDIENTE",
      },
    });

    // ✨ EX-7: Notificar al destinatario específico o a los instructores
    let notificarIds: string[] = [];
    if (data.destinatarioId && data.destinatarioId !== "TODOS") {
      notificarIds = [data.destinatarioId];
    } else {
      notificarIds = aprendiz.ficha?.instructores
        ?.map((i) => i.instructor?.user?.id)
        .filter((id): id is string => !!id) || [];
      const apoyos = await prisma.user.findMany({ where: { rol: "APOYO_COORDINACION" }});
      notificarIds = [...notificarIds, ...apoyos.map(a => a.id)];
    }

    const nombreAprendiz = `${aprendiz.nombres} ${aprendiz.apellidos}`;
    const fichaCodigo = aprendiz.ficha?.codigo || "";

    await Promise.allSettled(
      notificarIds.map(async (userId) => {
        await crearNotificacionSistema(
          userId,
          `📋 Nueva excusa radicada`,
          `${nombreAprendiz} (Ficha ${fichaCodigo}) radicó una excusa por motivo: ${data.motivo}`,
          "INFO",
          "/gestor-excusas"
        );
        await enviarMensajeAction({
          receptorId: userId,
          contenido: `📋 *NUEVA EXCUSA RADICADA*\n\nHola. Te he enviado una excusa por el motivo: "${data.motivo}".\n\nPor favor, revísala en el Gestor de Excusas.`,
        });
      })
    );

    // EX-4: Auditoría
    await logAudit({
      userId: session.user.id,
      modulo: "EXCUSAS",
      accion: "CREAR",
      entidad: "Excusa",
      entidadId: excusa.id,
      detalle: `Aprendiz ${nombreAprendiz} radicó excusa por "${data.motivo}" para fechas ${data.fechaInicio} al ${data.fechaFin}`,
    });

    revalidatePath("/mis-excusas");
    revalidatePath("/gestor-excusas");
    return { success: true, data: excusa };
  } catch (error: any) {
    console.error("Error al crear excusa:", error);
    return { success: false, error: "Error al crear la excusa." };
  }
}

// ─────────────────────────────────────────────
// OBTENER EXCUSAS SEGÚN ROL
// ─────────────────────────────────────────────
export async function getExcusasPorRolAction() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "No autorizado" };

    const rol = session.user.role;
    const userId = session.user.id;

    // ── APRENDIZ: solo sus propias excusas
    if (rol === "APRENDIZ") {
      const aprendiz = await prisma.aprendiz.findUnique({ where: { userId } });
      if (!aprendiz) return { success: true, data: [] };
      const excusas = await prisma.excusa.findMany({
        where: { aprendizId: aprendiz.id },
        orderBy: { fecha: "desc" },
        include: {
          instructorRevisor: { include: { user: { select: { nombre: true } } } },
        },
      });
      return { success: true, data: excusas };
    }

    // ── INSTRUCTOR: excusas de aprendices de su ficha
    // FIX BUG-01: Aprendiz tiene fichaId directo (no fichas[])
    if (rol === "INSTRUCTOR") {
      // Obtener fichas del instructor
      const instructorFichas = await prisma.instructorFicha.findMany({
        where: { instructor: { userId } },
        select: { fichaId: true },
      });
      const fichaIds = instructorFichas.map((f) => f.fichaId);

      const excusas = await prisma.excusa.findMany({
        where: {
          aprendiz: { fichaId: { in: fichaIds } },
        },
        orderBy: { fecha: "desc" },
        include: {
          aprendiz: {
            include: {
              ficha: { select: { codigo: true, programa: { select: { nombre: true } } } },
              user: { select: { nombre: true, email: true } },
            },
          },
          instructorRevisor: { include: { user: { select: { nombre: true } } } },
        },
      });
      return { success: true, data: excusas };
    }

    // ── APOYO_COORDINACION: excusas de aprendices de fichas de su sede
    // FIX BUG-03: Sede no tiene relación "personal" — se busca por sedeId del User
    if (rol === "APOYO_COORDINACION") {
      const userApoyo = await prisma.user.findUnique({ where: { id: userId } });

      if (!userApoyo?.sedeId) {
        return { success: true, data: [] };
      }

      // Fichas de esa sede
      const fichasDeSede = await prisma.ficha.findMany({
        where: { sedeId: userApoyo.sedeId },
        select: { id: true },
      });
      const fichaIds = fichasDeSede.map((f) => f.id);

      const excusas = await prisma.excusa.findMany({
        where: {
          aprendiz: { fichaId: { in: fichaIds } },
        },
        orderBy: { fecha: "desc" },
        include: {
          aprendiz: {
            include: {
              ficha: { select: { codigo: true, programa: { select: { nombre: true } } } },
              user: { select: { nombre: true, email: true } },
            },
          },
          instructorRevisor: { include: { user: { select: { nombre: true } } } },
        },
      });
      return { success: true, data: excusas };
    }

    // ── ADMIN / COORDINADOR: todas las excusas
    const excusas = await prisma.excusa.findMany({
      orderBy: { fecha: "desc" },
      include: {
        aprendiz: {
          include: {
            ficha: { select: { codigo: true, programa: { select: { nombre: true } } } },
            user: { select: { nombre: true, email: true } },
          },
        },
        instructorRevisor: { include: { user: { select: { nombre: true } } } },
      },
    });
    return { success: true, data: excusas };
  } catch (error: any) {
    console.error("Error al obtener excusas:", error);
    return { success: false, error: "Error al obtener las excusas." };
  }
}

// ─────────────────────────────────────────────
// RESPONDER EXCUSA (instructor / coord / apoyo)
// ─────────────────────────────────────────────
export async function responderExcusaAction(
  excusaId: string,
  estado: "APROBADA" | "RECHAZADA",
  observacion: string
) {
  try {
    const session = await getServerSession(authOptions);

    // FIX BUG-02: Ampliar roles que pueden responder excusas
    if (!session || !ROLES_REVISORES.includes(session.user.role)) {
      return { success: false, error: "No autorizado" };
    }

    const excusaActual = await prisma.excusa.findUnique({
      where: { id: excusaId },
      include: {
        aprendiz: {
          include: {
            ficha: {
              include: {
                asistencias: {
                  include: { detalles: true },
                },
              },
            },
          },
        },
      },
    });

    if (!excusaActual) return { success: false, error: "Excusa no encontrada" };

    // Resolver el instructor revisor solo si el rol es INSTRUCTOR
    let instructorConnect: any = undefined;
    if (session.user.role === "INSTRUCTOR") {
      const instructor = await prisma.instructor.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (instructor) {
        instructorConnect = { connect: { id: instructor.id } };
      }
    }

    const updateData: any = {
      estado,
      observacionInstructor: observacion,
    };
    if (instructorConnect) {
      updateData.instructorRevisor = instructorConnect;
    }

    const update = await prisma.excusa.update({
      where: { id: excusaId },
      data: updateData,
    });

    // ✨ EX-3: Si se APRUEBA, actualizar automáticamente la asistencia del aprendiz
    if (estado === "APROBADA" && excusaActual.fechaInicio && excusaActual.fechaFin) {
      await actualizarAsistenciaPorExcusa(
        excusaActual.aprendizId,
        excusaActual.aprendiz.fichaId,
        excusaActual.fechaInicio,
        excusaActual.fechaFin
      );
      
      // Disparar cálculo de riesgo en segundo plano (Fire and Forget)
      recalcularRiesgoAprendiz(excusaActual.aprendizId).catch(console.error);
    }

    // Notificación al aprendiz por mensaje y campana
    const receptorUserId = excusaActual.aprendiz.userId;
    if (receptorUserId) {
      const estadoTexto = estado === "APROBADA" ? "✅ aprobada" : "❌ rechazada";
      const contenidoMsg = `Tu excusa por motivo "${excusaActual.motivo}" ha sido ${estadoTexto}.\n\nObservaciones:\n${observacion}`;

      await Promise.allSettled([
        enviarMensajeAction({ receptorId: receptorUserId, contenido: contenidoMsg }),
        crearNotificacionSistema(
          receptorUserId,
          `Excusa ${estado === "APROBADA" ? "aprobada ✅" : "rechazada ❌"}`,
          `Tu excusa por "${excusaActual.motivo}" fue ${estado.toLowerCase()}.`,
          estado === "APROBADA" ? "INFO" : "WARNING",
          "/mis-excusas"
        ),
      ]);
    }

    // EX-4: Auditoría
    await logAudit({
      userId: session.user.id,
      modulo: "EXCUSAS",
      accion: "ACTUALIZAR",
      entidad: "Excusa",
      entidadId: excusaId,
      detalle: `Excusa ${estado} por ${session.user.name || session.user.id}. Observación: ${observacion}`,
      valoresNuevos: { estado, observacionInstructor: observacion },
    });

    revalidatePath("/gestor-excusas");
    revalidatePath("/mis-excusas");
    revalidatePath("/asistencia");
    return { success: true, data: update };
  } catch (error: any) {
    console.error("Error al responder excusa:", error);
    return { success: false, error: "Error al responder la excusa." };
  }
}

// ─────────────────────────────────────────────
// HELPER INTERNO: EX-3 — Actualizar asistencia al aprobar excusa
// ─────────────────────────────────────────────
async function actualizarAsistenciaPorExcusa(
  aprendizId: string,
  fichaId: string,
  fechaInicio: Date,
  fechaFin: Date
) {
  try {
    // Buscar todas las asistencias de la ficha en el rango de fechas de la excusa
    const asistenciasEnRango = await prisma.asistencia.findMany({
      where: {
        fichaId,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      include: {
        detalles: {
          where: { aprendizId, estado: "FALLA" },
        },
      },
    });

    for (const asistencia of asistenciasEnRango) {
      const registrosParaCambiar = asistencia.detalles.filter(
        (d) => d.estado === "FALLA"
      );

      if (registrosParaCambiar.length === 0) continue;

      // Actualizar cada registro de FALLA → EXCUSA
      await Promise.all(
        registrosParaCambiar.map((registro) =>
          prisma.registroAsistencia.update({
            where: { id: registro.id },
            data: { estado: "EXCUSA" },
          })
        )
      );

      // Recalcular totales en la tabla Asistencia
      const cantidadCambiados = registrosParaCambiar.length;
      await prisma.asistencia.update({
        where: { id: asistencia.id },
        data: {
          totalFaltas: { decrement: cantidadCambiados },
          totalExcusas: { increment: cantidadCambiados },
        },
      });
    }
  } catch (err) {
    // No bloquea el flujo principal si la asistencia falla
    console.error("Error actualizando asistencia por excusa:", err);
  }
}

// ─────────────────────────────────────────────
// EX-5: APELAR EXCUSA RECHAZADA (Aprendiz)
// ─────────────────────────────────────────────
export async function apelarExcusaAction(excusaId: string, textoApelacion: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "APRENDIZ") return { success: false, error: "No autorizado" };

    const excusa = await prisma.excusa.findUnique({
      where: { id: excusaId },
      include: { 
        aprendiz: { select: { userId: true, nombres: true, apellidos: true } },
        instructorRevisor: { select: { userId: true } }
      },
    });

    if (!excusa) return { success: false, error: "Excusa no encontrada" };
    if (excusa.aprendiz.userId !== session.user.id) return { success: false, error: "No es tu excusa" };
    if (excusa.estado !== "RECHAZADA") return { success: false, error: "Solo puedes apelar excusas rechazadas" };

    const update = await prisma.excusa.update({
      where: { id: excusaId },
      data: {
        estado: "APELADA",
        apelacion: textoApelacion,
      },
    });

    // Notificar al instructor que rechazó la excusa
    if (excusa.instructorRevisor?.userId) {
      const nombreAprendiz = `${excusa.aprendiz.nombres} ${excusa.aprendiz.apellidos}`;
      await Promise.allSettled([
        crearNotificacionSistema(
          excusa.instructorRevisor.userId,
          `⚠️ Apelación de Excusa`,
          `${nombreAprendiz} apeló el rechazo de su excusa. Argumento: ${textoApelacion}`,
          "WARNING",
          "/gestor-excusas"
        ),
        enviarMensajeAction({
          receptorId: excusa.instructorRevisor.userId,
          contenido: `⚖️ *APELACIÓN DE EXCUSA*\n\nHola. He apelado tu rechazo de mi excusa. Mi argumento es el siguiente:\n\n"${textoApelacion}"\n\nPor favor, revísala nuevamente en el Gestor de Excusas.`,
        })
      ]);
    }

    await logAudit({
      userId: session.user.id,
      modulo: "EXCUSAS",
      accion: "ACTUALIZAR",
      entidad: "Excusa",
      entidadId: excusaId,
      detalle: `Aprendiz apeló la excusa. Argumento: ${textoApelacion}`,
    });

    revalidatePath("/mis-excusas");
    revalidatePath("/gestor-excusas");
    return { success: true, data: update };
  } catch (error: any) {
    console.error("Error al apelar excusa:", error);
    return { success: false, error: "Error al apelar la excusa." };
  }
}

// ─────────────────────────────────────────────
// EX-5: RESPONDER APELACIÓN (Coordinador / Instructor)
// ─────────────────────────────────────────────
export async function responderApelacionAction(excusaId: string, decision: "APROBADA" | "RECHAZADA", respuesta: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !ROLES_REVISORES.includes(session.user.role)) return { success: false, error: "No autorizado" };

    const excusa = await prisma.excusa.findUnique({
      where: { id: excusaId },
      include: {
        aprendiz: { include: { ficha: { include: { asistencias: { include: { detalles: true } } } } } },
      },
    });

    if (!excusa) return { success: false, error: "Excusa no encontrada" };
    if (excusa.estado !== "APELADA") return { success: false, error: "La excusa no está en estado de apelación" };

    let instructorConnect: any = undefined;
    if (session.user.role === "INSTRUCTOR") {
      const instructor = await prisma.instructor.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (instructor) {
        instructorConnect = { connect: { id: instructor.id } };
      }
    }

    const updateData: any = {
      estado: decision,
      apelacionRespuesta: respuesta,
    };
    if (instructorConnect) {
      updateData.instructorRevisor = instructorConnect;
    }

    const update = await prisma.excusa.update({
      where: { id: excusaId },
      data: updateData,
    });

    // Notificar al aprendiz
    if (excusa.aprendiz?.userId) {
      await Promise.allSettled([
        crearNotificacionSistema(
          excusa.aprendiz.userId,
          `⚖️ Respuesta a Apelación de Excusa`,
          `Tu apelación fue ${decision}. Observación: ${respuesta}`,
          decision === "APROBADA" ? "SUCCESS" : "ERROR",
          "/mis-excusas"
        ),
        enviarMensajeAction({
          receptorId: excusa.aprendiz.userId,
          contenido: `⚖️ *RESPUESTA A APELACIÓN*\n\nTu apelación a la excusa ha sido ${decision === "APROBADA" ? "APROBADA ✅" : "RECHAZADA ❌"}.\n\nObservaciones:\n${respuesta}`,
        })
      ]);
    }

    if (decision === "APROBADA" && excusa.fechaInicio && excusa.fechaFin && excusa.aprendiz.fichaId) {
      await actualizarAsistenciaPorExcusa(excusa.aprendizId, excusa.aprendiz.fichaId, excusa.fechaInicio, excusa.fechaFin);
    }

    await logAudit({
      userId: session.user.id,
      modulo: "EXCUSAS",
      accion: "ACTUALIZAR",
      entidad: "Excusa",
      entidadId: excusaId,
      detalle: `Apelación de excusa ${decision}. Respuesta: ${respuesta}`,
    });

    revalidatePath("/gestor-excusas");
    revalidatePath("/mis-excusas");
    return { success: true, data: update };
  } catch (error: any) {
    console.error("Error al responder apelación:", error);
    return { success: false, error: "Error al responder apelación." };
  }
}
