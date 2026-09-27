const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
        callback(path.join(dir, f));
      }
    }
  });
}

function fixRoles(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Remover `rol: true` de los include de Prisma
  // Ejemplos: `include: { rol: true, instructor: true }` => `include: { instructor: true }`
  content = content.replace(/,\s*rol:\s*true/g, '');
  content = content.replace(/rol:\s*true,\s*/g, '');
  // Si queda solo `include: { rol: true }`, se convierte a `include: {}`
  content = content.replace(/rol:\s*true/g, '');

  // Si `include: {}` queda vacío, puede arrojar error en Prisma, lo removemos.
  // Pero a veces está anidado. Para simplificar, remover:
  content = content.replace(/include:\s*\{\s*\}/g, '');
  
  // Limpiar posibles comas colgantes al quitar include: `where: { ... }, include: {}` -> `where: { ... },` -> error de sintaxis si es el último?
  // Prisma puede tener trailing commas. Pero si es `include: {}` lo mejor es no dejar la coma suelta.
  // Vamos a usar una expresión que lo atrape con la coma:
  content = content.replace(/,\s*include:\s*\{\s*\}/g, '');
  content = content.replace(/include:\s*\{\s*\},\s*/g, '');

  // 2. Corregir acceso a nombre de rol
  // Ej: `user?.rol?.nombre?.toUpperCase()` => `user?.rol?.toUpperCase()`
  // Ej: `user.rol?.nombre?.toUpperCase()` => `user?.rol?.toUpperCase()`
  content = content.replace(/user\?\.rol\?\.nombre\?\.toUpperCase\(\)/g, 'user?.rol?.toUpperCase()');
  content = content.replace(/user\.rol\?\.nombre\?\.toUpperCase\(\)/g, 'user?.rol?.toUpperCase()');
  
  // Casos sin toUpperCase
  content = content.replace(/user\?\.rol\?\.nombre/g, 'user?.rol');
  content = content.replace(/user\.rol\?\.nombre/g, 'user?.rol');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

const targetDir = path.join(__dirname, 'app');
walkDir(targetDir, fixRoles);
console.log('Script finalizado.');
