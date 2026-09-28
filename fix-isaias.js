const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const isaiasUser = await prisma.user.findUnique({ where: { email: 'isaias@sena.edu.co' } });
  
  if (!isaiasUser) return console.log('No user Isaias');

  const isaiasInstructor = await prisma.instructor.findFirst({ where: { email: 'isaias@sena.edu.co' }});
  
  if (isaiasInstructor) {
      await prisma.instructor.update({
          where: { id: isaiasInstructor.id },
          data: { userId: isaiasUser.id }
      });
      console.log('✅ Instructor vinculado al usuario Isaias');
  } else {
      console.log('No existe el instructor Isaias. Creándolo...');
      const newInstructor = await prisma.instructor.create({
        data: {
          userId: isaiasUser.id,
          numeroDocumento: '1000000002',
          tipoDocumento: 'CC',
          nombres: 'Isaías',
          apellidos: 'Lider',
          email: 'isaias@sena.edu.co',
        }
      });
      console.log('✅ Instructor creado y vinculado.');

      // Asociar a Ficha ADSO
      const adsoFicha = await prisma.ficha.findFirst({
        where: { programa: { nombre: { contains: 'Análisis' } } }
      });

      if (adsoFicha) {
        await prisma.instructorFicha.create({
            data: { instructorId: newInstructor.id, fichaId: adsoFicha.id, rolFicha: 'LIDER_TECNICO' }
        });
        console.log('✅ Instructor asociado a ficha ADSO');
      }
  }

  // Ahora sobre el problema de Isaias:
  // "le sale el usuario sin rol, lo cambie desde admin y no tomo el cambio"
  // Vamos a forzar que el user tenga el rol 'INSTRUCTOR'.
  await prisma.user.update({
      where: { id: isaiasUser.id },
      data: { rol: 'INSTRUCTOR' }
  });
  console.log('✅ Rol INSTRUCTOR forzado en usuario Isaias.');
}
run().catch(console.error).finally(()=>prisma.$disconnect());
