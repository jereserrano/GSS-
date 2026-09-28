const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const user = await prisma.user.findUnique({ where: { email: 'isaias@sena.edu.co' } });
  console.log(user);
}
run().catch(console.error).finally(()=>prisma.$disconnect());
