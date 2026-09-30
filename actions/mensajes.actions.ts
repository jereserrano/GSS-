"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { crearNotificacionSistema } from "./notificaciones.actions";

const userSelectWithNames = { id: true, nombre: true, email: true, rol: true, instructor: { select: { nombres: true, apellidos: true } }, aprendiz: { select: { nombres: true, apellidos: true } } };
function resolveName(u: any) {
  if (!u) return "Usuario";
  if (u.instructor) return `${u.instructor.nombres} ${u.instructor.apellidos}`.trim();
  if (u.aprendiz) return `${u.aprendiz.nombres} ${u.aprendiz.apellidos}`.trim();
  return u.nombre || "Usuario";
}

// ─────────────────────────────────────────────
// ENVIAR MENSAJE (directo o global)
// ─────────────────────────────────────────────
export async function enviarMensajeAction(data: {
  receptorId?: string;
  contenido: string;
  esGlobal?: boolean;
  replyToId?: string;
  adjuntoUrl?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "No autorizado" };

    const { receptorId, contenido, esGlobal } = data;
    const emisorNombre = session.user.name || "Un usuario";

    // Validación de permisos para mensajes globales
    if (esGlobal) {
      // FIX: Comparar contra los valores reales del enum (ADMINISTRADOR, COORDINADOR)
      if (!["ADMINISTRADOR", "ADMIN", "COORDINADOR"].includes(session.user.role)) {
        return { success: false, error: "No tienes permiso para enviar comunicados globales" };
      }

      const mensaje = await prisma.mensaje.create({
        data: {
          emisorId: session.user.id,
          esGlobal: true,
          contenido,
          replyToId: data.replyToId,
          adjuntoUrl: data.adjuntoUrl,
        },
      });

      // Notificar a todos los usuarios activos del sistema
      const todosLosUsuarios = await prisma.user.findMany({
        where: { estado: "ACTIVO", id: { not: session.user.id } },
        select: { id: true },
      });
      await Promise.allSettled(
        todosLosUsuarios.map((u) =>
          crearNotificacionSistema(
            u.id,
            `📢 Comunicado de ${emisorNombre}`,
            contenido.length > 120 ? contenido.slice(0, 120) + "…" : contenido,
            "INFO",
            "/mensajes"
          )
        )
      );

      revalidatePath("/mensajes");
      return { success: true, data: mensaje };
    }

    if (!receptorId) return { success: false, error: "Destinatario requerido para mensaje directo" };

    const mensaje = await prisma.mensaje.create({
      data: {
        emisorId: session.user.id,
        receptorId,
        esGlobal: false,
        contenido,
        replyToId: data.replyToId,
        adjuntoUrl: data.adjuntoUrl,
        leido: false,
      },
    });

    // FIX #1: Crear notificación para el receptor del mensaje directo
    await crearNotificacionSistema(
      receptorId,
      `💬 Nuevo mensaje de ${emisorNombre}`,
      contenido.length > 120 ? contenido.slice(0, 120) + "…" : contenido,
      "INFO",
      "/mensajes"
    );

    revalidatePath("/mensajes");
    return { success: true, data: mensaje };
  } catch (error: any) {
    console.error("Error al enviar mensaje:", error);
    return { success: false, error: "Error interno al enviar mensaje." };
  }
}

