"use server";

import { prisma } from "@/lib/prisma";
import type { Aprendiz } from "@/types/aprendiz.types";

export async function getDashboardKpis() {
  try {
    const [
      totalAprendicesActivos,
      totalInstitucionesActivas,
      totalFichasActivas,
      asistenciaStats,
      riesgoAlto,
      riesgoMedio,
    ] = await Promise.all([
      // Aprendices activos en formación
      prisma.aprendiz.count({
        where: { estado: "EN_FORMACION" },
      }),
      // Instituciones activas
      prisma.institucion.count({
        where: { estado: "ACTIVO" },
      }),
      // Fichas activas
      prisma.ficha.count({
        where: { estado: "ACTIVO" },
      }),
      // Asistencia promedio global de aprendices en formación
      prisma.aprendiz.aggregate({
        _avg: {
          porcentajeAsistencia: true,
        },
        where: {
          estado: "EN_FORMACION",
        },
      }),
      // Top 5 aprendices riesgo alto (para la tabla)
      prisma.aprendiz.findMany({
        where: { nivelRiesgo: "ALTO", estado: "EN_FORMACION" },
        take: 5,
        include: {
          ficha: {
            select: { 
              codigo: true,
              institucion: { select: { nombre: true } }
            }
          }
        },
        orderBy: { porcentajeAsistencia: "asc" }
      }),
      // Top 5 aprendices riesgo medio (para la tabla)
      prisma.aprendiz.findMany({
        where: { nivelRiesgo: "MEDIO", estado: "EN_FORMACION" },
        take: 5,
        include: {
          ficha: {
            select: { 
              codigo: true,
              institucion: { select: { nombre: true } }
            }
          }
        },
        orderBy: { porcentajeAsistencia: "asc" }
      })
    ]);

    const asistenciaPromedio = asistenciaStats._avg.porcentajeAsistencia || 0;
    
    // Formatear los aprendices para la tabla (compatibilidad con la UI)
    const topRiesgos = [...riesgoAlto, ...riesgoMedio].slice(0, 5).map(a => ({
      ...a,
      ficha: { codigo: a.ficha.codigo },
      institucion: { nombre: a.ficha.institucion.nombre }
    }));

    return {
      ok: true,
      data: {
        kpis: {
          totalAprendices: totalAprendicesActivos,
          totalInstituciones: totalInstitucionesActivas,
          totalFichas: totalFichasActivas,
          asistenciaPromedio: Number(asistenciaPromedio.toFixed(1)),
        },
        aprendicesRiesgo: topRiesgos as unknown as Aprendiz[]
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard KPIs:", error);
    return { ok: false, error: "No se pudieron cargar los datos del dashboard" };
  }
}
