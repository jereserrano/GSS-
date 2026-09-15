import { prisma } from "@/lib/prisma";
import { ok, serverError, getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { PaginacionSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = PaginacionSchema.parse(Object.fromEntries(searchParams));
    const { skip, take } = getPaginacion(query.pagina, query.tamano);

    const where = query.busqueda ? {
      OR: [
        { codigo: { contains: query.busqueda } },
        { programa: { nombre: { contains: query.busqueda } } },
        { institucion: { nombre: { contains: query.busqueda } } },
      ]
    } : {};

    const [data, total] = await prisma.$transaction([
      prisma.ficha.findMany({
        where,
        skip,
        take,
        include: {
          programa: { select: { nombre: true, codigo: true } },
          institucion: { select: { nombre: true } },
          sede: { select: { nombre: true } },
          _count: { select: { aprendices: true } },
        },
        orderBy: { codigo: "desc" },
      }),
      prisma.ficha.count({ where }),
    ]);

    return ok(paginatedResponse(data, total, query.pagina, query.tamano));
  } catch (error) {
    return serverError(error);
  }
}
