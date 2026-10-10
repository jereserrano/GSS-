const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users:', users.map(u => u.email));
  const fichas = await prisma.ficha.findMany();
  console.log('Fichas:', fichas.map(f => f.codigo));
  const programas = await prisma.programa.findMany();
  console.log('Programas:', programas.map(p => p.nombre));
}

main().finally(() => prisma.$disconnect());
