const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const totalAprendices = await prisma.aprendiz.count();
  console.log('Total aprendices in DB:', totalAprendices);

  const aprendices = await prisma.aprendiz.findMany({ select: { nombres: true, apellidos: true, numeroDocumento: true, estado: true } });
  console.log('Aprendices:', aprendices);

  const fichas = await prisma.ficha.findMany({ select: { id: true, codigo: true } });
  console.log('Fichas:', fichas);
}
main().finally(() => prisma.$disconnect());
