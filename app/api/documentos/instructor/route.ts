import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });

    let instructor = await prisma.instructor.findUnique({
      where: { userId: session.user.id },
      include: { user: true }
    });

    if (!instructor && session.user.email) {
      const byEmail = await prisma.instructor.findUnique({
        where: { email: session.user.email },
        include: { user: true }
      });
      if (byEmail) {
        instructor = await prisma.instructor.update({
          where: { id: byEmail.id },
          data: { userId: session.user.id },
          include: { user: true }
        });
      }
    }

    if (!instructor) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      });
      if (!user) return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });

      // Retornar datos iniciales seguros para usuario/funcionario
      const data = {
        direccionResidencia: "",
        municipioResidencia: "",
        eps: "",
        fondoPension: "",
        arl: "",
        fechaNacimiento: "",
        estadoCivil: "",
        telefono: "",
        fotoPerfil: user.fotoPerfil || "",
      };
      return NextResponse.json({ success: true, data });
    }

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

    let instructor = await prisma.instructor.findUnique({
      where: { userId: session.user.id }
    });

    if (!instructor && session.user.email) {
      const byEmail = await prisma.instructor.findUnique({
        where: { email: session.user.email }
      });
      if (byEmail) {
        instructor = byEmail;
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    if (!user) return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });

    if (!instructor) {
      const parts = (user.nombre || "Funcionario").trim().split(" ");
      const nombres = parts[0] || user.nombre || "Funcionario";
      const apellidos = parts.slice(1).join(" ") || "SENA";
      const cleanDoc = user.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 15);

      instructor = await prisma.instructor.create({
        data: {
          userId: user.id,
          numeroDocumento: cleanDoc,
          nombres,
          apellidos,
          email: user.email,
          telefono: body.telefono || null,
          direccionResidencia: body.direccionResidencia || null,
          municipioResidencia: body.municipioResidencia || null,
          eps: body.eps || null,
          fondoPension: body.fondoPension || null,
          arl: body.arl || null,
          estadoCivil: body.estadoCivil || null,
          fechaNacimiento: body.fechaNacimiento ? new Date(body.fechaNacimiento) : null,
        }
      });
    } else {
      await prisma.instructor.update({
        where: { id: instructor.id },
        data: {
          userId: user.id,
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
    }

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
