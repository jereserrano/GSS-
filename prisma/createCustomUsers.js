const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync('123456', 10);
  const institucion = await prisma.institucion.findFirst();

  if (!institucion) {
    console.log("Error: No se encontró la institución base.");
    return;
  }

  // Iván como Aprendiz
  const ivan = await prisma.user.upsert({
    where: { email: 'ivan@sena.edu.co' },
    update: { passwordHash, rol: 'APRENDIZ' },
    create: {
      nombre: 'Iván Aprendiz',
      email: 'ivan@sena.edu.co',
      passwordHash,
      rol: 'APRENDIZ',
      estado: 'ACTIVO',
      institucionId: institucion.id
    }
  });

  // Luis como Apoyo de Coordinación (Secretario)
  const luis = await prisma.user.upsert({
    where: { email: 'luis@sena.edu.co' },
    update: { passwordHash, rol: 'SECRETARIO' },
    create: {
      nombre: 'Luis Apoyo Coordinación',
      email: 'luis@sena.edu.co',
      passwordHash,
      rol: 'SECRETARIO',
      estado: 'ACTIVO',
      institucionId: institucion.id
    }
  });

  // Isaías como Instructor
  const isaias = await prisma.user.upsert({
    where: { email: 'isaias@sena.edu.co' },
    update: { passwordHash, rol: 'INSTRUCTOR' },
    create: {
      nombre: 'Isaías Instructor',
      email: 'isaias@sena.edu.co',
      passwordHash,
      rol: 'INSTRUCTOR',
      estado: 'ACTIVO',
      institucionId: institucion.id
    }
  });

  console.log("✅ Usuarios personalizados creados exitosamente:");
  console.log("   - ivan@sena.edu.co (Aprendiz)");
  console.log("   - luis@sena.edu.co (Apoyo Coordinación / Secretario)");
  console.log("   - isaias@sena.edu.co (Instructor)");
  console.log("   Clave para todos: 123456");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
