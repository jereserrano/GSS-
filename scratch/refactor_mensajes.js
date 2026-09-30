const fs = require('fs');
const path = require('path');

const filePath = path.join('c:\\GSS\\actions\\mensajes.actions.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add resolveName helper at the top (after imports)
if (!content.includes('function resolveName')) {
  content = content.replace(
    '// ─────────────────────────────────────────────',
    `const userSelectWithNames = { id: true, nombre: true, email: true, rol: true, instructor: { select: { nombres: true, apellidos: true } }, aprendiz: { select: { nombres: true, apellidos: true } } };\nfunction resolveName(u: any) {\n  if (!u) return "Usuario";\n  if (u.instructor) return \`\${u.instructor.nombres} \${u.instructor.apellidos}\`.trim();\n  if (u.aprendiz) return \`\${u.aprendiz.nombres} \${u.aprendiz.apellidos}\`.trim();\n  return u.nombre || "Usuario";\n}\n\n// ─────────────────────────────────────────────`
  );
}

// 2. Fix emisor in globales
content = content.replace(
  `emisor: { select: { nombre: true, email: true, rol: true } }`,
  `emisor: { select: userSelectWithNames }`
);

content = content.replace(
  `replyTo: { select: { id: true, contenido: true, emisor: { select: { nombre: true } } } }`,
  `replyTo: { select: { id: true, contenido: true, emisor: { select: userSelectWithNames } } }`
);

// 3. Fix emisor and receptor in directos
content = content.replace(
  `emisor: { select: { id: true, nombre: true, email: true, rol: true } }`,
  `emisor: { select: userSelectWithNames }`
);

content = content.replace(
  `receptor: { select: { id: true, nombre: true, email: true, rol: true } }`,
  `receptor: { select: userSelectWithNames }`
);

content = content.replace(
  `replyTo: { select: { id: true, contenido: true, emisor: { select: { nombre: true } } } }`,
  `replyTo: { select: { id: true, contenido: true, emisor: { select: userSelectWithNames } } }`
);

// 4. Map the results in getMensajesAction
content = content.replace(
  `return { success: true, data: { globales, directos, noLeidosPor } };`,
  `const mapMessage = (m: any) => ({\n      ...m,\n      emisor: m.emisor ? { ...m.emisor, nombre: resolveName(m.emisor) } : null,\n      receptor: m.receptor ? { ...m.receptor, nombre: resolveName(m.receptor) } : null,\n      replyTo: m.replyTo ? { ...m.replyTo, emisor: { ...m.replyTo.emisor, nombre: resolveName(m.replyTo?.emisor) } } : null,\n    });\n    return { success: true, data: { globales: globales.map(mapMessage), directos: directos.map(mapMessage), noLeidosPor } };`
);

// 5. Fix getContactosDisponiblesAction
// Replace coordAdmin
content = content.replace(
  /const coordAdmin = await prisma\.user\.findMany\(\{\s*where: \{ rol: \{ in: \["ADMINISTRADOR", "COORDINADOR", "APOYO_COORDINACION"\] \}, estado: "ACTIVO" \},\s*select: \{ id: true, nombre: true, email: true, rol: true \},\s*\}\);/g,
  `const coordAdmin = await prisma.user.findMany({ where: { rol: { in: ["ADMINISTRADOR", "COORDINADOR", "APOYO_COORDINACION"] }, estado: "ACTIVO" }, select: userSelectWithNames });`
);

content = content.replace(
  /const coordAdmin = await prisma\.user\.findMany\(\{\s*where: \{ rol: \{ in: \["ADMINISTRADOR", "COORDINADOR"\] \}, estado: "ACTIVO" \},\s*select: \{ id: true, nombre: true, email: true, rol: true \},\s*\}\);/g,
  `const coordAdmin = await prisma.user.findMany({ where: { rol: { in: ["ADMINISTRADOR", "COORDINADOR"] }, estado: "ACTIVO" }, select: userSelectWithNames });`
);

// Map coordAdmin
content = content.replace(
  /contactos = \[\.\.\.coordAdmin, \.\.\.instructores\];/g,
  `contactos = [...coordAdmin.map((u: any) => ({ ...u, nombre: resolveName(u) })), ...instructores.map((u: any) => ({ ...u, nombre: resolveName(u) }))];`
);

content = content.replace(
  /contactos = \[\.\.\.coordAdmin\.map\(\(u\) => \(\{ \.\.\.u,/g,
  `contactos = [...coordAdmin.map((u: any) => ({ ...u, nombre: resolveName(u),`
);

// Instructores raw
content = content.replace(
  /select: \{ id: true, nombre: true, email: true, rol: true \}/g,
  `select: userSelectWithNames`
);

content = content.replace(
  /include: \{ user: \{ select: \{ id: true, nombre: true, email: true, rol: true, estado: true \} \} \}/g,
  `include: { user: { select: { ...userSelectWithNames, estado: true } } }`
);

content = content.replace(
  /nombre: u\.nombre,/g,
  `nombre: resolveName(u),`
);
content = content.replace(
  /nombre: a\.user!\.nombre,/g,
  `nombre: resolveName(a.user),`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done refactoring mensajes.actions.ts');
