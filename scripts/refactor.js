const fs = require('fs');
const path = require('path');

const actionsDir = path.join(__dirname, '../actions');
const files = fs.readdirSync(actionsDir).filter(f => f.endsWith('.actions.ts'));

const schemaMap = {
  actividades: 'actividadSchema',
  aprendices: 'aprendizSchema',
  asistencia: 'asistenciaSchema',
  competencias: 'competenciaSchema',
  entregas: 'entregaSchema',
  evaluaciones: 'evaluacionSchema',
  fichas: 'fichaSchema',
  institucion: 'institucionSchema',
  instructores: 'instructorSchema',
  programas: 'programaSchema',
  riesgos: 'alertaSchema',
  sedes: 'sedeSchema',
  seguimientos: 'visitaSchema',
  documentos: 'documentoSchema'
};

const moduleNameMap = {
  actividades: 'Actividades',
  aprendices: 'Aprendices',
  asistencia: 'Asistencia',
  competencias: 'Competencias',
  entregas: 'Entregas',
  evaluaciones: 'Evaluaciones',
  fichas: 'Fichas',
  institucion: 'Institución',
  instructores: 'Instructores',
  programas: 'Programas',
  riesgos: 'Riesgos',
  sedes: 'Sedes',
  seguimientos: 'Seguimientos',
  documentos: 'Documentos'
};

const importAuditAndSession = `
import { logAudit } from "@/lib/audit.service";
import { getServerSession } from "next-auth/next";

async function getSessionUserId() {
  try {
    const session = await getServerSession();
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      return user?.id || null;
    }
  } catch (e) {}
  return null;
}
`;

files.forEach(file => {
  const filePath = path.join(actionsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  const moduleName = file.split('.')[0];
  const schemaName = schemaMap[moduleName];
  const readableModuleName = moduleNameMap[moduleName] || moduleName;

  if (moduleName === 'docentes' || moduleName === 'notificaciones' || moduleName === 'configuracion') {
    return; // Already handled
  }

  let modified = false;

  if (!content.includes('logAudit')) {
    content = content.replace('import { prisma } from "@/lib/prisma";', 'import { prisma } from "@/lib/prisma";' + importAuditAndSession);
    modified = true;
  }
  
  if (schemaName && !content.includes(schemaName)) {
    content = content.replace('import { prisma }', `import { ${schemaName} } from "@/schemas";\nimport { prisma }`);
    modified = true;
  }

  // Refactor create functions
  const createRegex = /export async function create[A-Za-z]+\(data: any\) \{\s+try \{/g;
  content = content.replace(createRegex, (match) => {
    if (schemaName) {
      return `${match}\n    const parsed = ${schemaName}.safeParse(data);\n    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };\n    const userId = await getSessionUserId();`;
    } else {
      return `${match}\n    const userId = await getSessionUserId();`;
    }
  });

  // Refactor update functions
  const updateRegex = /export async function update[A-Za-z]+\(id: string, data: any\) \{\s+try \{/g;
  content = content.replace(updateRegex, (match) => {
    if (schemaName) {
      return `${match}\n    const parsed = ${schemaName}.safeParse(data);\n    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };\n    const userId = await getSessionUserId();`;
    } else {
      return `${match}\n    const userId = await getSessionUserId();`;
    }
  });

  // Refactor delete functions
  const deleteRegex = /export async function delete[A-Za-z]+\(id: string\) \{\s+try \{/g;
  content = content.replace(deleteRegex, (match) => {
    return `${match}\n    const userId = await getSessionUserId();`;
  });

  // Insert logAudit before revalidatePath
  const revalidateRegex = /revalidatePath\([^)]+\);/g;
  content = content.replace(revalidateRegex, (match, offset, str) => {
    // Find the closest function declaration backwards
    const beforeStr = str.substring(0, offset);
    const lastCreate = beforeStr.lastIndexOf('export async function create');
    const lastUpdate = beforeStr.lastIndexOf('export async function update');
    const lastDelete = beforeStr.lastIndexOf('export async function delete');
    
    const maxIndex = Math.max(lastCreate, lastUpdate, lastDelete);
    if (maxIndex === -1) return match; // Not in a create/update/delete

    let action = "OTRO";
    if (maxIndex === lastCreate) action = "CREAR";
    if (maxIndex === lastUpdate) action = "ACTUALIZAR";
    if (maxIndex === lastDelete) action = "ELIMINAR";

    const auditCode = `
    await logAudit({
      userId,
      modulo: "${readableModuleName}",
      accion: "${action}",
      detalle: "Acción completada exitosamente.",
    });\n    ${match}`;
    
    return auditCode;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Refactored', file);
  }
});
