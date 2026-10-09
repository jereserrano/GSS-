const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id VARCHAR(191) PRIMARY KEY,
      email VARCHAR(191) NOT NULL,
      token VARCHAR(191) NOT NULL UNIQUE,
      expires DATETIME(3) NOT NULL,
      creadoEn DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    );
  `);
  console.log('TABLE CREATED');
}

createTable()
  .catch(e => console.log('ERROR:', e.message))
  .finally(() => prisma.$disconnect());
