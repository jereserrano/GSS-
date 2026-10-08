import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`roles\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`nombre\` VARCHAR(191) NOT NULL,
        \`descripcion\` TEXT NULL,
        \`permisos\` JSON NULL,
        \`creadoEn\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`actualizadoEn\` DATETIME(3) NOT NULL,
        UNIQUE INDEX \`roles_nombre_key\`(\`nombre\`),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    console.log("Roles table created successfully.");
  } catch (error) {
    console.error("Error executing raw SQL:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
