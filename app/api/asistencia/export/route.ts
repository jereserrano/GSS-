import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as XLSX from "xlsx";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { rol: true, instructor: true }
    });

    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });

    const rolNombre = user.rol?.nombre?.toUpperCase() || "";
    const allowed = ["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"].includes(rolNombre);
    if (!allowed) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

    // Si es instructor, solo exporta sus propias asistencias
    const instructorId = user.instructor?.id;

    const { searchParams } = new URL(request.url);
    const fichaId = searchParams.get("fichaId") || undefined;
    const fechaInicio = searchParams.get("fechaInicio") || undefined;
    const fechaFin = searchParams.get("fechaFin") || undefined;

    const whereClause: any = {
      ...(instructorId ? { instructorId } : {}),
      ...(fichaId ? { fichaId } : {}),
    };

    if (fechaInicio || fechaFin) {
      whereClause.fecha = {};
      if (fechaInicio) {
        const inicio = new Date(fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        whereClause.fecha.gte = inicio;
      }
      if (fechaFin) {
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        whereClause.fecha.lte = fin;
      }
    }

    const asistencias = await prisma.asistencia.findMany({
      where: whereClause,
      orderBy: { fecha: "desc" },
      include: {
        ficha: {
          select: {
            codigo: true,
            programa: { select: { nombre: true } },
          },
        },
        instructor: { select: { nombres: true, apellidos: true } },
        detalles: {
          include: {
            aprendiz: {
              select: { nombres: true, apellidos: true, numeroDocumento: true, tipoDocumento: true }
            }
          }
        }
      },
    });

    const rows = asistencias.flatMap((a) => {
      const baseRow = {
        "Fecha": a.fecha ? new Date(a.fecha).toLocaleDateString("es-CO") : "",
        "Ficha": a.ficha?.codigo ?? "",
        "Programa": a.ficha?.programa?.nombre ?? "",
        "Instructor": `${a.instructor?.nombres ?? ""} ${a.instructor?.apellidos ?? ""}`.trim(),
        "Tema / Obs. General": (a as any).observaciones ?? "",
        "Estado Sesión": a.estado ?? "",
      };

      if (!a.detalles || a.detalles.length === 0) {
        return [{ ...baseRow, "Aprendiz": "Sin detalles", "Documento": "", "Estado Asistencia": "", "Obs. Asistencia": "" }];
      }

      return a.detalles.map(d => ({
        ...baseRow,
        "Aprendiz": `${d.aprendiz?.nombres ?? ""} ${d.aprendiz?.apellidos ?? ""}`.trim(),
        "Documento": `${d.aprendiz?.tipoDocumento ?? ""} ${d.aprendiz?.numeroDocumento ?? ""}`.trim(),
        "Estado Asistencia": d.estado ?? "",
        "Obs. Asistencia": (d as any).observaciones ?? "",
      }));
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencias");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="asistencia_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error("Error exportando asistencias:", error);
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
  }
}
