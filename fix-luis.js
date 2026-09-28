const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixFichas() {
  const sedeCienaga = await prisma.sede.findFirst({
    where: { nombre: { contains: 'cienaga' } }
  });

  if (!sedeCienaga) {
      console.log('No se encontró la sede Ciénaga.');
      process.exit(1);
  }

  const result = await prisma.ficha.updateMany({
      data: {
          sedeId: sedeCienaga.id
      }
  });

  console.log(`✅ ${result.count} fichas actualizadas y asignadas a la Sede Ciénaga.`);
}

fixFichas().catch(console.error).finally(() => prisma.$disconnect());
