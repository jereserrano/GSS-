import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });

    const role = (session.user as any).role || "";
    
    // Si es Aprendiz, solo ve sus cartas
    if (role.toUpperCase().includes("APRENDIZ")) {
      const cartas = await prisma.solicitudCarta.findMany({
        where: { userId: session.user.id },
        orderBy: { creadoEn: "desc" }
      });
      return NextResponse.json({ success: true, data: cartas });
    }

    // Si es admin/coordinador ve todas
    const cartas = await prisma.solicitudCarta.findMany({
      orderBy: { creadoEn: "desc" },
      include: {
        user: { select: { nombre: true, email: true } }
      }
    });
    return NextResponse.json({ success: true, data: cartas });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });

    const body = await request.json();

    const carta = await prisma.solicitudCarta.create({
      data: {
        userId: session.user.id,
        tipoCarta: body.tipoCarta || "CERTIFICADO_ESTUDIO",
        motivo: body.motivo || "",
        dirigidoA: body.dirigidoA || "",
        estado: "PENDIENTE"
      }
    });

    return NextResponse.json({ success: true, data: carta });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
