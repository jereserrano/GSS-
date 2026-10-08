"use server";
import { UserRepository } from "@/repositories/user.repository";
import { logAudit } from "@/lib/audit.service";
import { getServerSession } from "next-auth/next";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export interface RolConConteo {
  id: string;
  nombre: string;
  descripcion: string | null;
  usuariosAsignados: number;
  permisos?: any;
}

const STATIC_ROLES: Record<string, Omit<RolConConteo, "usuariosAsignados">> = {
  ADMINISTRADOR: { id: "ADMINISTRADOR", nombre: "Administrador", descripcion: "Acceso total al sistema", permisos: [] },
  INSTRUCTOR: { id: "INSTRUCTOR", nombre: "Instructor", descripcion: "Gestión de aprendices y calificaciones", permisos: [] },
  APRENDIZ: { id: "APRENDIZ", nombre: "Aprendiz", descripcion: "Estudiante de la media técnica", permisos: [] },
  SECRETARIO: { id: "SECRETARIO", nombre: "Secretario", descripcion: "Gestión administrativa", permisos: [] },
  COORDINADOR_REGIONAL: { id: "COORDINADOR_REGIONAL", nombre: "Coordinador Regional", descripcion: "Gestión a nivel regional", permisos: [] },
  SUBDIRECTOR_REGIONAL: { id: "SUBDIRECTOR_REGIONAL", nombre: "Subdirector Regional", descripcion: "Subdirección a nivel regional", permisos: [] },
  COORDINADOR_SEDE: { id: "COORDINADOR_SEDE", nombre: "Coordinador de Sede", descripcion: "Gestión de la sede", permisos: [] },
};

export async function getRolesWithStats(): Promise<RolConConteo[]> {
  try {
    const rolesDb = await prisma.rol.findMany();

    if (rolesDb.length === 0) {
      await prisma.rol.createMany({
        data: Object.values(STATIC_ROLES).map(r => ({
          id: r.id,
          nombre: r.nombre,
          descripcion: r.descripcion,
          permisos: []
        }))
      });
      rolesDb.push(...await prisma.rol.findMany());
    }

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

    return rolesDb.map(rol => ({
      id: rol.id,
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      permisos: rol.permisos,
      usuariosAsignados: userCountByRole[rol.id] || userCountByRole[rol.nombre] || userCountByRole[rol.nombre.toUpperCase().replace(/ /g, '_')] || 0
    }));
  } catch (error) {
    console.error("Error fetching roles with stats:", error);
    return Object.values(STATIC_ROLES).map(rol => ({
      ...rol,
      usuariosAsignados: 0
    }));
  }
}

export async function createRol(data: { nombre: string; descripcion?: string; permisos?: string[] }) {
  try {
    const id = data.nombre.toUpperCase().replace(/\s+/g, '_');
    
    const nuevoRol = await prisma.rol.create({
      data: {
        id,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        permisos: data.permisos || []
      }
    });
    
    revalidatePath("/roles");
    return { success: true, rol: nuevoRol };
  } catch (error: any) {
    console.error("Error creating rol:", error);
    return { error: "No se pudo crear el rol. Posiblemente ya existe uno con ese nombre." };
  }
}

export async function deleteRol(id: string) {
  try {
    const estaticos = Object.keys(STATIC_ROLES);
    if (estaticos.includes(id)) {
      return { error: "No puedes eliminar un rol estático del sistema." };
    }
    
    await prisma.rol.delete({
      where: { id }
    });
    
    revalidatePath("/roles");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting rol:", error);
    return { error: "No se pudo eliminar el rol. Puede que haya usuarios asignados a él." };
  }
}
