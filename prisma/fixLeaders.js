const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const isaiasEmail = 'isaias@sena.edu.co';
  
  // Encontrar el instructor Isaias
  const userIsaias = await prisma.user.findUnique({ where: { email: isaiasEmail } });
  const isaias = await prisma.instructor.findUnique({ where: { userId: userIsaias.id } });

  if (!isaias) {
    console.error('No se encontró al instructor Isaias.');
    return;
  }

  // Buscar la ficha de ADSO (la misma donde está Ivan)
  const programa = await prisma.programa.findFirst({
    where: { nombre: { contains: 'Análisis y Desarrollo' } }
  });

  const ficha = await prisma.ficha.findFirst({
    where: { programaId: programa.id }
  });

  if (!ficha) {
    console.error('No se encontró la ficha de ADSO.');
    return;
  }

  // Eliminar cualquier otro instructor de la ficha
  await prisma.instructorFicha.deleteMany({
    where: {
      fichaId: ficha.id,
      instructorId: { not: isaias.id }
    }
  });

  // Asegurar que Isaias sea el LIDER_TECNICO
  await prisma.instructorFicha.upsert({
    where: {
      instructorId_fichaId: {
        instructorId: isaias.id,
        fichaId: ficha.id
      }
    },
    update: {
      rolFicha: 'LIDER_TECNICO'
    },
    create: {
      instructorId: isaias.id,
      fichaId: ficha.id,
      rolFicha: 'LIDER_TECNICO'
    }
  });

  console.log(`✅ Se limpiaron los demás instructores. Isaias ahora es el único LIDER_TECNICO de la ficha ${ficha.codigo}.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
