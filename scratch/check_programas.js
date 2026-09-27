const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const programas = await prisma.programa.findMany();
  console.log(programas);
}

main().catch(console.error).finally(() => prisma.$disconnect());
