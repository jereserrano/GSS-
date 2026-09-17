const fs = require('fs');
const path = require('path');

const actionsDir = path.join(__dirname, '../actions');
const files = fs.readdirSync(actionsDir).filter(f => f.endsWith('.actions.ts'));

files.forEach(file => {
  const filePath = path.join(actionsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Find all [Model]Repository usage
  const matches = [...content.matchAll(/([A-Z][a-zA-Z0-9_]+Repository)\./g)];
  if (matches.length === 0) return;

  const usedRepos = new Set(matches.map(m => m[1]));
  
  usedRepos.forEach(repo => {
    if (!content.includes(`import { ${repo} }`)) {
      let model = repo.replace('Repository', '');
      if (repo === 'TransactionRepository') model = 'transaction';
      else model = model.charAt(0).toLowerCase() + model.slice(1);
      
      const importStatement = `import { ${repo} } from "@/repositories/${model}.repository";\n`;
      
      // Inject after "use server";
      // Support both \n and \r\n
      content = content.replace(/"use server";\r?\n/, `"use server";\n${importStatement}`);
    }
  });

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Fix imports complete.");
