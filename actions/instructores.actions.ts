"use server";

import { UserRepository } from "@/repositories/user.repository";
import { InstructorRepository } from "@/repositories/instructor.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";
import { prisma } from "@/lib/prisma";

import { instructorSchema } from "@/schemas";
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

export async function getInstructoresAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    const { skip, take } = getPaginacion(pagina, tamano);

    const where = {
      ...(filtros.busqueda ? {
        OR: [
          { nombres: { contains: filtros.busqueda } },
          { apellidos: { contains: filtros.busqueda } },
          { numeroDocumento: { contains: filtros.busqueda } },
          { email: { contains: filtros.busqueda } },
        ]
      } : {}),
    };

    const [data, total] = await TransactionRepository.$transaction([
      InstructorRepository.findMany({
        where,
        skip,
        take,
        include: {
          _count: { select: { asistencias: true } }
        },
        orderBy: { apellidos: "asc" },
      }),
      InstructorRepository.count({ where }),
    ]);

    return { success: true, data: paginatedResponse(data, total, pagina, tamano) };
  } catch (error: any) {
    console.error("Error fetching instructores:", error);
    return { success: false, error: error.message || "Error al obtener instructores" };
  }
}

export async function createInstructor(data: z.infer<typeof instructorSchema>) {
  try {
    const parsed = instructorSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const existing = await InstructorRepository.findFirst({
      where: { 
        OR: [
          { numeroDocumento: data.numeroDocumento },
          { email: data.email }
        ]
      },
    });
    if (existing) {
      return { error: "Ya existe un instructor con ese documento o email" };
    }

    const instructor = await InstructorRepository.create({
      data: {
        tipoDocumento: data.tipoDocumento || "CC",
        numeroDocumento: data.numeroDocumento,
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        telefono: data.telefono || null,
        profesion: data.profesion || null,
        estado: data.estado || "ACTIVO",
      },
    });

    
    await logAudit({
      userId: user.id,
      modulo: "Instructores",
      accion: "CREAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/instructores");
    return { success: true, instructor };
  } catch (error: any) {
    console.error("Error creating instructor:", error);
    return { error: error.message || "Error al crear instructor" };
  }
}

export async function updateInstructor(id: string, data: z.infer<typeof instructorSchema>) {
  try {
    const parsed = instructorSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const instructor = await InstructorRepository.update({
      where: { id },
      data: {
        tipoDocumento: data.tipoDocumento || "CC",
        numeroDocumento: data.numeroDocumento,
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        telefono: data.telefono || null,
        profesion: data.profesion || null,
        estado: data.estado,
      },
    });

    
    await logAudit({
      userId: user.id,
      modulo: "Instructores",
      accion: "ACTUALIZAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/instructores");
    return { success: true, instructor };
  } catch (error: any) {
    console.error("Error updating instructor:", error);
    return { error: error.message || "Error al actualizar instructor" };
  }
}

export async function deleteInstructor(id: string) {
  try {
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    await InstructorRepository.delete({ where: { id } });
    
    await logAudit({
      userId: user.id,
      modulo: "Instructores",
      accion: "ELIMINAR",
      detalle: "Acción completada exitosamente.",
    });
    revalidatePath("/instructores");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting instructor:", error);
    return { error: error.message || "Error al eliminar instructor" };
  }
}

export async function exportInstructoresCSV() {
  try {
    const instructores = await InstructorRepository.findMany({
      orderBy: { apellidos: "asc" },
      include: {
        _count: { select: { asistencias: true } }
      }
    });

    const header = "Tipo Documento,Número Documento,Nombres,Apellidos,Email,Teléfono,Profesión,Estado,Asistencias Registradas";
    const rows = instructores.map((i) =>
      [
        i.tipoDocumento,
        i.numeroDocumento,
        i.nombres,
        i.apellidos,
        i.email,
        i.telefono ?? "",
        i.profesion ?? "",
        i.estado,
        i._count.asistencias,
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    console.error("Error exporting instructores:", error);
    return { success: false, error: "Error al generar reporte de instructores" };
  }
}

export async function getFichasInstructor(instructorId: string) {
  try {
    await requireRole(["ADMINISTRADOR", "COORDINADOR"]);
    const fichas = await prisma.ficha.findMany({
      where: { estado: "ACTIVO" },
      include: { programa: { select: { nombre: true } } },
      orderBy: { codigo: "asc" }
    });
    const asignadas = await prisma.instructorFicha.findMany({
      where: { instructorId },
      select: { fichaId: true }
    });
    const asignadasIds = asignadas.map(a => a.fichaId);
    return { success: true, fichas, asignadasIds };
  } catch (error: any) {
    console.error("Error fetching fichas instructor:", error);
    return { success: false, error: error.message || "Error al obtener fichas" };
  }
}

export async function assignFichasToInstructor(instructorId: string, fichaIds: string[]) {
  try {
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR"]);
    await prisma.$transaction(async (tx) => {
      await tx.instructorFicha.deleteMany({
        where: { instructorId }
      });
      if (fichaIds.length > 0) {
        await tx.instructorFicha.createMany({
          data: fichaIds.map(fichaId => ({
            instructorId,
            fichaId
          }))
        });
      }
    });
    await logAudit({
      userId: user.id,
      modulo: "Instructores",
      accion: "ACTUALIZAR",
      detalle: `Se asignaron ${fichaIds.length} fichas al instructor.`,
    });
    revalidatePath("/instructores");
    return { success: true };
  } catch (error: any) {
    console.error("Error assigning fichas:", error);
    return { error: error.message || "Error al asignar fichas" };
  }
}
