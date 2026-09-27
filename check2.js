const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ 
    where: { 
      email: { in: ['admin@sena.edu.co', 'ivan@sena.edu.co'] } 
    }, 
    select: { email: true, rol: true, estado: true } 
  });
  console.log('Found:', users);
}
main().finally(() => prisma.$disconnect());