// ─────────────────────────────────────────────
// OBTENER MENSAJES (globales + directos)
// ─────────────────────────────────────────────
export async function getMensajesAction() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "No autorizado" };
    const userId = session.user.id;

    // Obtener los últimos 50 comunicados globales (paginación básica)
    const globales = await prisma.mensaje.findMany({
      where: { esGlobal: true },
      orderBy: { creadoEn: "desc" },
      take: 50,
      include: {
        emisor: { select: userSelectWithNames },
        lecturasGlobales: { where: { userId } }, // Para saber si ya lo leyó
        replyTo: { select: { id: true, contenido: true, emisor: { select: userSelectWithNames } } },
      },
    });

    // Obtener mensajes directos (donde el usuario es emisor o receptor)
    const directos = await prisma.mensaje.findMany({
      where: {
        esGlobal: false,
        OR: [{ emisorId: userId }, { receptorId: userId }],
      },
      orderBy: { creadoEn: "asc" }, // ascendente para renderizado natural del chat
      include: {
        emisor: { select: userSelectWithNames },
        receptor: { select: userSelectWithNames },
        replyTo: { select: { id: true, contenido: true, emisor: { select: userSelectWithNames } } },
      },
    });

    // ─── Contar mensajes NO LEÍDOS por conversación (para badge MS-1)
    // Contamos ANTES de marcar para que el mapa sea preciso
    const noLeidosRaw = await prisma.mensaje.groupBy({
      by: ["emisorId"],
      where: {
        esGlobal: false,
        receptorId: userId,
        leido: false,
      },
      _count: { id: true },
    });
    // Mapa: emisorId -> cantidad de mensajes no leídos
    const noLeidosPor: Record<string, number> = {};
    noLeidosRaw.forEach((r) => {
      noLeidosPor[r.emisorId] = r._count.id;
    });

    const mapMessage = (m: any) => ({
      ...m,
      emisor: m.emisor ? { ...m.emisor, nombre: resolveName(m.emisor) } : null,
      receptor: m.receptor ? { ...m.receptor, nombre: resolveName(m.receptor) } : null,
      replyTo: m.replyTo ? { ...m.replyTo, emisor: { ...m.replyTo.emisor, nombre: resolveName(m.replyTo?.emisor) } } : null,
    });
    return { success: true, data: { globales: globales.map(mapMessage), directos: directos.map(mapMessage), noLeidosPor } };
  } catch (error: any) {
    console.error("Error al obtener mensajes:", error);
    return { success: false, error: "Error al obtener mensajes." };
  }
}

// ─────────────────────────────────────────────
// MS-1: MARCAR CONVERSACIÓN COMO LEÍDA al abrirla
// ─────────────────────────────────────────────
export async function marcarConversacionLeidaAction(contactoId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false };

    await prisma.mensaje.updateMany({
      where: {
        esGlobal: false,
        emisorId: contactoId,
        receptorId: session.user.id,
        leido: false,
      },
      data: { leido: true },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error marcando conversación como leída:", error);
    return { success: false };
  }
}

// ─────────────────────────────────────────────
// ELIMINAR UN MENSAJE
// ─────────────────────────────────────────────
export async function eliminarMensajeAction(mensajeId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "No autorizado" };

    const mensaje = await prisma.mensaje.findUnique({ where: { id: mensajeId } });
    if (!mensaje) return { success: false, error: "Mensaje no encontrado" };

    // Solo el emisor o un ADMIN/COORDINADOR puede eliminar
    const esAdmin = ["ADMINISTRADOR", "ADMIN", "COORDINADOR"].includes(session.user.role);
    if (mensaje.emisorId !== session.user.id && !esAdmin) {
      return { success: false, error: "No tienes permiso para eliminar este mensaje" };
    }

    await prisma.mensaje.delete({ where: { id: mensajeId } });
    revalidatePath("/mensajes");
    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar mensaje:", error);
    return { success: false, error: "Error al eliminar el mensaje." };
  }
}

// ─────────────────────────────────────────────
// ELIMINAR TODA UNA CONVERSACIÓN
// ─────────────────────────────────────────────
export async function eliminarConversacionAction(contactoId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "No autorizado" };

    const userId = session.user.id;

    // Elimina todos los mensajes entre el usuario actual y el contacto
    await prisma.mensaje.deleteMany({
      where: {
        esGlobal: false,
        OR: [
          { emisorId: userId, receptorId: contactoId },
          { emisorId: contactoId, receptorId: userId },
        ],
      },
    });

    revalidatePath("/mensajes");
    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar conversación:", error);
    return { success: false, error: "Error al eliminar la conversación." };
  }
}

