const fs = require('fs');
const path = require('path');

const actionsDir = path.join(__dirname, '../actions');
const reposDir = path.join(__dirname, '../repositories');

if (!fs.existsSync(reposDir)) {
  fs.mkdirSync(reposDir);
}

const files = fs.readdirSync(actionsDir).filter(f => f.endsWith('.actions.ts'));

files.forEach(file => {
  const filePath = path.join(actionsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Find all prisma.[model] calls
  const matches = [...content.matchAll(/prisma\.([a-zA-Z0-9_]+)\./g)];
  if (matches.length === 0 && !content.includes('prisma.$transaction')) return;

  let imports = new Set();
  
  // Replace prisma.[model]. with [Model]Repository.
  matches.forEach(match => {
    const model = match[1];
    if (model === '$transaction') return;
    const repoName = model.charAt(0).toUpperCase() + model.slice(1) + 'Repository';
    
    // Create the repo file
    const repoFilePath = path.join(reposDir, `${model}.repository.ts`);
    if (!fs.existsSync(repoFilePath)) {
      const repoContent = `import { prisma } from "@/lib/prisma";\n\nexport const ${repoName} = prisma.${model};\n`;
      fs.writeFileSync(repoFilePath, repoContent, 'utf8');
    }
    
    imports.add(`import { ${repoName} } from "@/repositories/${model}.repository";`);
    
    // Replace in content
    const regex = new RegExp(`prisma\\.${model}\\.`, 'g');
    content = content.replace(regex, `${repoName}.`);
  });

  // Handle $transaction
  if (content.includes('prisma.$transaction')) {
    const repoFilePath = path.join(reposDir, `transaction.repository.ts`);
    if (!fs.existsSync(repoFilePath)) {
      const repoContent = `import { prisma } from "@/lib/prisma";\n\nexport const TransactionRepository = prisma;\n`;
      fs.writeFileSync(repoFilePath, repoContent, 'utf8');
    }
    imports.add(`import { TransactionRepository } from "@/repositories/transaction.repository";`);
    content = content.replace(/prisma\.\$transaction/g, 'TransactionRepository.$transaction');
  }

  // Inject imports after 'use server';
  if (imports.size > 0) {
    const importString = Array.from(imports).join('\n') + '\n';
    content = content.replace('"use server";\n', `"use server";\n\n${importString}`);
    
    // Remove import { prisma } if no longer used
    if (!content.includes('prisma.')) {
      content = content.replace(/import \{ prisma \} from "@\/lib\/prisma";\n?/g, '');
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Repository Refactoring complete.");
