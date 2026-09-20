const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAssignments() {
  const user = await prisma.user.findUnique({
    where: { email: 'Isaias@sena.edu.co' },
    include: {
      instructor: {
        include: {
          fichas: {
            include: {
              ficha: {
                include: {
                  programa: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  if (!user.instructor) {
    console.log('User is not an instructor');
    return;
  }

  console.log(`Instructor: ${user.instructor.nombres} ${user.instructor.apellidos}`);
  console.log(`Total Fichas Asignadas: ${user.instructor.fichas.length}`);
  user.instructor.fichas.forEach(f => {
    console.log(`- Ficha ${f.ficha.codigo} (Programa: ${f.ficha.programa.nombre})`);
  });
}

checkAssignments()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