// ─────────────────────────────────────────────
// OBTENER CONTACTOS DISPONIBLES
// ─────────────────────────────────────────────
export async function getContactosDisponiblesAction() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "No autorizado" };

    const { id: userId, role } = session.user;
    let contactos: any[] = [];

    if (role === "ADMINISTRADOR" || role === "ADMIN" || role === "COORDINADOR") {
      // FIX #2: Retornar fichaId y programaId para permitir filtros en el frontend
      const rawUsers = await prisma.user.findMany({
        where: { id: { not: userId }, estado: "ACTIVO" },
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          aprendiz: {
            select: {
              ficha: {
                select: {
                  id: true,
                  codigo: true,
                  programa: { select: { id: true, nombre: true } },
                },
              },
            },
          },
        },
      });
      contactos = rawUsers.map((u) => ({
        id: u.id,
        nombre: resolveName(u),
        email: u.email,
        rol: u.rol,
        fichaId: u.aprendiz?.ficha?.id || null,
        fichaCodigo: u.aprendiz?.ficha?.codigo || null,
        programaId: u.aprendiz?.ficha?.programa?.id || null,
        programaNombre: u.aprendiz?.ficha?.programa?.nombre || null,
        etiqueta: u.aprendiz?.ficha
          ? `Ficha: ${u.aprendiz.ficha.codigo} - ${u.aprendiz.ficha.programa.nombre}`
          : "",
      }));
    } else if (role === "APRENDIZ") {
      // Aprendiz puede ver instructores de su ficha, apoyo y coord
      const aprendiz = await prisma.aprendiz.findUnique({
        where: { userId },
        include: {
          ficha: {
            include: {
              instructores: { include: { instructor: { include: { user: true } } } },
            },
          },
        },
      });
      const coordAdmin = await prisma.user.findMany({ where: { rol: { in: ["ADMINISTRADOR", "COORDINADOR", "APOYO_COORDINACION"] }, estado: "ACTIVO" }, select: userSelectWithNames });

      const instructores =
        aprendiz?.ficha?.instructores
          ?.map((i) => i.instructor.user)
          .filter(Boolean)
          .map((u: any) => ({ id: u.id, nombre: resolveName(u), email: u.email, rol: u.rol })) || [];
      contactos = [...coordAdmin.map((u: any) => ({ ...u, nombre: resolveName(u) })), ...instructores.map((u: any) => ({ ...u, nombre: resolveName(u) }))];
    } else if (role === "INSTRUCTOR") {
      // Instructor puede ver coord, apoyo y aprendices de sus fichas (con etiqueta de ficha)
      const coordAdmin = await prisma.user.findMany({ where: { rol: { in: ["ADMINISTRADOR", "COORDINADOR", "APOYO_COORDINACION"] }, estado: "ACTIVO" }, select: userSelectWithNames });
      const fichas = await prisma.instructorFicha.findMany({
        where: { instructor: { userId } },
        include: {
          ficha: {
            include: {
              programa: { select: { id: true, nombre: true } },
              aprendices: { include: { user: true } },
            },
          },
        },
      });
      const aprendices = fichas.flatMap((f) =>
        f.ficha.aprendices
          .map((a) => a.user)
          .filter(Boolean)
          .map((u: any) => ({
            id: u.id,
            nombre: resolveName(u),
            email: u.email,
            rol: u.rol,
            fichaId: f.ficha.id,
            fichaCodigo: f.ficha.codigo,
            programaId: f.ficha.programa?.id || null,
            programaNombre: f.ficha.programa?.nombre || null,
            etiqueta: `Ficha: ${f.ficha.codigo}`,
          }))
      );

      contactos = [...coordAdmin.map((u: any) => ({ ...u, nombre: resolveName(u), fichaId: null, fichaCodigo: null, programaId: null, programaNombre: null, etiqueta: "" })), ...aprendices];
    } else if (role === "APOYO_COORDINACION") {
      // FIX #4: APOYO puede ver coord + todos los de su sede,
      // incluyendo aprendices cuya FICHA pertenece a esa sede (no solo User.sedeId)
      const coordAdmin = await prisma.user.findMany({ where: { rol: { in: ["ADMINISTRADOR", "COORDINADOR"] }, estado: "ACTIVO" }, select: userSelectWithNames });

      const userApoyo = await prisma.user.findUnique({ where: { id: userId } });
      let sedeUsers: any[] = [];
      let aprendicesDeSede: any[] = [];

      if (userApoyo?.sedeId) {
        // Usuarios con sedeId directo (instructores, otros apoyos, etc.)
        const usersDirectos = await prisma.user.findMany({
          where: { sedeId: userApoyo.sedeId, id: { not: userId }, estado: "ACTIVO" },
          select: userSelectWithNames,
        });
        sedeUsers = usersDirectos.map((u) => ({
          ...u,
          nombre: resolveName(u),
          fichaId: null,
          fichaCodigo: null,
          programaId: null,
          programaNombre: null,
          etiqueta: "",
        }));

        // Aprendices cuya ficha pertenece a la misma sede
        const fichasDeSede = await prisma.ficha.findMany({
          where: { sedeId: userApoyo.sedeId, estado: "ACTIVO" },
          include: { programa: { select: { id: true, nombre: true } } },
        });
        const fichaIds = fichasDeSede.map((f) => f.id);
        const fichaMap = new Map(fichasDeSede.map((f) => [f.id, f]));

        const rawAprendices = await prisma.aprendiz.findMany({
          where: { fichaId: { in: fichaIds } },
          include: { user: { select: { ...userSelectWithNames, estado: true } } },
        });
        aprendicesDeSede = rawAprendices
          .filter((a) => a.user && a.user.estado === "ACTIVO" && a.user.id !== userId)
          .map((a) => {
            const ficha = fichaMap.get(a.fichaId);
            return {
              id: a.user!.id,
              nombre: resolveName(a.user),
              email: a.user!.email,
              rol: a.user!.rol,
              fichaId: a.fichaId,
              fichaCodigo: ficha?.codigo || null,
              programaId: ficha?.programa?.id || null,
              programaNombre: ficha?.programa?.nombre || null,
              etiqueta: ficha ? `Ficha: ${ficha.codigo} - ${ficha.programa?.nombre || ""}` : "",
            };
          });
      }

      contactos = [
        ...coordAdmin.map((u) => ({ ...u, nombre: resolveName(u), fichaId: null, fichaCodigo: null, programaId: null, programaNombre: null, etiqueta: "" })),
        ...sedeUsers,
        ...aprendicesDeSede,
      ];
    }

    // Deduplicar contactos por ID
    const unicos = Array.from(new Map(contactos.map((item) => [item.id, item])).values());

    return { success: true, data: unicos };
  } catch (error: any) {
    console.error("Error al cargar contactos:", error);
    return { success: false, error: "Error al cargar los contactos" };
  }
}

