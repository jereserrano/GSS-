import { prisma } from "@/lib/prisma";
import { ok, serverError, getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { PaginacionSchema } from "@/lib/validations";
import { NivelRiesgo } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = PaginacionSchema.parse(Object.fromEntries(searchParams));
    const { skip, take } = getPaginacion(query.pagina, query.tamano);

    const where = {
      ...(query.busqueda ? {
        OR: [
          { nombres: { contains: query.busqueda } },
          { apellidos: { contains: query.busqueda } },
          { numeroDocumento: { contains: query.busqueda } },
        ]
      } : {}),
      ...(query.nivelRiesgo ? { nivelRiesgo: query.nivelRiesgo.toUpperCase() as NivelRiesgo } : {}),
      ...(query.fichaId ? { fichaId: query.fichaId } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.aprendiz.findMany({
        where,
        skip,
        take,
        include: {
          ficha: {
            include: {
              programa: { select: { nombre: true, codigo: true } },
              institucion: { select: { nombre: true } },
              sede: { select: { nombre: true } },
            },
          },
        },
        orderBy: [{ nivelRiesgo: "desc" }, { apellidos: "asc" }],
      }),
      prisma.aprendiz.count({ where }),
    ]);

    return ok(paginatedResponse(data, total, query.pagina, query.tamano));
  } catch (error) {
    return serverError(error);
  }
}
