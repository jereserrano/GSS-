const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ivan = await prisma.user.update({
    where: { email: 'ivan@sena.edu.co' },
    data: { rol: 'APRENDIZ' }
  });

  console.log('Usuario actualizado:', ivan.email, 'con rol:', ivan.rol);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
