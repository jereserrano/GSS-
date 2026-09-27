import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { instructorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.rol !== "ADMINISTRADOR" && user.rol !== "COORDINADOR" && user.rol !== "APOYO_COORDINACION")) {
      return NextResponse.json({ success: false, error: "Rol no autorizado" }, { status: 403 });
    }

    const { instructorId } = params;

    const instructorRaw = await prisma.instructor.findUnique({
      where: { id: instructorId },
      include: {
        user: {
          include: { documentoEmpleados: { orderBy: { creadoEn: "desc" } } }
        }
      }
    });

    if (!instructorRaw) {
      return NextResponse.json({ success: false, error: "Instructor no encontrado" }, { status: 404 });
    }

    const data = {
      id: instructorRaw.id,
      userId: instructorRaw.userId,
      nombres: instructorRaw.nombres,
      apellidos: instructorRaw.apellidos,
      cedula: instructorRaw.numeroDocumento,
      email: instructorRaw.email,
      telefono: instructorRaw.telefono,
      profesion: instructorRaw.profesion,
      direccionResidencia: instructorRaw.direccionResidencia || "",
      municipioResidencia: instructorRaw.municipioResidencia || "",
      eps: instructorRaw.eps || "",
      fondoPension: instructorRaw.fondoPension || "",
      arl: instructorRaw.arl || "",
      fechaNacimiento: instructorRaw.fechaNacimiento ? instructorRaw.fechaNacimiento.toISOString() : "",
      estadoCivil: instructorRaw.estadoCivil || "",
      documentos: instructorRaw.user?.documentoEmpleados || []
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error GET /api/documentos/admin/[id]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
