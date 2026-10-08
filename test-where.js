const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const fichaIds = ['cmul86vlj001eumqg483s3p08'];
  const where = {};
  where.aprendiz = { ...where.aprendiz, fichaId: { in: fichaIds } };
  
  const riesgos = await prisma.alertaRiesgo.findMany({
    where,
    include: { aprendiz: true }
  });
  console.log('Riesgos encontrados:', riesgos.length);
}
main().finally(() => prisma.$disconnect());
