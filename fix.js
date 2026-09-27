const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const orig = content;
      content = content.replace(/import\s+\{\s*authOptions\s*\}\s+from\s+["']@\/app\/api\/auth\/\[\.\.\.nextauth\]\/route["'];/g, 'import { authOptions } from "@/lib/auth";');
      if (fullPath.replace(/\\/g, '/').endsWith('actions/user.actions.ts')) {
        content = content.replace('export const STATIC_ROLES = {', 'const STATIC_ROLES = {');
      }
      if (content !== orig) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', fullPath);
      }
    }
  }
}

replaceInDir('c:/GSS/app');
replaceInDir('c:/GSS/actions');
