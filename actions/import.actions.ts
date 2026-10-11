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
import bcrypt from "bcryptjs";

function normalizeAprendizRow(row: any) {
  if (!row || typeof row !== "object") return {};
  const cleanKeys: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    const norm = String(k)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
    cleanKeys[norm] = v;
  }

  const numDoc = cleanKeys["numerodocumento"] ?? cleanKeys["documento"] ?? cleanKeys["identificacion"] ?? cleanKeys["numdoc"] ?? cleanKeys["nodocumento"] ?? row.numeroDocumento;
  const tipoDoc = cleanKeys["tipodocumento"] ?? cleanKeys["tipodoc"] ?? row.tipoDocumento ?? "CC";
  const nombres = cleanKeys["nombres"] ?? cleanKeys["nombre"] ?? row.nombres;
  const apellidos = cleanKeys["apellidos"] ?? cleanKeys["apellido"] ?? row.apellidos;
  const emailSena = cleanKeys["emailsena"] ?? cleanKeys["correosena"] ?? cleanKeys["emailsenaeduco"] ?? row.emailSena;
  const emailPersonal = cleanKeys["emailpersonal"] ?? cleanKeys["correopersonal"] ?? cleanKeys["email"] ?? cleanKeys["correo"] ?? row.emailPersonal;
  const telefono = cleanKeys["telefono"] ?? cleanKeys["celular"] ?? cleanKeys["tel"] ?? row.telefono;
  const codigoFicha = cleanKeys["codigoficha"] ?? cleanKeys["ficha"] ?? cleanKeys["fichaid"] ?? cleanKeys["numficha"] ?? cleanKeys["idficha"] ?? row.codigoFicha;

  return {
    tipoDocumento: tipoDoc ? String(tipoDoc).trim().toUpperCase() : "CC",
    numeroDocumento: numDoc !== undefined && numDoc !== null ? String(numDoc).trim() : "",
    nombres: nombres !== undefined && nombres !== null ? String(nombres).trim() : "",
    apellidos: apellidos !== undefined && apellidos !== null ? String(apellidos).trim() : "",
    emailSena: emailSena !== undefined && emailSena !== null ? String(emailSena).trim() : "",
    emailPersonal: emailPersonal !== undefined && emailPersonal !== null ? String(emailPersonal).trim() : "",
    telefono: telefono !== undefined && telefono !== null ? String(telefono).trim() : "",
    codigoFicha: codigoFicha !== undefined && codigoFicha !== null ? String(codigoFicha).trim() : "",
  };
}

