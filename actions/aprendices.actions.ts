"use server";

import { UserRepository } from "@/repositories/user.repository";
import { AprendizRepository } from "@/repositories/aprendiz.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";

import { aprendizSchema } from "@/schemas";
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
import { NivelRiesgo } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { FiltrosAprendiz } from "@/types/aprendiz.types";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Returns the aprendiz record linked to the currently logged-in user */
export async function getAprendizPropioAction() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "No autenticado" };
    const user = await UserRepository.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false, error: "Usuario no encontrado" };
    const aprendiz = await prisma.aprendiz.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        fichaId: true,
        porcentajeAsistencia: true,
        promedioAcumulado: true,
        nivelRiesgo: true,
        estado: true,
        ficha: {
          select: {
            codigo: true,
            programa: { select: { nombre: true } },
            _count: { select: { actividades: true } }
          }
        },
        entregas: {
          select: { estado: true, actividad: { select: { nombre: true } } },
          where: { estado: { in: ["PENDIENTE", "NO_APROBADA", "TARDIA"] } }
        },
        alertas: {
          where: { gestionada: false },
          orderBy: { fechaDeteccion: "desc" },
          select: { id: true, motivo: true, nivel: true, observaciones: true, fechaDeteccion: true, gestionada: true }
        },
        evaluaciones: {
          select: { nota: true, juicio: true, resultadoAprendizaje: { select: { nombre: true } } }
        }
      }
    });
    if (!aprendiz) return { success: false, error: "Perfil de aprendiz no encontrado" };

    // Calculate live promedio and filter failed items
    let promedioReal = aprendiz.promedioAcumulado;
    let evaluacionesConNota = aprendiz.evaluaciones?.filter(e => e.nota !== null) || [];
    if (evaluacionesConNota.length > 0) {
      const sum = evaluacionesConNota.reduce((acc, curr) => acc + (curr.nota ?? 0), 0);
      promedioReal = parseFloat((sum / evaluacionesConNota.length).toFixed(2));
    }

    const fallasEvaluaciones = aprendiz.evaluaciones
      ?.filter(e => e.juicio === "DEFICIENTE")
      ?.map(e => e.resultadoAprendizaje?.nombre) || [];

    const fallasEntregas = aprendiz.entregas
      ?.filter(e => e.estado === "NO_APROBADA" || e.estado === "TARDIA")
      ?.map(e => e.actividad?.nombre) || [];

    return { 
      success: true, 
      data: { 
        ...aprendiz, 
        promedioAcumulado: promedioReal,
        fallas: [...fallasEvaluaciones, ...fallasEntregas]
      } 
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getAprendicesAction(filtros: FiltrosAprendiz = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where: any = {
      ...(filtros.busqueda ? {
        OR: [
          { nombres: { contains: filtros.busqueda } },
          { apellidos: { contains: filtros.busqueda } },
          { numeroDocumento: { contains: filtros.busqueda } },
        ]
      } : {}),
      ...(filtros.nivelRiesgo ? { nivelRiesgo: filtros.nivelRiesgo.toUpperCase() as NivelRiesgo } : {}),
      ...(filtros.estado ? { estado: filtros.estado.toUpperCase() as any } : {}),
      ...(filtros.fichaId ? { fichaId: filtros.fichaId } : {}),
    };

    const [data, total] = await TransactionRepository.$transaction([
      AprendizRepository.findMany({
        where,
        skip,
        take,
        include: {
          ficha: {
            include: {
              programa: { select: { nombre: true, codigo: true } },
              institucion: { select: { nombre: true } },
              sede: { select: { nombre: true } },
            },
          },
        },
        orderBy: [{ nivelRiesgo: "desc" }, { apellidos: "asc" }],
      }),
      AprendizRepository.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching aprendices:", error);
    return { success: false, error: error.message || "Error al obtener aprendices" };
  }
}

export async function createAprendiz(data: z.infer<typeof aprendizSchema>) {
  try {
    const parsed = aprendizSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const existing = await AprendizRepository.findUnique({
      where: { numeroDocumento: data.numeroDocumento },
    });
    if (existing) {
      return { error: "Ya existe un aprendiz con ese número de documento" };
    }

    const aprendiz = await AprendizRepository.create({
      data: {
        tipoDocumento: data.tipoDocumento as any,
        numeroDocumento: data.numeroDocumento,
        nombres: data.nombres,
        apellidos: data.apellidos,
        emailPersonal: data.emailPersonal || null,
        emailSena: data.emailSena || null,
        telefono: data.telefono || null,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        genero: data.genero || null,
        direccion: data.direccion || null,
        fichaId: data.fichaId,
        estado: (data.estado as any) || "EN_FORMACION",
      },
    });

    
    await logAudit({
      userId: user.id,
      modulo: "Aprendices",
      accion: "CREAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/aprendices");
    return { success: true, aprendiz };
  } catch (error: any) {
    console.error("Error creating aprendiz:", error);
    return { error: error.message || "Error al crear el aprendiz" };
  }
}

export async function updateAprendiz(id: string, data: z.infer<typeof aprendizSchema>) {
  try {
    const parsed = aprendizSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const updateData: any = {
      tipoDocumento: data.tipoDocumento,
      numeroDocumento: data.numeroDocumento,
      nombres: data.nombres,
      apellidos: data.apellidos,
      emailPersonal: data.emailPersonal || null,
      emailSena: data.emailSena || null,
      telefono: data.telefono || null,
      genero: data.genero || null,
      direccion: data.direccion || null,
      estado: data.estado,
    };

    if (data.fechaNacimiento) {
      updateData.fechaNacimiento = new Date(data.fechaNacimiento);
    }
    if (data.fichaId) {
      updateData.fichaId = data.fichaId;
    }

    const aprendiz = await AprendizRepository.update({
      where: { id },
      data: updateData,
    });

    
    await logAudit({
      userId: user.id,
      modulo: "Aprendices",
      accion: "ACTUALIZAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/aprendices");
    return { success: true, aprendiz };
  } catch (error: any) {
    console.error("Error updating aprendiz:", error);
    return { error: error.message || "Error al actualizar el aprendiz" };
  }
}

export async function deleteAprendiz(id: string) {
  try {
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    await AprendizRepository.delete({ where: { id } });
    
    await logAudit({
      userId: user.id,
      modulo: "Aprendices",
      accion: "ELIMINAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/aprendices");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting aprendiz:", error);
    return { error: error.message || "Error al eliminar el aprendiz" };
  }
}

export async function exportAprendicesCSV() {
  try {
    const aprendices = await AprendizRepository.findMany({
      orderBy: [{ apellidos: "asc" }, { nombres: "asc" }],
      include: {
        ficha: {
          include: {
            programa: { select: { nombre: true, codigo: true } },
            institucion: { select: { nombre: true } },
          },
        },
      },
    });

    const header = "Tipo Documento,Número Documento,Nombres,Apellidos,Email Personal,Email SENA,Teléfono,Género,Ficha,Programa,Institución,Estado,Nivel de Riesgo";
    const rows = aprendices.map((a) =>
      [
        a.tipoDocumento,
        a.numeroDocumento,
        a.nombres,
        a.apellidos,
        a.emailPersonal ?? "",
        a.emailSena ?? "",
        a.telefono ?? "",
        a.genero ?? "",
        a.ficha?.codigo ?? "",
        a.ficha?.programa?.nombre ?? "",
        a.ficha?.institucion?.nombre ?? "",
        a.estado,
        a.nivelRiesgo,
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting aprendices:", error);
    return { success: false, error: "Error al generar reporte de aprendices" };
  }
}

