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
        include: { rol: true, instructor: true, aprendiz: true }
      });
    }

    const rolNombre = userContext?.rol?.nombre?.toUpperCase() || "";
    let fichaFiltro = filtros.fichaId;

    // Si es Aprendiz, solo puede ver actividades de su ficha y publicadas
    const isAprendiz = rolNombre.includes("APRENDIZ");
    if (isAprendiz && userContext?.aprendiz?.fichaId) {
      fichaFiltro = userContext.aprendiz.fichaId;
    }

    const where: any = {
      ...(filtros.busqueda ? {
        OR: [
          { nombre: { contains: filtros.busqueda } },
          { descripcion: { contains: filtros.busqueda } },
        ]
      } : {}),
      ...(fichaFiltro ? { fichaId: fichaFiltro } : {}),
      ...(isAprendiz ? { estado: { in: ["ACTIVA", "PUBLICADA"] } } : {}),
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
            select: { codigo: true, nombre: true }
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
        tipo: data.tipo || "TALLER",
        fichaId: data.fichaId,
        instructorId,
        resultadoAprendizajeId: data.resultadoAprendizajeId || null,
        fechaVencimiento: new Date(data.fechaFin || data.fechaVencimiento),
        estado: estadoActividad,
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
          where: { fichaId: data.fichaId, estado: "EN_FORMACION", userId: { not: null } },
          select: { userId: true }
        });

        const fechaVenceFormatted = new Date(data.fechaFin || data.fechaVencimiento).toLocaleDateString("es-CO");
        for (const ap of aprendices) {
          if (ap.userId) {
            await crearNotificacionSistema(
              ap.userId,
              `Nueva actividad: ${data.nombre}`,
              `Se ha publicado la actividad "${data.nombre}". Fecha límite de entrega: ${fechaVenceFormatted}.`,
              "INFO"
            );
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
        instrucciones: data.instrucciones || null,
        tipo: data.tipo,
        fichaId: data.fichaId,
        resultadoAprendizajeId: data.resultadoAprendizajeId || null,
        fechaVencimiento: new Date(data.fechaFin || data.fechaVencimiento),
        estado: data.estado,
      },
    });

    await logAudit({
      userId: user.id,
      modulo: "Actividades",
      accion: "ACTUALIZAR",
      detalle: `Actividad actualizada ID: ${id}`,
    });
    revalidatePath("/actividades");
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
    await ActividadRepository.delete({ where: { id } });
    
    await logAudit({
      userId: user.id,
      modulo: "Actividades",
      accion: "ELIMINAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/actividades");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting actividad:", error);
    return { error: error.message || "Error al eliminar actividad" };
  }
}

export async function exportActividadesCSV() {
  try {
    const actividades = await ActividadRepository.findMany({
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
