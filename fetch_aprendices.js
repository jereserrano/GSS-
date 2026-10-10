const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.user.deleteMany({
    where: {
      rol: 'APRENDIZ',
      email: {
        endsWith: '@sena.edu.co',
        not: 'ivan@sena.edu.co'
      }
    }
  });
  console.log(`Borrados ${deleted.count} usuarios.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
