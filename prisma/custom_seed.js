const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync('123456', 10);

  // Find a random ficha to assign to them
  const fichaAleatoria = await prisma.ficha.findFirst();

  // 1. Isaias (Instructor)
  let userIsaias = await prisma.user.upsert({
    where: { email: 'isaias@sena.edu.co' },
    update: { passwordHash, rol: 'INSTRUCTOR' },
    create: {
      nombre: 'Isaias (Instructor)',
      email: 'isaias@sena.edu.co',
      passwordHash,
      rol: 'INSTRUCTOR',
      estado: 'ACTIVO'
    }
  });

  let instructorIsaias = await prisma.instructor.upsert({
    where: { email: 'isaias@sena.edu.co' },
    update: { userId: userIsaias.id },
    create: {
      numeroDocumento: 'INS9999999',
      nombres: 'Isaias',
      apellidos: 'Instructor',
      email: 'isaias@sena.edu.co',
      userId: userIsaias.id,
    }
  });

  if (fichaAleatoria) {
    await prisma.instructorFicha.upsert({
      where: {
        instructorId_fichaId: {
          instructorId: instructorIsaias.id,
          fichaId: fichaAleatoria.id
        }
      },
      update: {},
      create: {
        instructorId: instructorIsaias.id,
        fichaId: fichaAleatoria.id,
        rolFicha: 'LIDER_TECNICO'
      }
    });
  }

  // 2. Ivan (Aprendiz)
  let userIvan = await prisma.user.upsert({
    where: { email: 'ivan@sena.edu.co' },
    update: { passwordHash, rol: 'APRENDIZ' },
    create: {
      nombre: 'Ivan Rodriguez',
      email: 'ivan@sena.edu.co',
      passwordHash,
      rol: 'APRENDIZ',
      estado: 'ACTIVO'
    }
  });

  if (fichaAleatoria) {
    await prisma.aprendiz.upsert({
      where: { numeroDocumento: 'APR8888888' },
      update: { userId: userIvan.id, fichaId: fichaAleatoria.id },
      create: {
        numeroDocumento: 'APR8888888',
        nombres: 'Ivan',
        apellidos: 'Rodriguez',
        emailSena: 'ivan@sena.edu.co',
        fichaId: fichaAleatoria.id,
        userId: userIvan.id,
        nivelRiesgo: 'BAJO'
      }
    });
  }

  // 3. Luis (Apoyo Coordinacion)
  let userLuis = await prisma.user.upsert({
    where: { email: 'luis@sena.edu.co' },
    update: { passwordHash, rol: 'APOYO_COORDINACION' },
    create: {
      nombre: 'Luis (Apoyo)',
      email: 'luis@sena.edu.co',
      passwordHash,
      rol: 'APOYO_COORDINACION',
      estado: 'ACTIVO'
    }
  });

  // 4. Julio (Coordinador)
  let userJulio = await prisma.user.upsert({
    where: { email: 'julio@sena.edu.co' },
    update: { passwordHash, rol: 'COORDINADOR' },
    create: {
      nombre: 'Julio (Coordinador)',
      email: 'julio@sena.edu.co',
      passwordHash,
      rol: 'COORDINADOR',
      estado: 'ACTIVO'
    }
  });

  console.log("✅ Usuarios específicos recreados: Ivan, Luis, Isaias, Julio");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
