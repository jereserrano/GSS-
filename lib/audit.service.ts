import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function logAudit({
  userId,
  modulo,
  accion,
  detalle,
  entidad,
  entidadId,
  valoresAnteriores,
  valoresNuevos
}: {
  userId?: string | null;
  modulo: string;
  accion: "CREAR" | "ACTUALIZAR" | "ELIMINAR" | "LOGIN" | "OTRO";
  detalle: string;
  entidad?: string;
  entidadId?: string;
  valoresAnteriores?: any;
  valoresNuevos?: any;
}) {
  try {
    const headersList = await headers();
    // Intenta obtener IP (frecuentemente en x-forwarded-for)
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "Desconocida";

    await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        modulo,
        accion,
        detalle,
        entidad: entidad ?? null,
        entidadId: entidadId ?? null,
        valoresAnteriores: valoresAnteriores ? JSON.parse(JSON.stringify(valoresAnteriores)) : null,
        valoresNuevos: valoresNuevos ? JSON.parse(JSON.stringify(valoresNuevos)) : null,
        ip: ip.substring(0, 45), // Límite por si acaso
      },
    });
  } catch (error) {
    // Si falla el log, no debemos tumbar la app principal, pero sí imprimirlo en servidor
    console.error("❌ Error registrando AuditLog:", error);
  }
}
