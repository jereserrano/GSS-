import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
      emailPersonal: user.emailPersonal || user.instructor?.emailPersonal || user.aprendiz?.emailPersonal || "",
      telefono: user.telefono || user.instructor?.telefono || user.aprendiz?.telefono || "",
      fotoPerfil: user.fotoPerfil || "",
      rol: user.rol,
      zoomVinculado: !!(user as any).zoomAccessToken,
    };

    if (user.instructor) {
      data.emailPersonal = user.instructor.emailPersonal || user.emailPersonal || "";
      data.telefono = user.instructor.telefono || user.telefono || "";
      data.direccionResidencia = user.instructor.direccionResidencia || "";
      data.municipioResidencia = user.instructor.municipioResidencia || "";
      data.eps = user.instructor.eps || "";
      data.fondoPension = user.instructor.fondoPension || "";
      data.arl = user.instructor.arl || "";
      data.fechaNacimiento = user.instructor.fechaNacimiento ? user.instructor.fechaNacimiento.toISOString().split("T")[0] : "";
      data.estadoCivil = user.instructor.estadoCivil || "";
      data.profesion = user.instructor.profesion || "";
    }

    if (user.aprendiz) {
      data.emailPersonal = user.aprendiz.emailPersonal || user.emailPersonal || "";
      data.telefono = user.aprendiz.telefono || user.telefono || "";
      data.nombres = user.aprendiz.nombres;
      data.apellidos = user.aprendiz.apellidos;
      data.ficha = user.aprendiz.ficha?.codigo || "";
      data.programa = user.aprendiz.ficha?.programa?.nombre || "";
    }

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
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

    // Obtener usuario actual con relaciones
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        instructor: true,
        aprendiz: true,
      },
    });

    if (!user) return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });

    // Actualizar datos de la tabla User (común a todos los roles)
    const userUpdate: any = {};
    if (body.fotoPerfil !== undefined) userUpdate.fotoPerfil = body.fotoPerfil;
    if (body.emailPersonal !== undefined) userUpdate.emailPersonal = body.emailPersonal?.trim() || null;
    if (body.telefono !== undefined) userUpdate.telefono = body.telefono?.trim() || null;

    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: userUpdate,
      });
    }

    const rol = (user.rol || (session.user as any).role || "").toUpperCase();

    // Sincronizar instructor si el usuario tiene relación o rol de instructor
    let instructorRecord = user.instructor;
    if (!instructorRecord && rol.includes("INSTRUCT")) {
      instructorRecord = await prisma.instructor.findFirst({
        where: {
          OR: [
            { userId: user.id },
            { email: user.email },
          ],
        },
      });
    }

    if (instructorRecord) {
      const updateData: any = {};
      if (body.telefono !== undefined) updateData.telefono = body.telefono?.trim() || null;
      if (body.emailPersonal !== undefined) updateData.emailPersonal = body.emailPersonal?.trim() || null;
      if (body.direccionResidencia !== undefined) updateData.direccionResidencia = body.direccionResidencia;
      if (body.municipioResidencia !== undefined) updateData.municipioResidencia = body.municipioResidencia;
      if (body.eps !== undefined) updateData.eps = body.eps;
      if (body.fondoPension !== undefined) updateData.fondoPension = body.fondoPension;
      if (body.arl !== undefined) updateData.arl = body.arl;
      if (body.fechaNacimiento) updateData.fechaNacimiento = new Date(body.fechaNacimiento);
      if (body.estadoCivil !== undefined) updateData.estadoCivil = body.estadoCivil;
      if (body.profesion !== undefined) updateData.profesion = body.profesion;

      if (!instructorRecord.userId) {
        updateData.userId = user.id;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.instructor.update({
          where: { id: instructorRecord.id },
          data: updateData,
        });
      }
    }

    // Sincronizar aprendiz si el usuario tiene relación o rol de aprendiz
    let aprendizRecord = user.aprendiz;
    if (!aprendizRecord && rol.includes("APRENDIZ")) {
      aprendizRecord = await prisma.aprendiz.findFirst({
        where: {
          OR: [
            { userId: user.id },
            { emailPersonal: user.email },
            { emailSena: user.email },
          ],
        },
      });
    }

    if (aprendizRecord) {
      const updateData: any = {};
      if (body.telefono !== undefined) updateData.telefono = body.telefono?.trim() || null;
      if (body.emailPersonal !== undefined) updateData.emailPersonal = body.emailPersonal?.trim() || null;

      if (!aprendizRecord.userId) {
        updateData.userId = user.id;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.aprendiz.update({
          where: { id: aprendizRecord.id },
          data: updateData,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error PUT /api/perfil:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

