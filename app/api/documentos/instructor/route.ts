import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });

    const instructor = await prisma.instructor.findUnique({
      where: { userId: session.user.id },
      include: { user: true }
    });

    if (!instructor) return NextResponse.json({ success: false, error: "Instructor no encontrado" }, { status: 404 });

    const data = {
      direccionResidencia: instructor.direccionResidencia || "",
      municipioResidencia: instructor.municipioResidencia || "",
      eps: instructor.eps || "",
      fondoPension: instructor.fondoPension || "",
      arl: instructor.arl || "",
      fechaNacimiento: instructor.fechaNacimiento ? instructor.fechaNacimiento.toISOString().split("T")[0] : "",
      estadoCivil: instructor.estadoCivil || "",
      telefono: instructor.telefono || "",
      fotoPerfil: instructor.user?.fotoPerfil || "",
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });

    const body = await request.json();

    const instructor = await prisma.instructor.findUnique({
      where: { userId: session.user.id }
    });

    if (!instructor) return NextResponse.json({ success: false, error: "Instructor no encontrado" }, { status: 404 });

    const updated = await prisma.instructor.update({
      where: { id: instructor.id },
      data: {
        direccionResidencia: body.direccionResidencia || null,
        municipioResidencia: body.municipioResidencia || null,
        eps: body.eps || null,
        fondoPension: body.fondoPension || null,
        arl: body.arl || null,
        estadoCivil: body.estadoCivil || null,
        telefono: body.telefono || null,
        fechaNacimiento: body.fechaNacimiento ? new Date(body.fechaNacimiento) : null,
      }
    });

    if (body.fotoPerfil !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { fotoPerfil: body.fotoPerfil }
      });
    }

    return NextResponse.json({ success: true, message: "Datos actualizados correctamente" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
