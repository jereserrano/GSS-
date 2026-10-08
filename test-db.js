const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.alertaRiesgo.count();
  console.log('Total riesgos:', count);
  const alertas = await prisma.alertaRiesgo.findMany();
  console.log(alertas);
  const notificaciones = await prisma.notificacion.findMany({ where: { tipo: 'ALERTA' }});
  console.log(notificaciones);
}

main().finally(() => prisma.$disconnect());
