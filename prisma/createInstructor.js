const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync('123456', 10);

  // 1. Institucion
  const institucion = await prisma.institucion.upsert({
    where: { nit: '899999034-1' },
    update: {},
    create: {
      nit: '899999034-1',
      nombre: 'SENA Regional Magdalena',
      municipio: 'Santa Marta',
      departamento: 'Magdalena',
      direccion: 'Av. Ferrocarril'
    }
  });

  // 2. Sede
  let sede = await prisma.sede.findFirst({ where: { institucionId: institucion.id } });
  if (!sede) {
    sede = await prisma.sede.create({
      data: {
        nombre: 'Centro de Logística y Promoción Ecoturística',
        institucionId: institucion.id,
        esPrincipal: true
      }
    });
  }

  // 3. Programa
  const programa = await prisma.programa.upsert({
    where: { codigo: '228118' },
    update: {},
    create: {
      codigo: '228118',
      nombre: 'Análisis y Desarrollo de Software'
    }
  });

  // 4. Ficha
  const ficha = await prisma.ficha.upsert({
    where: { codigo: '2700123' },
    update: {},
    create: {
      codigo: '2700123',
      programaId: programa.id,
      institucionId: institucion.id,
      sedeId: sede.id,
      fechaInicio: new Date('2024-01-01'),
      fechaFin: new Date('2026-01-01')
    }
  });

  // 5. User Instructor
  const user = await prisma.user.upsert({
    where: { email: 'isaias@sena.edu.co' },
    update: { passwordHash, rol: 'INSTRUCTOR' },
    create: {
      nombre: 'Isaias',
      email: 'isaias@sena.edu.co',
      passwordHash,
      rol: 'INSTRUCTOR'
    }
  });

  // 6. Instructor Record
  const instructor = await prisma.instructor.upsert({
    where: { email: 'isaias@sena.edu.co' },
    update: { userId: user.id },
    create: {
      numeroDocumento: '1000123456',
      nombres: 'Isaias',
      apellidos: 'Sena',
      email: 'isaias@sena.edu.co',
      userId: user.id
    }
  });

  // 7. Relación Instructor-Ficha
  await prisma.instructorFicha.upsert({
    where: {
      instructorId_fichaId: {
        instructorId: instructor.id,
        fichaId: ficha.id
      }
    },
    update: {},
    create: {
      instructorId: instructor.id,
      fichaId: ficha.id
    }
  });

  console.log("✅ Instructor Isaias creado con Ficha (2700123) asociada.");
  console.log("   - Correo: isaias@sena.edu.co");
  console.log("   - Clave: 123456");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
