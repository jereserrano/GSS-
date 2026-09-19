"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function buscarGlobalmente(query: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "No autorizado" };

    const role = (session.user?.role ?? "").toUpperCase();
    const isInstructor = role.includes("INSTRUCT");
    const isAprendiz = role.includes("APRENDIZ");
    // const isAdmin = role.includes("ADMIN");

    // Lógica de permisos de visibilidad para la búsqueda
    // Para simplificar: el instructor solo busca en sus fichas,
    // el aprendiz solo en sus fichas, 
    // y los admins/coordinadores en todas.

    let fichasIds = undefined;

    if (isInstructor) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: { instructor: { include: { fichas: true } } }
      });
      if (user?.instructor) {
        fichasIds = user.instructor.fichas.map(f => f.fichaId);
      } else {
        fichasIds = [];
      }
    } else if (isAprendiz) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: { aprendiz: true }
      });
      if (user?.aprendiz?.fichaId) {
        fichasIds = [user.aprendiz.fichaId];
      } else {
        fichasIds = [];
      }
    }

    const fichaWhere = fichasIds ? { id: { in: fichasIds } } : {};
    const aprendizWhere = fichasIds ? { fichaId: { in: fichasIds } } : {};
    const actividadWhere = fichasIds ? { fichaId: { in: fichasIds } } : {};

    const q = query.trim();

    const [aprendices, fichas, actividades] = await prisma.$transaction([
      prisma.aprendiz.findMany({
        where: {
          ...aprendizWhere,
          OR: [
            { nombres: { contains: q } },
            { apellidos: { contains: q } },
            { numeroDocumento: { contains: q } },
          ]
        },
        take: 10,
        include: { ficha: { select: { codigo: true } } }
      }),
      prisma.ficha.findMany({
        where: {
          ...fichaWhere,
          codigo: { contains: q }
        },
        take: 10,
        include: { programa: { select: { nombre: true } } }
      }),
      prisma.actividad.findMany({
        where: {
          ...actividadWhere,
          nombre: { contains: q }
        },
        take: 10,
        include: { ficha: { select: { codigo: true } } }
      })
    ]);

    return {
      success: true,
      data: { aprendices, fichas, actividades }
    };
  } catch (error: any) {
    console.error("Error en busqueda global:", error);
    return { success: false, error: "Error al buscar" };
  }
}
