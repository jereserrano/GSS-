const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ficha = await prisma.ficha.findUnique({
    where: { id: "cmufp8j6e0004umucd9jr5f1q" },
    include: {
      programa: {
        include: {
          competencias: true
        }
      }
    }
  });
  console.log(JSON.stringify(ficha.programa.competencias, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
