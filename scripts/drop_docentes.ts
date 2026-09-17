import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS docentes;');
    console.log('Tabla docentes eliminada exitosamente.');
  } catch (error) {
    console.error('Error eliminando tabla docentes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
