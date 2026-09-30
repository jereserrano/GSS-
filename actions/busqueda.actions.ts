"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function buscarGlobalmente(query: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "No autorizado" };

    const role = (session.user?.role ?? "").toUpperCase();
    const isInstructor = role.includes("INSTRUCT");
    const isAprendiz = role.includes("APRENDIZ");
    const isAdminOrCoord = role.includes("ADMINISTRADOR") || role.includes("COORDINADOR");

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
    const terms = q.split(/\s+/).filter(Boolean);
    const aprendizTerms = terms.map(t => ({
      OR: [
        { nombres: { contains: t } },
        { apellidos: { contains: t } },
        { numeroDocumento: { contains: t } },
      ]
    }));

    const [aprendices, fichas, actividades, instituciones, programas] = await prisma.$transaction([
      prisma.aprendiz.findMany({
        where: {
          ...aprendizWhere,
          AND: aprendizTerms.length > 0 ? aprendizTerms : undefined
        },
        take: 15,
        include: { ficha: { select: { codigo: true } } }
      }),
      prisma.ficha.findMany({
        where: {
          ...fichaWhere,
          OR: [
            { codigo: { contains: q } },
            { programa: { nombre: { contains: q } } }
          ]
        },
        take: 10,
        include: { programa: { select: { nombre: true } } }
      }),
      prisma.actividad.findMany({
        where: {
          ...actividadWhere,
          OR: [
            { nombre: { contains: q } },
            { descripcion: { contains: q } },
            { ficha: { codigo: { contains: q } } }
          ]
        },
        take: 10,
        include: { ficha: { select: { codigo: true } } }
      }),
      // Instituciones y Programas solo relevantes si no son instructores o si hay match
      isAdminOrCoord ? prisma.institucion.findMany({
        where: {
          OR: [
            { nombre: { contains: q } },
            { nit: { contains: q } },
            { municipio: { contains: q } }
          ]
        },
        take: 10
      }) : prisma.institucion.findMany({ where: { id: "not-found" } }),
      isAdminOrCoord ? prisma.programa.findMany({
        where: {
          OR: [
            { nombre: { contains: q } },
            { codigo: { contains: q } }
          ]
        },
        take: 10
      }) : prisma.programa.findMany({ where: { id: "not-found" } })
    ]);

    return {
      success: true,
      data: { aprendices, fichas, actividades, instituciones, programas }
    };
  } catch (error: any) {
    console.error("Error en busqueda global:", error);
    return { success: false, error: "Error al buscar" };
  }
}
