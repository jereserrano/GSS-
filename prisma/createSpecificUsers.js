const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync('123456', 10);

  // Asegurar roles
  const rolesNames = ['INSTRUCTOR', 'APRENDIZ', 'APOYO_ADMINISTRATIVO', 'COORDINADOR'];
  const rolesIds = {};
  for (const name of rolesNames) {
    const rol = await prisma.rol.upsert({
      where: { nombre: name },
      update: {},
      create: { nombre: name, descripcion: `Rol de ${name}` }
    });
    rolesIds[name] = rol.id;
  }

  // 1. Isaias (Instructor)
  let userIsaias = await prisma.user.upsert({
    where: { email: 'Isaias@sena.edu.co' },
    update: { passwordHash, rolId: rolesIds['INSTRUCTOR'] },
    create: {
      nombre: 'Isaias (Instructor)',
      email: 'Isaias@sena.edu.co',
      passwordHash,
      rolId: rolesIds['INSTRUCTOR'],
      estado: 'ACTIVO'
    }
  });

  // Asegurar registro Instructor
  const fichaAleatoria = await prisma.ficha.findFirst();
  let instructorIsaias = await prisma.instructor.upsert({
    where: { email: 'Isaias@sena.edu.co' },
    update: { userId: userIsaias.id },
    create: {
      numeroDocumento: 'INS9999999',
      nombres: 'Isaias',
      apellidos: 'Instructor',
      email: 'Isaias@sena.edu.co',
      userId: userIsaias.id,
    }
  });

  // Asignar a la ficha aleatoria como lider si existe
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
    where: { email: 'Ivan@sena.edu.co' },
    update: { passwordHash, rolId: rolesIds['APRENDIZ'] },
    create: {
      nombre: 'Ivan Rodriguez',
      email: 'Ivan@sena.edu.co',
      passwordHash,
      rolId: rolesIds['APRENDIZ'],
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
        emailSena: 'Ivan@sena.edu.co',
        fichaId: fichaAleatoria.id,
        userId: userIvan.id,
        nivelRiesgo: 'BAJO'
      }
    });
  }

  // 3. Luis (Apoyo Coordinador)
  await prisma.user.upsert({
    where: { email: 'Luis@sena.edu.co' },
    update: { passwordHash, rolId: rolesIds['APOYO_ADMINISTRATIVO'] },
    create: {
      nombre: 'Luis (Apoyo)',
      email: 'Luis@sena.edu.co',
      passwordHash,
      rolId: rolesIds['APOYO_ADMINISTRATIVO'],
      estado: 'ACTIVO'
    }
  });

  // 4. Julio (Coordinador)
  await prisma.user.upsert({
    where: { email: 'Julio@sena.edu.co' },
    update: { passwordHash, rolId: rolesIds['COORDINADOR'] },
    create: {
      nombre: 'Julio (Coordinador)',
      email: 'Julio@sena.edu.co',
      passwordHash,
      rolId: rolesIds['COORDINADOR'],
      estado: 'ACTIVO'
    }
  });

  console.log("✅ Usuarios específicos creados/actualizados exitosamente!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
