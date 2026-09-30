"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export interface RAConEntrega {
  id: string;
  codigo: string;
  nombre: string;
  fase: string;
  entrega: {
    id: string;
    urlArchivo: string | null;
    comentario: string | null;
    fechaEntrega: string;
    estado: string;
    calificacion: string | null;
    retroalimentacion: string | null;
    actividad: { id: string; nombre: string };
  } | null;
}

export interface CompetenciaConRAs {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  duracionHoras: number;
  urlGuia: string | null;
  resultadosAprendizaje: RAConEntrega[];
}

export interface PortafolioData {
  ficha: {
    id: string;
    codigo: string;
    programa: { id: string; nombre: string; codigo: string };
    institucion: { nombre: string };
    sede: { nombre: string };
  };
  aprendiz: {
    id: string;
    nombres: string;
    apellidos: string;
    numeroDocumento: string;
  };
  competencias: CompetenciaConRAs[];
  totalEvidencias: number;
  totalRAs: number;
}

export async function getPortafolioAprendizAction(): Promise<
  { success: true; data: PortafolioData } | { success: false; error: string }
> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "No autenticado" };
    }

    const aprendiz = await prisma.aprendiz.findUnique({
      where: { userId: session.user.id },
      include: {
        ficha: {
          include: {
            programa: { select: { id: true, nombre: true, codigo: true } },
            institucion: { select: { nombre: true } },
            sede: { select: { nombre: true } },
          },
        },
      },
    });

    if (!aprendiz) {
      return { success: false, error: "No se encontró el registro de aprendiz." };
    }

    const programa = await prisma.programa.findFirst({
      where: { fichas: { some: { id: aprendiz.fichaId } } },
      include: {
        competencias: {
          where: { estado: "ACTIVO" },
          orderBy: { codigo: "asc" },
          include: {
            resultadosAprendizaje: { orderBy: { codigo: "asc" } },
          },
        },
      },
    });

    if (!programa) {
      return { success: false, error: "No se encontró el programa de formación." };
    }

    const entregas = await prisma.entrega.findMany({
      where: {
        aprendizId: aprendiz.id,
        actividad: {
          fichaId: aprendiz.fichaId,
          resultadoAprendizajeId: { not: null },
        },
      },
      include: {
        actividad: {
          select: { id: true, nombre: true, resultadoAprendizajeId: true },
        },
      },
      orderBy: { fechaEntrega: "desc" },
    });

    // Map: raId -> entrega más reciente
    const entregasPorRA = new Map<string, typeof entregas[0]>();
    for (const entrega of entregas) {
      const raId = entrega.actividad.resultadoAprendizajeId;
      if (raId && !entregasPorRA.has(raId)) {
        entregasPorRA.set(raId, entrega);
      }
    }

    let totalEvidencias = 0;
    let totalRAs = 0;

    const competencias: CompetenciaConRAs[] = programa.competencias.map((comp) => {
      const rasConEntrega: RAConEntrega[] = comp.resultadosAprendizaje.map((ra) => {
        totalRAs++;
        const entrega = entregasPorRA.get(ra.id) ?? null;
        if (entrega?.urlArchivo) totalEvidencias++;

        return {
          id: ra.id,
          codigo: ra.codigo,
          nombre: ra.nombre,
          fase: ra.fase,
          entrega: entrega
            ? {
              id: entrega.id,
              urlArchivo: entrega.urlArchivo,
              comentario: entrega.comentario,
              fechaEntrega: entrega.fechaEntrega.toISOString(),
              estado: entrega.estado,
              calificacion: entrega.calificacion,
              retroalimentacion: entrega.retroalimentacion,
              actividad: { id: entrega.actividad.id, nombre: entrega.actividad.nombre },
            }
            : null,
        };
      });

      return {
        id: comp.id,
        codigo: comp.codigo,
        nombre: comp.nombre,
        tipo: comp.tipo,
        duracionHoras: comp.duracionHoras,
        urlGuia: comp.urlGuia,
        resultadosAprendizaje: rasConEntrega,
      };
    });

    return {
      success: true,
      data: {
        ficha: {
          id: aprendiz.ficha.id,
          codigo: aprendiz.ficha.codigo,
          programa: aprendiz.ficha.programa,
          institucion: aprendiz.ficha.institucion,
          sede: aprendiz.ficha.sede,
        },
        aprendiz: {
          id: aprendiz.id,
          nombres: aprendiz.nombres,
          apellidos: aprendiz.apellidos,
          numeroDocumento: aprendiz.numeroDocumento,
        },
        competencias,
        totalEvidencias,
        totalRAs,
      },
    };
  } catch (error: any) {
    console.error("Error en getPortafolioAprendizAction:", error);
    return { success: false, error: error.message || "Error al cargar el portafolio" };
  }
}
import { GoogleDriveService } from "@/services/google-drive.service";
import path from "path";

export async function syncAllEvidenciasToDrive() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== "APRENDIZ") {
      return { success: false, error: "No autorizado" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { aprendiz: true }
    });

    if (!user?.aprendiz || !user.googleDriveLinked) {
      return { success: false, error: "Usuario o Drive no vinculados" };
    }

    const entregas = await prisma.entrega.findMany({
      where: {
        aprendizId: user.aprendiz.id,
        urlArchivo: { not: null }
      },
      include: {
        actividad: {
          include: {
            resultadoAprendizaje: {
              include: { competencia: true }
            }
          }
        }
      }
    });

    let syncCount = 0;

    for (const entrega of entregas) {
      if (!entrega.urlArchivo) continue;
      
      const filename = entrega.urlArchivo.split('/').pop();
      if (!filename) continue;

      const physicalPath = path.join(process.cwd(), "public", "uploads", filename);
      
      let compName = "Otras Evidencias";
      let resName = "Sin Resultado Asignado";
      
      if (entrega.actividad?.resultadoAprendizaje) {
         resName = entrega.actividad.resultadoAprendizaje.nombre.replace(/[<>:"/\\|?*]/g, '');
         if (entrega.actividad.resultadoAprendizaje.competencia) {
            compName = entrega.actividad.resultadoAprendizaje.competencia.nombre.replace(/[<>:"/\\|?*]/g, '');
         }
      }

      await GoogleDriveService.uploadEvidenceToDrive(
        user.id,
        physicalPath,
        `${entrega.actividad.nombre}_${filename}`,
        "application/octet-stream",
        compName,
        resName
      ).catch(e => console.error("Error sincronizando antigua evidencia:", e));

      syncCount++;
    }

    return { success: true, count: syncCount };
  } catch (error: any) {
    console.error("Error en syncAllEvidenciasToDrive:", error);
    return { success: false, error: error.message };
  }
}
