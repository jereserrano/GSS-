const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update Ivan
  try {
    await prisma.user.update({
      where: { email: 'ivan@sena.edu.co' },
      data: { rol: 'APRENDIZ' }
    });
    console.log('Ivan actualizado a APRENDIZ');
  } catch(e) {}

  // Check if Institucion exists
  let inst = await prisma.institucion.findFirst();
  if (!inst) {
    inst = await prisma.institucion.create({
      data: {
        nit: '899999239-1',
        nombre: 'Centro Logístico del Magdalena',
        municipio: 'Santa Marta',
        departamento: 'Magdalena',
        direccion: 'Av 1 calle 13',
        telefono: '4103341',
        email: 'sena@sena.edu.co',
        rector: 'Jose Leonardo'
      }
    });
  }

  // Create Sede
  let sede = await prisma.sede.findFirst();
  if (!sede) {
    sede = await prisma.sede.create({
      data: {
        nombre: 'Sede Principal',
        institucionId: inst.id,
        direccion: 'Av 1 calle 13',
        esPrincipal: true
      }
    });
  }

  // Create Programa
  let programa = await prisma.programa.findFirst();
  if (!programa) {
    programa = await prisma.programa.create({
      data: {
        codigo: 'ADSO-2026',
        nombre: 'Análisis y Desarrollo de Software',
        nivelFormacion: 'TECNOLOGO',
        duracion: 24
      }
    });
  }

  // Create Ficha
  let ficha = await prisma.ficha.findFirst();
  if (!ficha) {
    ficha = await prisma.ficha.create({
      data: {
        codigo: '2803214',
        programaId: programa.id,
        institucionId: inst.id,
        sedeId: sede.id,
        fechaInicio: new Date('2026-01-15'),
        fechaFin: new Date('2027-12-15'),
        jornada: 'DIURNA'
      }
    });
  }

  // Create 10 aprendices
  for(let i = 1; i <= 10; i++) {
    const email = `aprendiz${i}@sena.edu.co`;
    const doc = `10000000${i}`;
    
    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          nombre: `Aprendiz ${i}`,
          email: email,
          passwordHash: 'dummy',
          rol: 'APRENDIZ'
        }
      });
    }

    let ap = await prisma.aprendiz.findUnique({ where: { numeroDocumento: doc } });
    if (!ap) {
      await prisma.aprendiz.create({
        data: {
          numeroDocumento: doc,
          nombres: `Juan ${i}`,
          apellidos: `Perez ${i}`,
          fichaId: ficha.id,
          userId: user.id
        }
      });
    }
  }

  console.log('Seed completo');
}

main().catch(console.error).finally(() => prisma.$disconnect());
