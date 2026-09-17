"use server";

import { UserRepository } from "@/repositories/user.repository";
import { DocenteRepository } from "@/repositories/docente.repository";

import { revalidatePath } from "next/cache";
import { docenteSchema } from "@/schemas/docente.schema";
import { logAudit } from "@/lib/audit.service";
import { getServerSession } from "next-auth/next";
import { requireRole, requireInstitutionAccess } from "@/lib/rbac";

async function getSessionUserId() {
  const session = await getServerSession();
  // Asumiendo que el ID o email del usuario está en session.user
  if (session?.user?.email) {
    const user = await UserRepository.findUnique({ where: { email: session.user.email } });
    return user?.id || null;
  }
  return null;
}

export async function getDocentesAction() {
  try {
    const docentes = await DocenteRepository.findMany({
      include: {
        institucion: true,
      },
      orderBy: { creadoEn: "desc" },
    });
    return { success: true, data: docentes };
  } catch (error: any) {
    return { success: false, error: "Error al obtener los docentes: " + error.message };
  }
}

export async function createDocenteAction(data: unknown) {
  try {
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const result = docenteSchema.safeParse(data);
    
    if (!result.success) {
      return { success: false, error: "Datos inválidos", issues: result.error.errors };
    }

    const docente = await DocenteRepository.create({
      data: result.data,
    });

    await logAudit({
      userId: user.id,
      modulo: "Docentes",
      accion: "CREAR",
      detalle: `Creado docente ${docente.numeroDocumento} - ${docente.nombres}`,
    });

    revalidatePath("/docentes");
    return { success: true, data: docente };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "El documento o email ya existe" };
    }
    return { success: false, error: "Error al crear docente: " + error.message };
  }
}

export async function updateDocenteAction(id: string, data: unknown) {
  try {
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const result = docenteSchema.safeParse(data);
    
    if (!result.success) {
      return { success: false, error: "Datos inválidos", issues: result.error.errors };
    }

    const docente = await DocenteRepository.update({
      where: { id },
      data: result.data,
    });

    await logAudit({
      userId: user.id,
      modulo: "Docentes",
      accion: "ACTUALIZAR",
      detalle: `Actualizado docente ${docente.numeroDocumento}`,
    });

    revalidatePath("/docentes");
    return { success: true, data: docente };
  } catch (error: any) {
    return { success: false, error: "Error al actualizar docente: " + error.message };
  }
}

export async function deleteDocenteAction(id: string) {
  try {
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const docente = await DocenteRepository.delete({
      where: { id },
    });

    await logAudit({
      userId: user.id,
      modulo: "Docentes",
      accion: "ELIMINAR",
      detalle: `Eliminado docente ${docente.numeroDocumento}`,
    });

    revalidatePath("/docentes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Error al eliminar docente: " + error.message };
  }
}
