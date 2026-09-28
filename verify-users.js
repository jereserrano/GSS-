const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const emails = [
    'ivan@sena.edu.co',
    'luis@sena.edu.co',
    'isaias@sena.edu.co',
    'julio@sena.edu.co'
  ];

  for (const email of emails) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        sede: true,
        aprendiz: {
          include: {
            ficha: {
              include: {
                programa: true
              }
            }
          }
        },
        instructor: {
            include: {
                fichas: true
            }
        }
      }
    });

    if (user) {
      console.log(`✅ ${user.nombre} (${user.email})`);
      console.log(`   Rol: ${user.rol}`);
      if (user.sede) console.log(`   Sede: ${user.sede.nombre}`);
      if (user.aprendiz && user.aprendiz.ficha) {
        console.log(`   Aprendiz en Ficha: ${user.aprendiz.ficha.codigo} - ${user.aprendiz.ficha.programa.nombre}`);
      }
      if (user.instructor) {
        console.log(`   Instructor con ${user.instructor.fichas.length} fichas.`);
      }
    } else {
      console.log(`❌ No encontrado: ${email}`);
    }
  }
}

verify().catch(console.error).finally(() => prisma.$disconnect());
