import { prisma } from "@/lib/prisma";
import { ok, serverError, getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { PaginacionSchema } from "@/lib/validations";
import { Estado } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = PaginacionSchema.parse(Object.fromEntries(searchParams));
    const { skip, take } = getPaginacion(query.pagina, query.tamano);

    const where = {
      ...(query.busqueda ? {
        OR: [
          { nombre: { contains: query.busqueda } },
          { nit: { contains: query.busqueda } },
          { municipio: { contains: query.busqueda } },
        ]
      } : {}),
      ...(query.estado ? { estado: query.estado as Estado } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.institucion.findMany({
        where,
        skip,
        take,
        include: { sedes: { select: { id: true, nombre: true } } },
        orderBy: { nombre: "asc" },
      }),
      prisma.institucion.count({ where }),
    ]);

    return ok(paginatedResponse(data, total, query.pagina, query.tamano));
  } catch (error) {
    return serverError(error);
  }
}
