import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleDriveService } from "@/services/google-drive.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  try {
    await GoogleDriveService.unlinkAccount(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unlinking:", error);
    return NextResponse.json({ error: "Error al desvincular" }, { status: 500 });
  }
}
