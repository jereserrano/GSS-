const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const isaias = await prisma.user.findUnique({
    where: { email: 'isaias@sena.edu.co' },
    include: {
      instructor: {
        include: {
          fichas: true
        }
      }
    }
  });
  console.log(JSON.stringify(isaias, null, 2));
}
run().catch(console.error).finally(()=>prisma.$disconnect());
