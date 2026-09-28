const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const fichas = await prisma.ficha.findMany({ include: { _count: { select: { aprendices: true } } } });
  console.log(fichas);
}
run().catch(console.error).finally(()=>prisma.$disconnect());
