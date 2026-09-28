const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function randomGrade() {
  return parseFloat((Math.random() * (5.0 - 3.5) + 3.5).toFixed(1));
}

function randomBool(probability) {
  return Math.random() < probability;
}

async function addGradesToIvan() {
  console.log('Buscando al aprendiz Iván...');
  const userIvan = await prisma.user.findUnique({
    where: { email: 'ivan@sena.edu.co' },
    include: { aprendiz: true }
  });

  if (!userIvan || !userIvan.aprendiz) {
    console.error('No se encontró a Iván.');
    process.exit(1);
  }

  const aprendizId = userIvan.aprendiz.id;
  const fichaId = userIvan.aprendiz.fichaId;

  console.log('Buscando RAs, Actividades y Asistencias de la ficha...');

  // 1. Evaluaciones de Resultados de Aprendizaje (RAs)
  const ras = await prisma.resultadoAprendizaje.findMany({
    where: {
      competencia: {
        programas: {
          some: {
            fichas: {
              some: { id: fichaId }
            }
          }
        }
      }
    }
  });

  console.log(`Encontrados ${ras.length} RAs para calificar.`);
  
  let countEv = 0;
  for (const rap of ras) {
    const existing = await prisma.evaluacionAprendiz.findFirst({
        where: { aprendizId, resultadoAprendizajeId: rap.id }
    });
    if (!existing) {
        await prisma.evaluacionAprendiz.create({
            data: {
                aprendizId,
                resultadoAprendizajeId: rap.id,
                nota: randomGrade(),
                observaciones: 'Buen trabajo en clase.',
                fecha: new Date(),
                juicio: 'APROBADO'
            }
        });
        countEv++;
    }
  }
  console.log(`✅ ${countEv} evaluaciones de RAs agregadas a Iván.`);

  // 2. Entregas de Actividades
  const actividades = await prisma.actividad.findMany({
    where: {
      resultadoAprendizaje: {
        competencia: {
          programas: {
            some: {
              fichas: {
                some: { id: fichaId }
              }
            }
          }
        }
      }
    }
  });

  console.log(`Encontradas ${actividades.length} Actividades para entregar.`);
  
  let countEntregas = 0;
  for (const act of actividades) {
    const existing = await prisma.entrega.findFirst({
        where: { aprendizId, actividadId: act.id }
    });
    
    const entregado = randomBool(0.85);
    
    if (!existing && entregado) {
        await prisma.entrega.create({
            data: {
                aprendizId,
                actividadId: act.id,
                calificacion: randomGrade().toString(),
                fechaEntrega: act.fechaVencimiento,
                estado: 'CALIFICADA',
                comentario: 'Entrega a tiempo y completa.'
            }
        });
        countEntregas++;
    } else if (!existing) {
         await prisma.entrega.create({
            data: {
                aprendizId,
                actividadId: act.id,
                estado: 'PENDIENTE'
            }
        });
    }
  }
  console.log(`✅ ${countEntregas} entregas agregadas a Iván.`);

  // 3. Asistencias
  const asistencias = await prisma.asistencia.findMany({
    where: { fichaId: fichaId }
  });

  console.log(`Encontradas ${asistencias.length} sesiones de asistencia.`);

  let countAsis = 0;
  for (const asis of asistencias) {
      const existing = await prisma.registroAsistencia.findFirst({
          where: { aprendizId, asistenciaId: asis.id }
      });

      if (!existing) {
          const asistio = randomBool(0.9);
          await prisma.registroAsistencia.create({
              data: {
                  aprendizId,
                  asistenciaId: asis.id,
                  estado: asistio ? 'PRESENTE' : 'AUSENTE'
              }
          });
          countAsis++;
      }
  }
  console.log(`✅ ${countAsis} registros de asistencia agregados a Iván.`);

  console.log('¡Todas las calificaciones y registros han sido asignados a Iván de forma exitosa!');
}

addGradesToIvan().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
