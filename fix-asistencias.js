const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$executeRawUnsafe(`
      DELETE FROM asistencias 
      WHERE fichaId NOT IN (SELECT id FROM fichas);
    `);
    console.log(`Se eliminaron ${result} asistencias huerfanas.`);
  } catch (error) {
    console.error("Error limpiando BD:", error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
