const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const inst = await prisma.instructor.findFirst({ where: { email: 'isaias@sena.edu.co' } });
  if (!inst) throw new Error('No instructor found');

  await prisma.instructorFicha.create({
    data: {
      instructorId: inst.id,
      fichaId: 'cmuh56xns0064umcc02ciyi5y',
      rolFicha: 'LIDER_TECNICO'
    }
  });

  console.log('Instructor assigned to Ficha!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
