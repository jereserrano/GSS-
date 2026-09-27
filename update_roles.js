const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE users MODIFY COLUMN rol ENUM('ADMINISTRADOR', 'INSTRUCTOR', 'APRENDIZ', 'SECRETARIO', 'APOYO_COORDINACION', 'COORDINADOR', 'COORDINADOR_REGIONAL', 'SUBDIRECTOR_REGIONAL', 'COORDINADOR_SEDE') DEFAULT 'APRENDIZ';`);
  await prisma.$executeRawUnsafe(`UPDATE users SET rol = 'APOYO_COORDINACION' WHERE email = 'luis@sena.edu.co';`);
  console.log('Role added and user updated in DB');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
