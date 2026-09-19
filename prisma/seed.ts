const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { fakerES: faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando el poblamiento de base de datos...');

  // 1. ROLES
  const roles = ['ADMINISTRADOR', 'COORDINADOR', 'INSTRUCTOR', 'APRENDIZ'];
  const rolesIds = {};
  for (const rolName of roles) {
    const rol = await prisma.rol.upsert({
      where: { nombre: rolName },
      update: {},
      create: { nombre: rolName, descripcion: `Rol de ${rolName.toLowerCase()}` }
    });
    rolesIds[rolName] = rol.id;
  }
  console.log('✅ Roles asegurados');

  // 2. INSTITUCIÓN Y SEDE
  const institucion = await prisma.institucion.upsert({
    where: { nit: '899999239-1' },
    update: {},
    create: {
      nit: '899999239-1',
      nombre: 'SENA Regional Magdalena',
      municipio: 'Santa Marta',
      departamento: 'Magdalena',
      direccion: 'Avenida Ferrocarril # 27 - 97',
      telefono: '4201010',
      email: 'contacto@sena.edu.co'
    }
  });

  const sede = await prisma.sede.create({
    data: {
      nombre: 'Centro de Logística y Promoción Ecoturística',
      institucionId: institucion.id,
      direccion: 'Avenida Ferrocarril # 27 - 97',
      municipio: 'Santa Marta',
      esPrincipal: true
    }
  });
  console.log('✅ Institución y Sede creadas');

  // 3. PROGRAMAS
  const programasNombres = [
    { codigo: faker.string.numeric(7), nombre: 'Análisis y Desarrollo de Software', nivel: 'TECNOLOGO' },
    { codigo: faker.string.numeric(7), nombre: 'Gestión Logística', nivel: 'TECNOLOGO' },
    { codigo: faker.string.numeric(7), nombre: 'Sistemas', nivel: 'TECNICO' },
    { codigo: faker.string.numeric(7), nombre: 'Cocina', nivel: 'TECNICO' },
  ];
  const programas = [];
  for (const p of programasNombres) {
    const prg = await prisma.programa.create({
      data: {
        codigo: p.codigo,
        nombre: p.nombre,
        nivelFormacion: p.nivel,
      }
    });
    programas.push(prg);
    
    // Crear competencias para cada programa
    const comp1 = await prisma.competencia.create({
      data: {
        codigo: `COMP-${faker.string.numeric(4)}`,
        nombre: `Competencia Técnica en ${p.nombre}`,
        programaId: prg.id,
        tipo: 'TECNICA',
        duracionHoras: 120
      }
    });
    const comp2 = await prisma.competencia.create({
      data: {
        codigo: `COMP-${faker.string.numeric(4)}`,
        nombre: `Competencia Transversal (Ética/Bilingüismo) ${p.nombre}`,
        programaId: prg.id,
        tipo: 'TRANSVERSAL',
        duracionHoras: 48
      }
    });
    
    // Crear RA para competencias
    await prisma.resultadoAprendizaje.createMany({
      data: [
        { codigo: `RAP-1`, nombre: 'Comprender conceptos básicos', competenciaId: comp1.id, fase: 'ANALISIS' },
        { codigo: `RAP-2`, nombre: 'Aplicar conocimientos técnicos', competenciaId: comp1.id, fase: 'EJECUCION' },
        { codigo: `RAP-1`, nombre: 'Comunicarse en inglés', competenciaId: comp2.id, fase: 'EJECUCION' }
      ]
    });
  }
  console.log('✅ Programas, Competencias y RAP creados');

  // 4. INSTRUCTORES (10)
  const instructores = [];
  const passwordHash = bcrypt.hashSync('123456', 10);

  for (let i = 1; i <= 10; i++) {
    const nombres = faker.person.firstName();
    const apellidos = faker.person.lastName();
    const email = `instructor${i}@sena.edu.co`;
    
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash },
      create: {
        nombre: `${nombres} ${apellidos}`,
        email,
        passwordHash,
        rolId: rolesIds['INSTRUCTOR'],
        institucionId: institucion.id
      }
    });

    const docNumber = faker.string.numeric(10);
    const instructor = await prisma.instructor.upsert({
      where: { numeroDocumento: docNumber },
      update: { userId: user.id },
      create: {
        numeroDocumento: docNumber,
        tipoDocumento: 'CC',
        nombres,
        apellidos,
        email,
        telefono: faker.phone.number(),
        profesion: faker.person.jobTitle(),
        userId: user.id
      }
    });
    instructores.push(instructor);
  }
  console.log('✅ 10 Instructores creados');

  // 5. FICHAS (10)
  const fichas = [];
  for (let i = 0; i < 10; i++) {
    const fechaInicio = faker.date.past({ years: 1 });
    const fechaFin = new Date(fechaInicio);
    fechaFin.setFullYear(fechaFin.getFullYear() + 2); // 2 años de formación

    const programa = programas[faker.number.int({ min: 0, max: programas.length - 1 })];

    const ficha = await prisma.ficha.create({
      data: {
        codigo: faker.string.numeric(7),
        programaId: programa.id,
        institucionId: institucion.id,
        sedeId: sede.id,
        fechaInicio,
        fechaFin,
        jornada: faker.helpers.arrayElement(['MAÑANA', 'TARDE', 'NOCHE', 'FINES DE SEMANA'])
      }
    });
    fichas.push(ficha);

    // Asignar entre 2 y 3 instructores a esta ficha
    const numInstructores = faker.number.int({ min: 2, max: 3 });
    const shuffledInstructores = [...instructores].sort(() => 0.5 - Math.random());
    const seleccionados = shuffledInstructores.slice(0, numInstructores);

    for (let j = 0; j < seleccionados.length; j++) {
      const inst = seleccionados[j];
      let rol = "LIDER_TECNICO";
      if (j === 1) rol = "TRANSVERSAL";
      if (j === 2) rol = "BASICA";

      await prisma.instructorFicha.create({
        data: {
          fichaId: ficha.id,
          instructorId: inst.id,
          rolFicha: rol
        }
      });

      // Crear Actividades (2 por instructor en esta ficha)
      const actividadesNombres = [
        `Taller práctico de ${faker.hacker.noun()}`,
        `Foro: Importancia de ${faker.company.buzzNoun()}`,
        `Evaluación de conocimientos - ${faker.commerce.department()}`,
        `Evidencia de producto: ${faker.hacker.ingverb()}`
      ];

      for (let j = 0; j < 2; j++) {
        await prisma.actividad.create({
          data: {
            fichaId: ficha.id,
            instructorId: inst.id,
            nombre: faker.helpers.arrayElement(actividadesNombres),
            descripcion: faker.lorem.paragraph(),
            tipo: faker.helpers.arrayElement(['TALLER', 'FORO', 'QUIZ']),
            fechaInicio: faker.date.recent({ days: 30 }),
            fechaVencimiento: faker.date.soon({ days: 15 }),
            estado: 'ACTIVA'
          }
        });
      }
      
      // Crear una asistencia pasada para probar
      const totalAprendices = 15;
      const faltas = faker.number.int({ min: 0, max: 3 });
      const excusas = faker.number.int({ min: 0, max: 2 });
      const presentes = totalAprendices - faltas - excusas;
      
      await prisma.asistencia.create({
        data: {
          fichaId: ficha.id,
          instructorId: inst.id,
          fecha: faker.date.recent({ days: 10 }),
          totalPresentes: presentes,
          totalFaltas: faltas,
          totalExcusas: excusas,
          estado: 'REGISTRADA',
          observaciones: 'Sesión registrada automáticamente por el seeder.'
        }
      });
    }
  }
  console.log('✅ 10 Fichas creadas con instructores, actividades y asistencia');

  // 6. APRENDICES (15 por Ficha = 150)
  let aprendizCounter = 1;
  for (const ficha of fichas) {
    for (let i = 0; i < 15; i++) {
      const nombres = faker.person.firstName();
      const apellidos = faker.person.lastName();
      const email = `aprendiz${aprendizCounter}@sena.edu.co`;
      
      const user = await prisma.user.upsert({
        where: { email },
        update: { passwordHash },
        create: {
          nombre: `${nombres} ${apellidos}`,
          email,
          passwordHash,
          rolId: rolesIds['APRENDIZ'],
          institucionId: institucion.id
        }
      });

      const docNumber = faker.string.numeric(10);
      const aprendiz = await prisma.aprendiz.upsert({
        where: { numeroDocumento: docNumber },
        update: { userId: user.id },
        create: {
          numeroDocumento: docNumber,
          tipoDocumento: faker.helpers.arrayElement(['CC', 'TI']),
          nombres,
          apellidos,
          emailPersonal: faker.internet.email(),
          emailSena: email,
          telefono: faker.phone.number(),
          fichaId: ficha.id,
          userId: user.id,
          nivelRiesgo: faker.helpers.weightedArrayElement([
            { weight: 70, value: 'BAJO' },
            { weight: 20, value: 'MEDIO' },
            { weight: 10, value: 'ALTO' }
          ]),
          porcentajeAsistencia: faker.number.float({ min: 60, max: 100, fractionDigits: 1 }),
          promedioAcumulado: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 })
        }
      });

      // Crear Alerta si es riesgo medio o alto
      if (aprendiz.nivelRiesgo !== 'BAJO') {
        const motivos = [
          'Inasistencias consecutivas sin justificación',
          'Bajo rendimiento en resultados de aprendizaje',
          'Problemas de conectividad reportados',
          'Posible deserción escolar',
          'Falta de entrega de evidencias críticas'
        ];
        await prisma.alertaRiesgo.create({
          data: {
            aprendizId: aprendiz.id,
            motivo: faker.helpers.arrayElement(motivos),
            nivel: aprendiz.nivelRiesgo,
            gestionada: faker.datatype.boolean()
          }
        });
      }

      aprendizCounter++;
    }
  }
  console.log('✅ 150 Aprendices creados y alertas generadas');

  console.log('🎉 Poblamiento de base de datos finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
