const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync('123456', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sena.edu.co' },
    update: { passwordHash, rol: 'ADMINISTRADOR' },
    create: {
      nombre: 'Administrador',
      email: 'admin@sena.edu.co',
      passwordHash: passwordHash,
      rol: 'ADMINISTRADOR',
      estado: 'ACTIVO'
    }
  });

  const ivan = await prisma.user.upsert({
    where: { email: 'ivan@sena.edu.co' },
    update: { passwordHash, rol: 'ADMINISTRADOR' },
    create: {
      nombre: 'Ivan',
      email: 'ivan@sena.edu.co',
      passwordHash: passwordHash,
      rol: 'ADMINISTRADOR',
      estado: 'ACTIVO'
    }
  });

  console.log('Usuarios creados:', admin.email, ivan.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