// ─────────────────────────────────────────────
// MS-6: MARCAR COMUNICADO GLOBAL COMO LEÍDO
// ─────────────────────────────────────────────
export async function marcarGlobalLeidoAction(mensajeId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false };

    // Usar upsert para evitar duplicados (@@unique ya lo garantiza en BD)
    await prisma.mensajeLeido.upsert({
      where: { mensajeId_userId: { mensajeId, userId: session.user.id } },
      update: {},
      create: { mensajeId, userId: session.user.id },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error marcando global como leído:", error);
    return { success: false };
  }
}

// ─────────────────────────────────────────────
// MS-6: OBTENER LECTURAS DE COMUNICADOS GLOBALES
// Retorna { mensajeId -> count de lecturas } para coordinadores/admin
// ─────────────────────────────────────────────
export async function getLecturasGlobalAction(mensajeIds: string[]) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, data: {} };

    const roles = ["ADMINISTRADOR", "ADMIN", "COORDINADOR"];
    if (!roles.includes(session.user.role)) return { success: false, data: {} };

    const lecturas = await prisma.mensajeLeido.groupBy({
      by: ["mensajeId"],
      where: { mensajeId: { in: mensajeIds } },
      _count: { userId: true },
    });

    const mapa: Record<string, number> = {};
    lecturas.forEach((l) => { mapa[l.mensajeId] = l._count.userId; });

    // Total de usuarios activos (para calcular "X de Y lo leyeron")
    const totalUsuarios = await prisma.user.count({ where: { estado: "ACTIVO" } });

    return { success: true, data: { lecturasPor: mapa, totalUsuarios } };
  } catch (error: any) {
    console.error("Error obteniendo lecturas:", error);
    return { success: false, data: {} };
  }
}

