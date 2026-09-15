"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        rol: true,
      },
      orderBy: {
        creadoEn: "desc",
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getRoles() {
  try {
    return await prisma.rol.findMany();
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
}

export async function createUser(data: any) {
  try {
    const { nombre, email, password, rolId } = data;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "El correo ya está registrado" };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        nombre,
        email,
        passwordHash,
        rolId,
      },
    });

    revalidatePath("/usuarios");
    return { success: true, user };
  } catch (error: any) {
    console.error("Error creating user:", error);
    return { error: error.message || "Error al crear el usuario" };
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const { nombre, email, password, rolId, estado } = data;
    
    let updateData: any = { nombre, email, rolId, estado };
    
    if (password && password.trim() !== "") {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/usuarios");
    return { success: true, user };
  } catch (error: any) {
    console.error("Error updating user:", error);
    return { error: error.message || "Error al actualizar el usuario" };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/usuarios");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { error: error.message || "Error al eliminar el usuario" };
  }
}
