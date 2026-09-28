const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const res = await prisma.ficha.findMany({ include: { programa: { include: { competencias: true } } } });
  console.log(JSON.stringify(res, null, 2));
}
run().catch(console.error).finally(()=>prisma.$disconnect());
