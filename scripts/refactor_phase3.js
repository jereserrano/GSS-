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

files.forEach(file => {
  const filePath = path.join(actionsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already refactored
  if (content.includes('requireRole')) return;

  const moduleName = file.split('.')[0];
  const schemaName = schemaMap[moduleName];

  // RBAC import
  content = content.replace('import { getServerSession } from "next-auth/next";', 
    'import { getServerSession } from "next-auth/next";\nimport { requireRole, requireInstitutionAccess } from "@/lib/rbac";');

  // Fix 'any' in signature
  if (schemaName) {
    content = content.replace(/export async function create([A-Za-z]+)\(data: any\)/g, 
      `export async function create$1(data: z.infer<typeof ${schemaName}>)`);
    content = content.replace(/export async function update([A-Za-z]+)\(id: string, data: any\)/g, 
      `export async function update$1(id: string, data: z.infer<typeof ${schemaName}>)`);
  }

  // Inject requireRole instead of getSessionUserId
  const requireRoleCode = `\n    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);`;
  content = content.replace(/const userId = await getSessionUserId\(\);/g, requireRoleCode);

  // Fix logAudit
  content = content.replace(/userId,/g, 'userId: user.id,');
  content = content.replace(/userId\n/g, 'userId: user.id,\n');

  // Fix zod import
  if (schemaName && !content.includes('import { z }')) {
    content = content.replace(`import { ${schemaName} } from "@/schemas";`, 
      `import { ${schemaName} } from "@/schemas";\nimport { z } from "zod";`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Refactoring Phase 3 complete.");
