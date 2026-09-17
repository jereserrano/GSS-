"use server";

import { UserRepository } from "@/repositories/user.repository";
import { AprendizRepository } from "@/repositories/aprendiz.repository";
import { InstructorRepository } from "@/repositories/instructor.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";
import { importAprendicesSchema, importInstructoresSchema, importCompetenciasSchema, importResultadosSchema } from "@/schemas";
import { logAudit } from "@/lib/audit.service";
import { getServerSession } from "next-auth/next";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function importAprendicesMasivo(data: any) {
  try {
    const parsed = importAprendicesSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Estructura de datos inválida", issues: parsed.error.errors };
    }

    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR"]);

    // Atomic transaction
    const result = await TransactionRepository.$transaction(async (tx) => {
      let count = 0;
      const fichasCache = new Map<string, string>();
      
      for (const row of parsed.data) {
        const codigo = String(row.codigoFicha);
        if (!fichasCache.has(codigo)) {
          const ficha = await tx.ficha.findUnique({ where: { codigo } });
          if (!ficha) {
            throw new Error(`La ficha con código ${codigo} no existe en el sistema.`);
          }
          fichasCache.set(codigo, ficha.id);
        }

        await tx.aprendiz.create({
          data: {
            numeroDocumento: String(row.numeroDocumento),
            nombres: row.nombres,
            apellidos: row.apellidos,
            fichaId: fichasCache.get(codigo)!,
            tipoDocumento: (row.tipoDocumento as any) || "CC",
            emailSena: row.emailSena || null,
            emailPersonal: row.emailPersonal || null,
            telefono: row.telefono || null,
          }
        });
        count++;
      }
      return count;
    });

    await logAudit({
      userId: user.id,
      modulo: "Aprendices",
      accion: "IMPORTAR",
      detalle: `Se importaron ${result} aprendices masivamente.`,
    });
    
    revalidatePath("/aprendices");
    revalidatePath("/fichas");
    return { success: true, count: result };
  } catch (error: any) {
    console.error("Error importing aprendices:", error);
    // Error typical from Prisma unique constraint
    if (error.code === 'P2002') {
      return { success: false, error: "Datos duplicados encontrados (número de documento ya existe). Operación abortada." };
    }
    return { success: false, error: error.message || "Error al importar aprendices" };
  }
}

export async function importInstructoresMasivo(data: any) {
  try {
    const parsed = importInstructoresSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Estructura de datos inválida", issues: parsed.error.errors };
    }

    const user = await requireRole(["ADMINISTRADOR"]);

    const result = await TransactionRepository.$transaction(async (tx) => {
      let count = 0;
      for (const row of parsed.data) {
        await tx.instructor.create({
          data: {
            numeroDocumento: String(row.numeroDocumento),
            nombres: row.nombres,
            apellidos: row.apellidos,
            email: row.email,
            tipoDocumento: (row.tipoDocumento as any) || "CC",
            telefono: row.telefono || null,
            profesion: row.profesion || null,
          }
        });
        count++;
      }
      return count;
    });

    await logAudit({
      userId: user.id,
      modulo: "Instructores",
      accion: "IMPORTAR",
      detalle: `Se importaron ${result} instructores masivamente.`,
    });
    
    revalidatePath("/instructores");
    return { success: true, count: result };
  } catch (error: any) {
    console.error("Error importing instructores:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Datos duplicados encontrados (email o documento ya existe). Operación abortada." };
    }
    return { success: false, error: error.message || "Error al importar instructores" };
  }
}

export async function importCompetenciasMasivo(data: any) {
  try {
    const parsed = importCompetenciasSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Estructura de datos inválida", issues: parsed.error.errors };
    }

    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR"]);

    const result = await TransactionRepository.$transaction(async (tx) => {
      let count = 0;
      const programasCache = new Map<string, string>();
      
      for (const row of parsed.data) {
        const codigoProg = String(row.codigoPrograma);
        if (!programasCache.has(codigoProg)) {
          const prog = await tx.programa.findUnique({ where: { codigo: codigoProg } });
          if (!prog) {
            throw new Error(`El programa con código ${codigoProg} no existe.`);
          }
          programasCache.set(codigoProg, prog.id);
        }

        await tx.competencia.create({
          data: {
            codigo: String(row.codigo),
            nombre: String(row.nombre),
            programaId: programasCache.get(codigoProg)!,
            tipo: (row.tipo as any) || "TECNICA",
            duracionHoras: Number(row.duracionHoras) || 0,
          }
        });
        count++;
      }
      return count;
    });

    await logAudit(user.id, "COMPETENCIAS", "IMPORT", `Importación masiva de ${result} competencias`);
    revalidatePath("/competencias");
    return { success: true, count: result };
  } catch (error: any) {
    console.error("Error importing competencias:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Datos duplicados encontrados (código de competencia ya existe). Operación abortada." };
    }
    return { success: false, error: error.message || "Error al importar competencias" };
  }
}

export async function importResultadosMasivo(data: any) {
  try {
    const parsed = importResultadosSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Estructura de datos inválida", issues: parsed.error.errors };
    }

    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);

    const result = await TransactionRepository.$transaction(async (tx) => {
      let count = 0;
      const competenciasCache = new Map<string, string>();
      
      for (const row of parsed.data) {
        const codigoComp = String(row.codigoCompetencia);
        if (!competenciasCache.has(codigoComp)) {
          const comp = await tx.competencia.findUnique({ where: { codigo: codigoComp } });
          if (!comp) {
            throw new Error(`La competencia con código ${codigoComp} no existe.`);
          }
          competenciasCache.set(codigoComp, comp.id);
        }

        await tx.resultadoAprendizaje.create({
          data: {
            codigo: String(row.codigo),
            nombre: String(row.nombre),
            competenciaId: competenciasCache.get(codigoComp)!,
            fase: (row.fase as any) || "ANALISIS",
          }
        });
        count++;
      }
      return count;
    });

    await logAudit(user.id, "RESULTADOS_APRENDIZAJE", "IMPORT", `Importación masiva de ${result} resultados de aprendizaje`);
    revalidatePath("/resultados-aprendizaje");
    return { success: true, count: result };
  } catch (error: any) {
    console.error("Error importing resultados:", error);
    return { success: false, error: error.message || "Error al importar resultados de aprendizaje" };
  }
}
