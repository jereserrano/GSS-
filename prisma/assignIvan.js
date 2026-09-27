const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'ivan@sena.edu.co';
  
  // Buscar el programa de Análisis y Desarrollo
  const programa = await prisma.programa.findFirst({
    where: { nombre: { contains: 'Análisis y Desarrollo' } }
  });

  if (!programa) {
    console.error('No se encontró el programa Análisis y Desarrollo');
    return;
  }

  // Buscar una ficha de este programa
  let ficha = await prisma.ficha.findFirst({
    where: { programaId: programa.id }
  });

  // Si no hay ficha, creamos una
  if (!ficha) {
    console.log('No hay ficha para este programa, creando una...');
    const institucion = await prisma.institucion.findFirst();
    const sede = await prisma.sede.findFirst();
    
    ficha = await prisma.ficha.create({
      data: {
        codigo: 'FICHA-ADSO-' + Math.floor(Math.random() * 1000),
        programaId: programa.id,
        institucionId: institucion.id,
        sedeId: sede?.id,
        fechaInicio: new Date(),
        fechaFin: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
        jornada: 'DIURNA'
      }
    });
  }

  // Asignar al aprendiz a esta ficha
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.error('No se encontró el usuario ivan@sena.edu.co');
    return;
  }

  const result = await prisma.aprendiz.updateMany({
    where: { userId: user.id },
    data: { fichaId: ficha.id }
  });

  if (result.count > 0) {
    console.log(`✅ Aprendiz ivan@sena.edu.co asignado a la ficha ${ficha.codigo} del programa ${programa.nombre}`);
  } else {
    console.error('No se pudo actualizar el aprendiz. ¿Existe en la tabla Aprendiz?');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
