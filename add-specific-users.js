const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addSpecificUsers() {
  console.log('Iniciando creación de usuarios específicos...');
  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. ivan@sena.edu.co - Aprendiz de Análisis y Desarrollo de Software
  const programaADSO = await prisma.programa.findFirst({
    where: { nombre: { contains: 'Análisis y Desarrollo' } },
    include: { fichas: true }
  });

  if (programaADSO && programaADSO.fichas.length > 0) {
    const fichaAdso = programaADSO.fichas[0];
    const userIvan = await prisma.user.upsert({
      where: { email: 'ivan@sena.edu.co' },
      update: { passwordHash },
      create: {
        email: 'ivan@sena.edu.co',
        nombre: 'Iván Aprendiz',
        passwordHash,
        rol: 'APRENDIZ',
      }
    });

    const existingAprendiz = await prisma.aprendiz.findUnique({ where: { numeroDocumento: '1000000001' } });
    if (!existingAprendiz) {
      await prisma.aprendiz.create({
        data: {
          userId: userIvan.id,
          fichaId: fichaAdso.id,
          numeroDocumento: '1000000001',
          tipoDocumento: 'CC',
          nombres: 'Iván',
          apellidos: 'Aprendiz',
          emailSena: 'ivan@sena.edu.co',
        }
      });
      console.log('✅ Ivan creado como Aprendiz en ADSO');
    } else {
        await prisma.aprendiz.update({
            where: { id: existingAprendiz.id },
            data: { userId: userIvan.id, fichaId: fichaAdso.id }
        });
        console.log('ℹ️ Ivan actualizado como Aprendiz en ADSO');
    }
  }

  // 2. isaias@sena.edu.co - Instructor lider analisis y desarrollo
  if (programaADSO && programaADSO.fichas.length > 0) {
    const fichaAdso = programaADSO.fichas[0];
    const userIsaias = await prisma.user.upsert({
      where: { email: 'isaias@sena.edu.co' },
      update: { passwordHash },
      create: {
        email: 'isaias@sena.edu.co',
        nombre: 'Isaías Lider',
        passwordHash,
        rol: 'INSTRUCTOR',
      }
    });

    const existingInstructor = await prisma.instructor.findUnique({ where: { numeroDocumento: '1000000002' } });
    if (!existingInstructor) {
      const newInstructor = await prisma.instructor.create({
        data: {
          userId: userIsaias.id,
          numeroDocumento: '1000000002',
          tipoDocumento: 'CC',
          nombres: 'Isaías',
          apellidos: 'Lider',
          email: 'isaias@sena.edu.co',
        }
      });
      
      // Connect ficha
      await prisma.instructorFicha.create({
          data: { instructorId: newInstructor.id, fichaId: fichaAdso.id, rolFicha: 'LIDER_TECNICO' }
      });
      console.log('✅ Isaías creado como Instructor en ADSO');
    } else {
        await prisma.instructor.update({
            where: { id: existingInstructor.id },
            data: { userId: userIsaias.id }
        });
        console.log('ℹ️ Isaías actualizado');
    }
  }

  // 3. luis@sena.edu.co - Apoyo de coordinación (subsede cienaga)
  let sedeCienaga = await prisma.sede.findFirst({
    where: { nombre: { contains: 'cienaga' } }
  });
  if (!sedeCienaga) {
     const firstInstitucion = await prisma.institucion.findFirst();
     sedeCienaga = await prisma.sede.create({
         data: {
             nombre: 'Subsede Cienaga',
             municipio: 'Ciénaga',
             direccion: 'Ciénaga Centro',
             institucion: { connect: { id: firstInstitucion.id } }
         }
     });
     console.log('🏢 Subsede Cienaga creada');
  }

  await prisma.user.upsert({
    where: { email: 'luis@sena.edu.co' },
    update: { passwordHash, sedeId: sedeCienaga.id, rol: 'APOYO_COORDINACION' },
    create: {
      email: 'luis@sena.edu.co',
      nombre: 'Luis (Apoyo)',
      passwordHash,
      rol: 'APOYO_COORDINACION',
      sedeId: sedeCienaga.id
    }
  });
  console.log('✅ Luis creado como Apoyo de Coordinación (Ciénaga)');

  // 4. julio@sena.edu.co - Coordinador
  await prisma.user.upsert({
    where: { email: 'julio@sena.edu.co' },
    update: { passwordHash, rol: 'COORDINADOR' },
    create: {
      email: 'julio@sena.edu.co',
      nombre: 'Julio (Coordinador)',
      passwordHash,
      rol: 'COORDINADOR',
    }
  });
  console.log('✅ Julio creado como Coordinador (Admin)');

  console.log('Usuarios creados correctamente.');
}

addSpecificUsers().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
