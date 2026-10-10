import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        instructor: true,
        aprendiz: {
          include: {
            ficha: {
              include: {
                programa: true
              }
            }
          }
        }
      }
    });

    if (!user) return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });

    const data: any = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      fotoPerfil: user.fotoPerfil || "",
      rol: user.rol,
      zoomVinculado: !!user.zoomAccessToken,
    };

    if (user.instructor) {
      data.emailPersonal = user.instructor.emailPersonal || "";
      data.direccionResidencia = user.instructor.direccionResidencia || "";
      data.municipioResidencia = user.instructor.municipioResidencia || "";
      data.eps = user.instructor.eps || "";
      data.fondoPension = user.instructor.fondoPension || "";
      data.arl = user.instructor.arl || "";
      data.fechaNacimiento = user.instructor.fechaNacimiento ? user.instructor.fechaNacimiento.toISOString().split("T")[0] : "";
      data.estadoCivil = user.instructor.estadoCivil || "";
      data.telefono = user.instructor.telefono || "";
      data.profesion = user.instructor.profesion || "";
    }

    if (user.aprendiz) {
      data.emailPersonal = user.aprendiz.emailPersonal || "";
      data.nombres = user.aprendiz.nombres;
      data.apellidos = user.aprendiz.apellidos;
      data.telefono = user.aprendiz.telefono || "";
      data.ficha = user.aprendiz.ficha?.codigo || "";
      data.programa = user.aprendiz.ficha?.programa?.nombre || "";
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error GET /api/perfil:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    
    // Actualizar datos del User
    const userUpdate: any = {};
    if (body.fotoPerfil !== undefined) userUpdate.fotoPerfil = body.fotoPerfil;
    
    // Actualizamos al usuario
    await prisma.user.update({
      where: { id: session.user.id },
      data: userUpdate
    });

    // Si es instructor y mandan datos adicionales
    const rol = (session.user as any).role?.toUpperCase() || "";
    if (rol.includes("INSTRUCT")) {
      const updateData: any = {};
      if (body.telefono !== undefined) updateData.telefono = body.telefono;
      if (body.emailPersonal !== undefined) updateData.emailPersonal = body.emailPersonal;
      if (body.direccionResidencia !== undefined) updateData.direccionResidencia = body.direccionResidencia;
      if (body.municipioResidencia !== undefined) updateData.municipioResidencia = body.municipioResidencia;
      if (body.eps !== undefined) updateData.eps = body.eps;
      if (body.fondoPension !== undefined) updateData.fondoPension = body.fondoPension;
      if (body.arl !== undefined) updateData.arl = body.arl;
      if (body.fechaNacimiento) updateData.fechaNacimiento = new Date(body.fechaNacimiento);
      if (body.estadoCivil !== undefined) updateData.estadoCivil = body.estadoCivil;
      if (body.profesion !== undefined) updateData.profesion = body.profesion;

      if (Object.keys(updateData).length > 0) {
        await prisma.instructor.update({
          where: { userId: session.user.id },
          data: updateData
        });
      }
    } else if (rol.includes("APRENDIZ")) {
      const updateData: any = {};
      if (body.telefono !== undefined) updateData.telefono = body.telefono;
      if (body.emailPersonal !== undefined) updateData.emailPersonal = body.emailPersonal;
      
      if (Object.keys(updateData).length > 0) {
        await prisma.aprendiz.update({
          where: { userId: session.user.id },
          data: updateData
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error PUT /api/perfil:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
