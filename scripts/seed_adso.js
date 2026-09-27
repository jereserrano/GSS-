const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetProgramaId = 'cmuh56x0b0003umcco5qmk9yy'; // ADSO
  const targetFichaId = 'cmuh56xns0064umcc02ciyi5y'; // Ficha ADSO

  console.log("Iniciando seed de datos para ADSO...");

  // 1. Buscar al usuario Ivan
  const email = 'ivan2@sena.edu.co';
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log("Usuario ivan2 no encontrado en la tabla User, creándolo...");
    user = await prisma.user.create({
      data: {
        email,
        nombre: 'Ivan',
        rol: 'APRENDIZ',
      }
    });
  }

  // 2. Buscar o crear el Aprendiz Ivan
  let aprendiz = await prisma.aprendiz.findFirst({ where: { emailSena: email } });
  if (!aprendiz) {
    aprendiz = await prisma.aprendiz.findFirst({ where: { userId: user.id } });
  }

  if (aprendiz) {
    console.log("Aprendiz Ivan encontrado, reasignando a la ficha objetivo...");
    aprendiz = await prisma.aprendiz.update({
      where: { id: aprendiz.id },
      data: { fichaId: targetFichaId }
    });
  } else {
    console.log("Creando aprendiz Ivan...");
    aprendiz = await prisma.aprendiz.create({
      data: {
        numeroDocumento: '1000' + Math.floor(Math.random() * 1000000),
        nombres: 'Ivan',
        apellidos: 'Sena',
        emailSena: email,
        emailPersonal: email,
        fichaId: targetFichaId,
        userId: user.id
      }
    });
  }

  // 3. Crear Competencias para ADSO
  console.log("Creando competencias para ADSO...");
  const competencias = [
    {
      codigo: '220501096',
      nombre: 'ESTABLECER REQUISITOS DE LA SOLUCIÓN DE SOFTWARE DE ACUERDO CON ESTÁNDARES Y PROCEDIMIENTO TÉCNICO',
      tipo: 'TECNICA',
      duracionHoras: 180,
    },
    {
      codigo: '220501094',
      nombre: 'CONSTRUIR EL SOFTWARE DE ACUERDO CON EL DISEÑO Y EL PLAN',
      tipo: 'TECNICA',
      duracionHoras: 240,
    }
  ];

  const createdCompetencias = [];
  for (const c of competencias) {
    let comp = await prisma.competencia.findUnique({ where: { codigo: c.codigo } });
    if (!comp) {
      comp = await prisma.competencia.create({
        data: {
          ...c,
          programas: { connect: { id: targetProgramaId } }
        }
      });
    } else {
      // Conectar al programa si no estaba
      await prisma.competencia.update({
        where: { id: comp.id },
        data: { programas: { connect: { id: targetProgramaId } } }
      });
    }
    createdCompetencias.push(comp);
  }

  // 4. Crear Resultados de Aprendizaje
  console.log("Creando RA...");
  const ras = [
    {
      codigo: 'RA1-96',
      nombre: 'Elaborar instrumentos de recolección de información según requerimientos',
      competenciaId: createdCompetencias[0].id,
      fase: 'ANALISIS'
    },
    {
      codigo: 'RA2-96',
      nombre: 'Representar el proceso de negocio de acuerdo con técnicas de modelado',
      competenciaId: createdCompetencias[0].id,
      fase: 'ANALISIS'
    },
    {
      codigo: 'RA1-94',
      nombre: 'Construir bases de datos según diseño',
      competenciaId: createdCompetencias[1].id,
      fase: 'EJECUCION'
    },
    {
      codigo: 'RA2-94',
      nombre: 'Codificar la solución de software según diseño',
      competenciaId: createdCompetencias[1].id,
      fase: 'EJECUCION'
    }
  ];

  const createdRAs = [];
  for (const ra of ras) {
    let existRa = await prisma.resultadoAprendizaje.findFirst({ where: { codigo: ra.codigo } });
    if (!existRa) existRa = await prisma.resultadoAprendizaje.create({ data: ra });
    createdRAs.push(existRa);
  }

  // 5. Crear Actividades para la Ficha
  console.log("Creando actividades...");
  const actividades = [
    {
      fichaId: targetFichaId,
      nombre: 'Taller de levantamiento de requisitos',
      descripcion: 'Diseñar entrevista y encuesta',
      tipo: 'TALLER',
      fechaVencimiento: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      resultadoAprendizajeId: createdRAs[0].id
    },
    {
      fichaId: targetFichaId,
      nombre: 'Modelo Entidad Relación',
      descripcion: 'Modelar base de datos para el proyecto',
      tipo: 'PROYECTO',
      fechaVencimiento: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // Ya vencida
      resultadoAprendizajeId: createdRAs[2].id
    },
    {
      fichaId: targetFichaId,
      nombre: 'Prototipo Front-End',
      descripcion: 'Codificar la interfaz en React',
      tipo: 'TALLER',
      fechaVencimiento: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
      resultadoAprendizajeId: createdRAs[3].id
    }
  ];

  const createdActividades = [];
  for (const act of actividades) {
    let existAct = await prisma.actividad.findFirst({ where: { nombre: act.nombre, fichaId: targetFichaId } });
    if (!existAct) existAct = await prisma.actividad.create({ data: act });
    createdActividades.push(existAct);
  }

  // 6. Entregas para Ivan
  console.log("Creando entregas y evaluaciones para Ivan...");
  
  // Taller 1 - Entregado y Calificado A
  await prisma.entrega.upsert({
    where: { actividadId_aprendizId: { actividadId: createdActividades[0].id, aprendizId: aprendiz.id } },
    update: { estado: 'CALIFICADA', calificacion: 'A', retroalimentacion: 'Excelente trabajo.' },
    create: {
      actividadId: createdActividades[0].id,
      aprendizId: aprendiz.id,
      estado: 'CALIFICADA',
      calificacion: 'A',
      retroalimentacion: 'Excelente trabajo.',
      urlArchivo: 'https://ejemplo.com/archivo.pdf',
      fechaEvaluacion: new Date()
    }
  });

  // Taller 2 (MER) - Entregado y Calificado D
  await prisma.entrega.upsert({
    where: { actividadId_aprendizId: { actividadId: createdActividades[1].id, aprendizId: aprendiz.id } },
    update: { estado: 'CALIFICADA', calificacion: 'D', retroalimentacion: 'Te faltó normalizar las tablas.' },
    create: {
      actividadId: createdActividades[1].id,
      aprendizId: aprendiz.id,
      estado: 'CALIFICADA',
      calificacion: 'D',
      retroalimentacion: 'Te faltó normalizar las tablas.',
      urlArchivo: 'https://ejemplo.com/mer.pdf',
      fechaEvaluacion: new Date()
    }
  });

  // Taller 3 - Pendiente
  await prisma.entrega.upsert({
    where: { actividadId_aprendizId: { actividadId: createdActividades[2].id, aprendizId: aprendiz.id } },
    update: { estado: 'PENDIENTE', calificacion: null },
    create: {
      actividadId: createdActividades[2].id,
      aprendizId: aprendiz.id,
      estado: 'PENDIENTE'
    }
  });

  // 7. Evaluar el RA completo de Ivan
  // Si en el Taller 1 sacó A, el RA1-96 está APROBADO
  await prisma.evaluacionAprendiz.upsert({
    where: { aprendizId_resultadoAprendizajeId: { aprendizId: aprendiz.id, resultadoAprendizajeId: createdRAs[0].id } },
    update: { juicio: 'APROBADO', fecha: new Date() },
    create: {
      aprendizId: aprendiz.id,
      resultadoAprendizajeId: createdRAs[0].id,
      juicio: 'APROBADO',
      fecha: new Date()
    }
  });

  // RA1-94 NO APROBADO por el MER
  await prisma.evaluacionAprendiz.upsert({
    where: { aprendizId_resultadoAprendizajeId: { aprendizId: aprendiz.id, resultadoAprendizajeId: createdRAs[2].id } },
    update: { juicio: 'DEFICIENTE', fecha: new Date() },
    create: {
      aprendizId: aprendiz.id,
      resultadoAprendizajeId: createdRAs[2].id,
      juicio: 'DEFICIENTE',
      fecha: new Date()
    }
  });

  console.log("¡Todo listo! El sistema tiene datos reales para ADSO y el aprendiz Ivan.");
}

main()
  .catch(e => console.error("Error:", e))
  .finally(async () => await prisma.$disconnect());
