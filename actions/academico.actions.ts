"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function asignarCargasMasivas(
  fichaId: string,
  asignaciones: Record<string, string> // rapId -> instructorId
) {
  try {
    await requireRole(["ADMINISTRADOR", "COORDINADOR"]);

    // Use a transaction for safety
    await prisma.$transaction(async (tx) => {
      // First, delete existing assignments for these RAPs in this Ficha
      const rapIds = Object.keys(asignaciones);
      
      await tx.asignacionCarga.deleteMany({
        where: {
          fichaId: fichaId,
          resultadoAprendizajeId: { in: rapIds }
        }
      });

      // Then create new assignments where an instructor was actually selected
      const recordsToCreate = Object.entries(asignaciones)
        .filter(([_, instructorId]) => instructorId !== "")
        .map(([rapId, instructorId]) => ({
          fichaId,
          instructorId,
          resultadoAprendizajeId: rapId
        }));

      if (recordsToCreate.length > 0) {
        await tx.asignacionCarga.createMany({
          data: recordsToCreate
        });
      }
    });

    revalidatePath("/plan-formacion");
    return { success: true };
  } catch (error: any) {
    console.error("Error al asignar cargas:", error);
    return { success: false, error: error.message || "Error interno al asignar cargas" };
  }
}
