const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Alterando tabla excusas...");
    await prisma.$executeRawUnsafe(`ALTER TABLE excusas ADD COLUMN fechaInicio DATETIME(3) NULL;`).catch(e => console.log(e.message));
    await prisma.$executeRawUnsafe(`ALTER TABLE excusas ADD COLUMN fechaFin DATETIME(3) NULL;`).catch(e => console.log(e.message));
    await prisma.$executeRawUnsafe(`ALTER TABLE excusas ADD COLUMN observacionInstructor TEXT NULL;`).catch(e => console.log(e.message));
    await prisma.$executeRawUnsafe(`ALTER TABLE excusas ADD COLUMN instructorRevisorId VARCHAR(191) NULL;`).catch(e => console.log(e.message));
    
    console.log("Agregando Foreign Key a excusas...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE excusas 
      ADD CONSTRAINT excusas_instructorRevisorId_fkey 
      FOREIGN KEY (instructorRevisorId) REFERENCES instructores(id) ON DELETE SET NULL ON UPDATE CASCADE;
    `).catch(e => console.log(e.message));

    console.log("Alterando tabla mensajes...");
    await prisma.$executeRawUnsafe(`ALTER TABLE mensajes MODIFY COLUMN receptorId VARCHAR(191) NULL;`).catch(e => console.log(e.message));
    await prisma.$executeRawUnsafe(`ALTER TABLE mensajes ADD COLUMN esGlobal TINYINT(1) NOT NULL DEFAULT 0;`).catch(e => console.log(e.message));

    console.log("Creando tabla mensajes_leidos...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE \`mensajes_leidos\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`mensajeId\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`leidoEn\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`mensajes_leidos_mensajeId_userId_key\` (\`mensajeId\`, \`userId\`),
        CONSTRAINT \`mensajes_leidos_mensajeId_fkey\` FOREIGN KEY (\`mensajeId\`) REFERENCES \`mensajes\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`mensajes_leidos_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `).catch(e => console.log(e.message));

    console.log("Migración completada exitosamente.");
  } catch (error) {
    console.error("Error durante migración:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
