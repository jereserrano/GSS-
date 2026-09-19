import { prisma } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const aprendiz = await prisma.aprendiz.findUnique({
      where: { id },
      include: {
        ficha: {
          include: {
            programa: { include: { competencias: { include: { resultadosAprendizaje: true } } } },
            institucion: true,
            sede: true,
          },
        },
        entregas: { include: { actividad: true }, orderBy: { creadoEn: "desc" }, take: 10 },
        evaluaciones: { include: { resultadoAprendizaje: true } },
        alertas: { orderBy: { fechaDeteccion: "desc" }, take: 5 },
        detallesAsistencia: { 
          include: { 
            asistencia: { include: { instructor: true } } 
          }, 
          orderBy: { asistencia: { fecha: "desc" } } 
        },
      },
    });

    if (!aprendiz) return notFound("Aprendiz no encontrado");
    return ok(aprendiz);
  } catch (error) {
    return serverError(error);
  }
}
