"use server";

import { UserRepository } from "@/repositories/user.repository";
import { AprendizRepository } from "@/repositories/aprendiz.repository";
import { InstitucionRepository } from "@/repositories/institucion.repository";
import { FichaRepository } from "@/repositories/ficha.repository";

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

import type { Aprendiz } from "@/types/aprendiz.types";
import { prisma } from "@/lib/prisma";

export async function getDashboardKpis() {
  try {
    const session = await getServerSession();
    let userContext: any = null;
    if (session?.user?.email) {
      userContext = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { rol: true, instructor: true, aprendiz: true }
      });
    }

    const rolNombre = userContext?.rol?.nombre?.toUpperCase() || "";
    const isInstructor = rolNombre.includes("INSTRUCT");
    const isAprendiz = rolNombre.includes("APRENDIZ");

    // 1. Caso APRENDIZ: Métricas personales
    if (isAprendiz && userContext?.aprendiz) {
      const aprendizId = userContext.aprendiz.id;
      const fichaId = userContext.aprendiz.fichaId;

      const [totalActividades, misEntregas, actividadesPendientes, proximosCierres] = await Promise.all([
        prisma.actividad.count({
          where: { fichaId, estado: { in: ["ACTIVA", "PUBLICADA"] } }
        }),
        prisma.entrega.findMany({
          where: { aprendizId },
          select: { id: true, estado: true, calificacion: true }
        }),
        prisma.actividad.findMany({
          where: {
            fichaId,
            estado: { in: ["ACTIVA", "PUBLICADA"] },
            entregas: { none: { aprendizId } },
            fechaVencimiento: { gte: new Date() }
          },
          take: 5,
          include: { ficha: { select: { codigo: true } } },
          orderBy: { fechaVencimiento: "asc" }
        }),
        prisma.actividad.findMany({
          where: {
            fichaId,
            estado: { in: ["ACTIVA", "PUBLICADA"] },
            fechaVencimiento: { gte: new Date() }
          },
          take: 5,
          include: { ficha: { select: { codigo: true } } },
          orderBy: { fechaVencimiento: "asc" }
        })
      ]);

      const aprobadas = misEntregas.filter(e => e.estado === "APROBADA").length;
      const pendientes = misEntregas.filter(e => e.estado === "PENDIENTE").length;

      return {
        ok: true,
        rol: "APRENDIZ",
        data: {
          kpis: {
            totalAprendices: totalActividades, // Para aprendiz: total actividades
            totalInstituciones: misEntregas.length, // Total evidencias entregadas
            totalFichas: aprobadas, // Evidencias aprobadas
            asistenciaPromedio: Number(userContext.aprendiz.porcentajeAsistencia || 100),
          },
          labels: {
            kpi1: { title: "Actividades de Ficha", sub: "Asignadas a tu grupo" },
            kpi2: { title: "Evidencias Enviadas", sub: `${pendientes} en revisión` },
            kpi3: { title: "Actividades Aprobadas", sub: "Juicios positivos alcanzados" },
            kpi4: { title: "Asistencia Personal", sub: "Porcentaje de permanencia" },
          },
          proximosCierres: proximosCierres.map(a => ({
            id: a.id,
            title: a.nombre,
            date: new Date(a.fechaVencimiento).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
            ficha: `Ficha ${a.ficha.codigo}`,
          })),
          aprendicesRiesgo: []
        }
      };
    }

    // 2. Caso INSTRUCTOR: Métricas de sus fichas
    if (isInstructor && userContext?.instructor) {
      const instructorId = userContext.instructor.id;
      const asignaciones = await prisma.instructorFicha.findMany({
        where: { instructorId },
        select: { fichaId: true }
      });
      const fichasIds = asignaciones.map(a => a.fichaId);

      const [totalAprendices, totalFichas, asistenciaStats, aprendicesRiesgo, proximosCierres] = await Promise.all([
        prisma.aprendiz.count({
          where: { fichaId: { in: fichasIds.length > 0 ? fichasIds : undefined }, estado: "EN_FORMACION" }
        }),
        fichasIds.length > 0 ? fichasIds.length : prisma.ficha.count({ where: { estado: "ACTIVO" } }),
        prisma.aprendiz.aggregate({
          _avg: { porcentajeAsistencia: true },
          where: { fichaId: { in: fichasIds.length > 0 ? fichasIds : undefined }, estado: "EN_FORMACION" }
        }),
        prisma.aprendiz.findMany({
          where: {
            fichaId: { in: fichasIds.length > 0 ? fichasIds : undefined },
            nivelRiesgo: { in: ["ALTO", "MEDIO"] },
            estado: "EN_FORMACION"
          },
          take: 5,
          include: {
            ficha: { select: { codigo: true, institucion: { select: { nombre: true } } } }
          },
          orderBy: { porcentajeAsistencia: "asc" }
        }),
        prisma.actividad.findMany({
          where: {
            fichaId: { in: fichasIds.length > 0 ? fichasIds : undefined },
            fechaVencimiento: { gte: new Date() }
          },
          take: 5,
          include: { ficha: { select: { codigo: true } } },
          orderBy: { fechaVencimiento: "asc" }
        })
      ]);

      const topRiesgos = aprendicesRiesgo.map(a => ({
        ...a,
        ficha: { codigo: a.ficha.codigo },
        institucion: { nombre: a.ficha.institucion.nombre }
      }));

      return {
        ok: true,
        rol: "INSTRUCTOR",
        data: {
          kpis: {
            totalAprendices,
            totalInstituciones: totalFichas,
            totalFichas,
            asistenciaPromedio: Number((asistenciaStats._avg.porcentajeAsistencia || 0).toFixed(1)),
          },
          labels: {
            kpi1: { title: "Mis Aprendices", sub: "En formación activa" },
            kpi2: { title: "Fichas Asignadas", sub: "Grupos a mi cargo" },
            kpi3: { title: "Total Fichas", sub: "Grupos formativos" },
            kpi4: { title: "Asistencia Promedio", sub: "De mis grupos" },
          },
          proximosCierres: proximosCierres.map(a => ({
            id: a.id,
            title: a.nombre,
            date: new Date(a.fechaVencimiento).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
            ficha: `Ficha ${a.ficha.codigo}`,
          })),
          aprendicesRiesgo: topRiesgos as unknown as Aprendiz[]
        }
      };
    }

    // 3. Caso ADMINISTRADOR / COORDINADOR: Vista Global
    const [
      totalAprendicesActivos,
      totalInstitucionesActivas,
      totalFichasActivas,
      asistenciaStats,
      riesgoAlto,
      riesgoMedio,
      actividadesCierres
    ] = await Promise.all([
      AprendizRepository.count({
        where: { estado: "EN_FORMACION" },
      }),
      InstitucionRepository.count({
        where: { estado: "ACTIVO" },
      }),
      FichaRepository.count({
        where: { estado: "ACTIVO" },
      }),
      AprendizRepository.aggregate({
        _avg: {
          porcentajeAsistencia: true,
        },
        where: {
          estado: "EN_FORMACION",
        },
      }),
      AprendizRepository.findMany({
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
      AprendizRepository.findMany({
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
      }),
      prisma.actividad.findMany({
        where: { fechaVencimiento: { gte: new Date() } },
        take: 4,
        include: { ficha: { select: { codigo: true } } },
        orderBy: { fechaVencimiento: "asc" }
      })
    ]);

    const asistenciaPromedio = asistenciaStats._avg.porcentajeAsistencia || 0;
    const topRiesgos = [...riesgoAlto, ...riesgoMedio].slice(0, 5).map(a => ({
      ...a,
      ficha: { codigo: a.ficha.codigo },
      institucion: { nombre: a.ficha.institucion.nombre }
    }));

    const proximosCierres = actividadesCierres.length > 0 
      ? actividadesCierres.map(a => ({
          id: a.id,
          title: a.nombre,
          date: new Date(a.fechaVencimiento).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
          ficha: `Ficha ${a.ficha.codigo}`,
        }))
      : [
          { id: "1", title: "Cierre de Actividades del Trimestre", date: "Fin de trimestre", ficha: "Todas las fichas" }
        ];

    return {
      ok: true,
      rol: "ADMINISTRADOR",
      data: {
        kpis: {
          totalAprendices: totalAprendicesActivos,
          totalInstituciones: totalInstitucionesActivas,
          totalFichas: totalFichasActivas,
          asistenciaPromedio: Number(asistenciaPromedio.toFixed(1)),
        },
        proximosCierres,
        aprendicesRiesgo: topRiesgos as unknown as Aprendiz[]
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard KPIs:", error);
    return { ok: false, error: "No se pudieron cargar los datos del dashboard" };
  }
}