export async function importAprendicesMasivo(data: any) {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      return { success: false, error: "El archivo no contiene filas para importar." };
    }

    const normalizedData = data.map(normalizeAprendizRow).filter(
      (r) => r.numeroDocumento || r.nombres || r.apellidos || r.codigoFicha
    );

    if (normalizedData.length === 0) {
      return { success: false, error: "No se encontraron filas con datos de aprendices en el archivo." };
    }

    const parsed = importAprendicesSchema.safeParse(normalizedData);
    if (!parsed.success) {
      const fieldLabels: Record<string, string> = {
        numeroDocumento: "Número de Documento",
        nombres: "Nombres",
        apellidos: "Apellidos",
        codigoFicha: "Código de Ficha",
        emailSena: "Email SENA",
        emailPersonal: "Email Personal",
        tipoDocumento: "Tipo de Documento",
        telefono: "Teléfono",
      };

      const errorLines = parsed.error.errors.slice(0, 5).map((err) => {
        const rowIdx = typeof err.path[0] === "number" ? err.path[0] + 2 : "?";
        const fieldKey = String(err.path[1] || err.path[0]);
        const fieldLabel = fieldLabels[fieldKey] || fieldKey;
        let motive = err.message;
        if (err.code === "invalid_string" && (err as any).validation === "email") {
          motive = "no tiene un formato de correo válido (ej: usuario@correo.com)";
        } else if (err.code === "too_small") {
          motive = "es obligatorio y se encuentra vacío";
        }
        return `• Fila ${rowIdx}: El campo '${fieldLabel}' ${motive}.`;
      });

      const total = parsed.error.errors.length;
      const extra = total > 5 ? `\n... y ${total - 5} errores adicionales.` : "";

      return {
        success: false,
        error: `Inconsistencias en el archivo Excel:\n${errorLines.join("\n")}${extra}`,
        issues: parsed.error.errors,
      };
    }

    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "COORDINADOR_REGIONAL", "COORDINADOR_ACADEMICO", "COORDINADOR_SEDE"]);

    // Atomic transaction
    const result = await TransactionRepository.$transaction(async (tx) => {
      let count = 0;
      const fichasCache = new Map<string, string>();
      
      for (const row of parsed.data) {
        const codigo = String(row.codigoFicha).trim();
        if (!fichasCache.has(codigo)) {
          const ficha = await tx.ficha.findUnique({ where: { codigo } });
          if (!ficha) {
            throw new Error(`La ficha con código '${codigo}' no existe en el sistema. Asegúrate de crearla previamente.`);
          }
          
          const rol = user.rol?.toUpperCase() || "";
          if (rol === "COORDINADOR_ACADEMICO" && user.institucionId && ficha.institucionId !== user.institucionId) {
            throw new Error(`No tienes permisos para importar a la ficha ${codigo} (Institución diferente).`);
          }
          if (rol === "COORDINADOR_SEDE" && user.sedeId && ficha.sedeId !== user.sedeId) {
            throw new Error(`No tienes permisos para importar a la ficha ${codigo} (Sede diferente).`);
          }

          fichasCache.set(codigo, ficha.id);
        }

        const numDoc = String(row.numeroDocumento).trim();
        const email = (row.emailSena || row.emailPersonal || `${numDoc}@soy.sena.edu.co`).trim().toLowerCase();

        let targetUserId: string | null = null;
        if (email) {
          const existingUser = await tx.user.findUnique({ where: { email } });
          if (existingUser) {
            targetUserId = existingUser.id;
          } else {
            const passwordHash = await bcrypt.hash(numDoc, 10);
            const newUser = await tx.user.create({
              data: {
                nombre: `${row.nombres} ${row.apellidos}`.trim(),
                email,
                passwordHash,
                rol: "APRENDIZ",
                estado: "ACTIVO",
              }
            });
            targetUserId = newUser.id;
          }
        }

        await tx.aprendiz.create({
          data: {
            numeroDocumento: numDoc,
            nombres: row.nombres,
            apellidos: row.apellidos,
            fichaId: fichasCache.get(codigo)!,
            tipoDocumento: (row.tipoDocumento as any) || "CC",
            emailSena: row.emailSena || email,
            emailPersonal: row.emailPersonal || null,
            telefono: row.telefono || null,
            porcentajeAsistencia: 0.0,
            promedioAcumulado: 0.0,
            userId: targetUserId,
          }
        });
        count++;
      }
      return count;
    });

    await logAudit({
      userId: user.id,
      modulo: "Aprendices",
      accion: "OTRO",
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
      accion: "OTRO",
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
        const codigosProg = String(row.codigosProgramas).split(",").map(s => s.trim()).filter(Boolean);
        const progIds = [];
        
        for (const codigoProg of codigosProg) {
          if (!programasCache.has(codigoProg)) {
            const prog = await tx.programa.findUnique({ where: { codigo: codigoProg } });
            if (!prog) {
              throw new Error(`El programa con código ${codigoProg} no existe.`);
            }
            programasCache.set(codigoProg, prog.id);
          }
          progIds.push(programasCache.get(codigoProg)!);
        }

        await tx.competencia.create({
          data: {
            codigo: String(row.codigo),
            nombre: String(row.nombre),
            programas: {
              connect: progIds.map(id => ({ id }))
            },
            tipo: (row.tipo as any) || "TECNICA",
            duracionHoras: Number(row.duracionHoras) || 0,
          }
        });
        count++;
      }
      return count;
    });

    await logAudit({
      userId: user.id,
      modulo: "Competencias",
      accion: "OTRO",
      detalle: `Importación masiva de ${result} competencias`,
    });
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

    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR"]);

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

    await logAudit({
      userId: user.id,
      modulo: "Resultados de Aprendizaje",
      accion: "OTRO",
      detalle: `Importación masiva de ${result} resultados de aprendizaje`,
    });
    revalidatePath("/resultados-aprendizaje");
    return { success: true, count: result };
  } catch (error: any) {
    console.error("Error importing resultados:", error);
    return { success: false, error: error.message || "Error al importar resultados de aprendizaje" };
  }
}
