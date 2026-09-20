const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
  await prisma.$executeRawUnsafe('CREATE TABLE `_CompetenciaToPrograma` ( `A` VARCHAR(191) NOT NULL, `B` VARCHAR(191) NOT NULL, UNIQUE INDEX `_CompetenciaToPrograma_AB_unique` (`A`, `B`), INDEX `_CompetenciaToPrograma_B_index` (`B`) ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
  await prisma.$executeRawUnsafe('ALTER TABLE `_CompetenciaToPrograma` ADD CONSTRAINT `_CompetenciaToPrograma_A_fkey` FOREIGN KEY (`A`) REFERENCES `competencias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;');
  await prisma.$executeRawUnsafe('ALTER TABLE `_CompetenciaToPrograma` ADD CONSTRAINT `_CompetenciaToPrograma_B_fkey` FOREIGN KEY (`B`) REFERENCES `programas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;');
  
  // Migrar los datos existentes! Así el usuario no pierde las asociaciones
  await prisma.$executeRawUnsafe('INSERT INTO `_CompetenciaToPrograma` (`A`, `B`) SELECT `id`, `programaId` FROM `competencias` WHERE `programaId` IS NOT NULL;');
  
  await prisma.$executeRawUnsafe('ALTER TABLE `competencias` DROP FOREIGN KEY `competencias_programaId_fkey`;');
  await prisma.$executeRawUnsafe('ALTER TABLE `competencias` DROP COLUMN `programaId`;');
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
  console.log('DB updated!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
