import { prisma } from "@/lib/prisma";
import { ok, serverError, notFound } from "@/lib/api-helpers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return serverError(new Error("No autenticado"));

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const ficha = await prisma.ficha.findUnique({
      where: { id },
      include: {
        programa: true,
        institucion: true,
        sede: true,
        instructores: {
          include: {
            instructor: true
          }
        }
      }
    });

    if (!ficha) return notFound("Ficha no encontrada");

    return ok(ficha);
  } catch (error) {
    return serverError(error);
  }
}
