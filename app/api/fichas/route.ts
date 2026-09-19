import { prisma } from "@/lib/prisma";
import { ok, serverError, getPaginacion, paginatedResponse } from "@/lib/api-helpers";
import { PaginacionSchema } from "@/lib/validations";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return serverError(new Error("No autenticado"));
    
    const user = session.user as any;
    const { searchParams } = new URL(request.url);
    const query = PaginacionSchema.parse(Object.fromEntries(searchParams));
    const { skip, take } = getPaginacion(query.pagina, query.tamano);

    let where: any = {};
    
    if (user.role === "APRENDIZ") {
      where.aprendices = { some: { userId: user.id } };
    } else if (user.role === "INSTRUCTOR") {
      where.instructores = { some: { instructor: { userId: user.id } } };
    }

    if (query.busqueda) {
      const searchFilter = {
        OR: [
          { codigo: { contains: query.busqueda } },
          { programa: { nombre: { contains: query.busqueda } } },
          { institucion: { nombre: { contains: query.busqueda } } },
        ]
      };
      
      if (Object.keys(where).length > 0) {
        where = { AND: [where, searchFilter] };
      } else {
        where = searchFilter;
      }
    }

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
