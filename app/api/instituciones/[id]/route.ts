import { prisma } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const institucion = await prisma.institucion.findUnique({
      where: { id },
      include: {
        sedes: true,
        fichas: {
          include: { programa: true },
          take: 5,
        },
      },
    });

    if (!institucion) return notFound("Institución no encontrada");
    return ok(institucion);
  } catch (error) {
    return serverError(error);
  }
}
