"use server";
import { UserRepository } from "@/repositories/user.repository";
import { logAudit } from "@/lib/audit.service";
import { getServerSession } from "next-auth/next";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export interface RolConConteo {
  id: string;
  nombre: string;
  descripcion: string | null;
  usuariosAsignados: number;
}

const STATIC_ROLES: Record<string, Omit<RolConConteo, "usuariosAsignados">> = {
  ADMINISTRADOR: { id: "ADMINISTRADOR", nombre: "Administrador", descripcion: "Acceso total al sistema" },
  INSTRUCTOR: { id: "INSTRUCTOR", nombre: "Instructor", descripcion: "Gestión de aprendices y calificaciones" },
  APRENDIZ: { id: "APRENDIZ", nombre: "Aprendiz", descripcion: "Estudiante de la media técnica" },
  SECRETARIO: { id: "SECRETARIO", nombre: "Secretario", descripcion: "Gestión administrativa" },
  COORDINADOR_REGIONAL: { id: "COORDINADOR_REGIONAL", nombre: "Coordinador Regional", descripcion: "Gestión a nivel regional" },
  SUBDIRECTOR_REGIONAL: { id: "SUBDIRECTOR_REGIONAL", nombre: "Subdirector Regional", descripcion: "Subdirección a nivel regional" },
  COORDINADOR_SEDE: { id: "COORDINADOR_SEDE", nombre: "Coordinador de Sede", descripcion: "Gestión de la sede" },
};

export async function getRolesWithStats(): Promise<RolConConteo[]> {
  try {
    const users = await UserRepository.groupBy({
      by: ['rol'],
      _count: {
        id: true
      }
    });

    const userCountByRole = users.reduce((acc, curr) => {
      acc[curr.rol] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    return Object.values(STATIC_ROLES).map(rol => ({
      ...rol,
      usuariosAsignados: userCountByRole[rol.id] || 0
    }));
  } catch (error) {
    console.error("Error fetching roles with stats:", error);
    return Object.values(STATIC_ROLES).map(rol => ({
      ...rol,
      usuariosAsignados: 0
    }));
  }
}

export async function createRol(data: { nombre: string; descripcion?: string }) {
  return { error: "Los roles son estáticos (definidos por el sistema) y no pueden crearse dinámicamente." };
}

export async function deleteRol(id: string) {
  return { error: "Los roles son estáticos y no pueden ser eliminados." };
}
