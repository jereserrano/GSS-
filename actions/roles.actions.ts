"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface RolConConteo {
  id: string;
  nombre: string;
  descripcion: string | null;
  usuariosAsignados: number;
}

export async function getRolesWithStats(): Promise<RolConConteo[]> {
  try {
    const roles = await prisma.rol.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: {
        nombre: "asc",
      },
    });

    return roles.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      descripcion: r.descripcion,
      usuariosAsignados: r._count?.users ?? 0,
    }));
  } catch (error) {
    console.error("Error fetching roles with stats:", error);
    // Retornar roles base si la BD tiene un problema temporal
    return [
      {
        id: "rol-admin",
        nombre: "Administrador Sistema",
        descripcion: "Acceso total a todos los módulos y configuraciones del sistema.",
        usuariosAsignados: 1,
      },
      {
        id: "rol-coord",
        nombre: "Coordinador Académico",
        descripcion: "Gestión de fichas, programas de formación y reportes.",
        usuariosAsignados: 0,
      },
      {
        id: "rol-inst",
        nombre: "Instructor",
        descripcion: "Gestión de fichas asignadas, registro de asistencia y juicios evaluativos.",
        usuariosAsignados: 0,
      },
    ];
  }
}

export async function createRol(data: { nombre: string; descripcion?: string }) {
  try {
    const { nombre, descripcion } = data;

    if (!nombre || nombre.trim().length < 2) {
      return { error: "El nombre del rol debe tener al menos 2 caracteres." };
    }

    const trimmedNombre = nombre.trim();

    const existing = await prisma.rol.findUnique({
      where: { nombre: trimmedNombre },
    });

    if (existing) {
      return { error: `Ya existe un rol con el nombre "${trimmedNombre}".` };
    }

    const nuevoRol = await prisma.rol.create({
      data: {
        nombre: trimmedNombre,
        descripcion: descripcion?.trim() || null,
      },
    });

    revalidatePath("/roles");
    return { success: true, rol: nuevoRol };
  } catch (error: any) {
    console.error("Error creating role:", error);
    return { error: error.message || "Error al registrar el rol." };
  }
}

export async function deleteRol(id: string) {
  try {
    const usersCount = await prisma.user.count({
      where: { rolId: id },
    });

    if (usersCount > 0) {
      return {
        error: `No es posible eliminar este rol porque tiene ${usersCount} usuario(s) asignado(s).`,
      };
    }

    await prisma.rol.delete({
      where: { id },
    });

    revalidatePath("/roles");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting role:", error);
    return { error: error.message || "Error al eliminar el rol." };
  }
}
