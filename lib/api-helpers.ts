import { NextResponse } from "next/server";

/** Helper para devolver respuestas JSON consistentes desde las API routes */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function badRequest(message: string, errors?: unknown) {
  return NextResponse.json({ ok: false, message, errors }, { status: 400 });
}

export function notFound(message = "Recurso no encontrado") {
  return NextResponse.json({ ok: false, message }, { status: 404 });
}

export function unauthorized() {
  return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
}

export function serverError(error: unknown) {
  const message = error instanceof Error ? error.message : "Error interno del servidor";
  console.error("[API Error]", error);
  return NextResponse.json({ ok: false, message }, { status: 500 });
}

/** Helper para calcular paginación de Prisma */
export function getPaginacion(pagina: number, tamano: number) {
  return {
    skip: (pagina - 1) * tamano,
    take: tamano,
  };
}

/** Helper para construir la respuesta paginada estándar */
export function paginatedResponse<T>(data: T[], total: number, pagina: number, tamano: number) {
  return {
    data,
    total,
    page: pagina,
    pageSize: tamano,
    totalPages: Math.ceil(total / tamano),
  };
}
