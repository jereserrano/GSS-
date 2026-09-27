import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
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

    let instructoresFilter: any = {};

    // Si es Apoyo, solo ver instructores asignados a fichas de su sede
    if (user.rol === "APOYO_COORDINACION") {
      if (!user.sedeId) {
        // Fallback global if test user doesn't have a sedeId
        if (!user.institucionId) {
          instructoresFilter = {};
        } else {
          instructoresFilter = {
            fichas: { some: { ficha: { institucionId: user.institucionId } } }
          };
        }
      } else {
        instructoresFilter = {
          fichas: { some: { ficha: { sedeId: user.sedeId } } }
        };
      }
    }

    const instructoresRaw = await prisma.instructor.findMany({
      where: instructoresFilter,
      include: {
        user: {
          include: { documentoEmpleados: true }
        }
      },
      orderBy: { nombres: "asc" }
    });

    const data = instructoresRaw.map((inst: any) => {
      const docs = inst.user?.documentoEmpleados || [];
      const requiredDocs = ["CEDULA", "HOJA_DE_VIDA", "CERTIFICADO_ESTUDIO"];
      let uploadedDocsCount = 0;
      
      requiredDocs.forEach(req => {
        if (docs.some((d: any) => d.tipoDocumento === req && d.estado !== "RECHAZADO")) {
          uploadedDocsCount++;
        }
      });

      let estadoDocumentacion = "Incompleto";
      if (uploadedDocsCount === requiredDocs.length) estadoDocumentacion = "Completo";
      if (uploadedDocsCount === 0) estadoDocumentacion = "Sin Iniciar";

      return {
        id: inst.id,
        userId: inst.userId,
        cedula: inst.numeroDocumento,
        nombre: `${inst.nombres} ${inst.apellidos}`,
        email: inst.email,
        telefono: inst.telefono || "N/A",
        profesion: inst.profesion || "No especificada",
        estado: inst.estado,
        estadoDocumentacion,
        documentosSubidos: uploadedDocsCount,
        documentosRequeridos: requiredDocs.length
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error GET /api/documentos/admin:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
