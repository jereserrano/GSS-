const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS criterios_evaluacion (
      id VARCHAR(191) NOT NULL,
      codigo VARCHAR(191) NULL,
      descripcion TEXT NOT NULL,
      resultadoAprendizajeId VARCHAR(191) NOT NULL,
      creadoEn DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      actualizadoEn DATETIME(3) NOT NULL,
      PRIMARY KEY (id)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS instrumentos_evaluacion (
      id VARCHAR(191) NOT NULL,
      nombre VARCHAR(191) NOT NULL,
      tipo VARCHAR(191) NOT NULL,
      criterioEvaluacionId VARCHAR(191) NOT NULL,
      creadoEn DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      actualizadoEn DATETIME(3) NOT NULL,
      PRIMARY KEY (id)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);
  
  console.log('Tables created');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
