"use server";

import { prisma } from "@/lib/prisma";

export async function getJerarquiaAcademicaAction(fichaId: string) {
  try {
    // Buscar la ficha para obtener su programa y competencias
    const ficha = await prisma.ficha.findUnique({
      where: { id: fichaId },
      include: {
        programa: {
          include: {
            competencias: {
              include: {
                resultadosAprendizaje: true
              }
            }
          }
        }
      }
    });

    if (!ficha) {
      return { success: false, error: "Ficha no encontrada" };
    }

    return { success: true, data: ficha.programa.competencias };
  } catch (error: any) {
    console.error("Error fetching jerarquía:", error);
    return { success: false, error: "Error al obtener la jerarquía académica" };
  }
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getProgramasSelectAction() {
  try {
    const session = await getServerSession(authOptions);
    let where: any = {};
    if (session?.user?.email) {
      const userRecord = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { instructor: { include: { fichas: { include: { ficha: true } } } }, aprendiz: true }
      });
      const rolUpper = userRecord?.rol?.toUpperCase() || "";
      if (rolUpper.includes("INSTRUCT") && userRecord?.instructor) {
        const programIds = userRecord.instructor.fichas.map(f => f.ficha.programaId);
        if (programIds.length > 0) {
          where = { id: { in: programIds } };
        } else {
          return { success: true, data: [] };
        }
      } else if (rolUpper.includes("APRENDIZ") && userRecord?.aprendiz) {
        // Aprendiz logic handled separately in component, but just in case
        return { success: true, data: [] };
      }
    }

    const programas = await prisma.programa.findMany({
      where,
      select: { id: true, nombre: true, codigo: true },
      orderBy: { nombre: "asc" }
    });
    return { success: true, data: programas };
  } catch (error: any) {
    return { success: false, error: "Error al cargar programas" };
  }
}

export async function getJerarquiaByProgramaAction(programaId: string) {
  try {
    const competencias = await prisma.competencia.findMany({
      where: { programas: { some: { id: programaId } } },
      include: {
        resultadosAprendizaje: true
      },
      orderBy: { codigo: "asc" }
    });
    return { success: true, data: competencias };
  } catch (error: any) {
    return { success: false, error: "Error al cargar el diseño curricular" };
  }
}