// ─────────────────────────────────────────────
// MS-7: MENSAJE MASIVO SEGMENTADO
// ─────────────────────────────────────────────
export async function enviarMensajeMasivoAction(data: {
  contenido: string;
  segmento: "TODOS" | "APRENDICES" | "INSTRUCTORES" | "FICHA" | "PROGRAMA";
  fichaId?: string;
  programaId?: string;
  adjuntoUrl?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "No autorizado" };

    const rolesPermitidos = ["ADMINISTRADOR", "ADMIN", "COORDINADOR"];
    if (!rolesPermitidos.includes(session.user.role)) {
      return { success: false, error: "No tienes permiso para enviar mensajes masivos" };
    }

    const { contenido, segmento, fichaId, programaId } = data;
    let destinatarios: string[] = [];

    // Construir lista de destinatarios según el segmento
    if (segmento === "TODOS") {
      const users = await prisma.user.findMany({
        where: { id: { not: session.user.id }, estado: "ACTIVO" },
        select: { id: true },
      });
      destinatarios = users.map((u) => u.id);

    } else if (segmento === "APRENDICES") {
      const users = await prisma.user.findMany({
        where: { rol: "APRENDIZ", estado: "ACTIVO", id: { not: session.user.id } },
        select: { id: true },
      });
      destinatarios = users.map((u) => u.id);

    } else if (segmento === "INSTRUCTORES") {
      const users = await prisma.user.findMany({
        where: { rol: "INSTRUCTOR", estado: "ACTIVO", id: { not: session.user.id } },
        select: { id: true },
      });
      destinatarios = users.map((u) => u.id);

    } else if (segmento === "FICHA" && fichaId) {
      // Todos los aprendices y el instructor de esa ficha
      const aprendices = await prisma.aprendiz.findMany({
        where: { fichaId },
        include: { user: { select: { id: true, estado: true } } },
      });
      const instructores = await prisma.instructorFicha.findMany({
        where: { fichaId },
        include: { instructor: { include: { user: { select: { id: true, estado: true } } } } },
      });
      const idsAprendices = aprendices.filter((a) => a.user?.estado === "ACTIVO").map((a) => a.user!.id);
      const idsInstructores = instructores.filter((i) => i.instructor?.user?.estado === "ACTIVO").map((i) => i.instructor!.user!.id);
      destinatarios = [...new Set([...idsAprendices, ...idsInstructores])].filter((id) => id !== session.user.id);

    } else if (segmento === "PROGRAMA" && programaId) {
      // Todos los aprendices de fichas de ese programa
      const fichas = await prisma.ficha.findMany({ where: { programaId }, select: { id: true } });
      const fichaIds = fichas.map((f) => f.id);
      const aprendices = await prisma.aprendiz.findMany({
        where: { fichaId: { in: fichaIds } },
        include: { user: { select: { id: true, estado: true } } },
      });
      destinatarios = aprendices.filter((a) => a.user?.estado === "ACTIVO" && a.user.id !== session.user.id).map((a) => a.user!.id);
    }

    if (destinatarios.length === 0) {
      return { success: false, error: "No se encontraron destinatarios para el segmento seleccionado" };
    }

    // Enviar mensajes directos individuales en lotes para no sobrecargar BD
    const BATCH_SIZE = 50;
    let enviados = 0;

    for (let i = 0; i < destinatarios.length; i += BATCH_SIZE) {
      const lote = destinatarios.slice(i, i + BATCH_SIZE);
      await prisma.mensaje.createMany({
        data: lote.map((receptorId) => ({
          emisorId: session.user.id,
          receptorId,
          esGlobal: false,
          contenido,
          leido: false,
        })),
        skipDuplicates: true,
      });

      // Notificaciones en lote
      await Promise.allSettled(
        lote.map((receptorId) =>
          crearNotificacionSistema(
            receptorId,
            "📢 Mensaje masivo",
            `${session.user.name || "Coordinación"}: ${contenido.slice(0, 80)}${contenido.length > 80 ? "..." : ""}`,
            "INFO",
            "/mensajes"
          )
        )
      );

      enviados += lote.length;
    }

    revalidatePath("/mensajes");
    return { success: true, data: { enviados } };
  } catch (error: any) {
    console.error("Error al enviar mensaje masivo:", error);
    return { success: false, error: "Error al enviar el mensaje masivo." };
  }
}
