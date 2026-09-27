const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync('123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sena.edu.co' },
    update: { passwordHash, rol: 'ADMINISTRADOR' },
    create: {
      nombre: 'Administrador GSS',
      email: 'admin@sena.edu.co',
      passwordHash,
      rol: 'ADMINISTRADOR',
      estado: 'ACTIVO'
    }
  });

  console.log("✅ Usuario administrador asegurado: admin@sena.edu.co / 123456");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
