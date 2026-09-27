const fs = require('fs');
let content = fs.readFileSync('schemas/index.ts', 'utf8');

// Replace z.enum([]) with z.string()
content = content.replace(/z\.enum\(\[\]\)/g, "z.string()");

fs.writeFileSync('schemas/index.ts', content);
console.log('Fixed zod enums');
