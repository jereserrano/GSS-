import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function logAudit({
  userId,
  modulo,
  accion,
  detalle,
}: {
  userId: string | null;
  modulo: string;
  accion: "CREAR" | "ACTUALIZAR" | "ELIMINAR" | "LOGIN" | "OTRO";
  detalle: string;
}) {
  try {
    const headersList = await headers();
    // Intenta obtener IP (frecuentemente en x-forwarded-for)
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "Desconocida";

    await prisma.auditLog.create({
      data: {
        userId,
        modulo,
        accion,
        detalle,
        ip: ip.substring(0, 45), // Límite por si acaso
      },
    });
  } catch (error) {
    // Si falla el log, no debemos tumbar la app principal, pero sí imprimirlo en servidor
    console.error("❌ Error registrando AuditLog:", error);
  }
}
