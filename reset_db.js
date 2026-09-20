const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando limpieza profunda de la base de datos...');

  // Desactivar restricciones de FK
  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);

  // Borrar todas las tablas excepto Roles, Sede, Institucion
  console.log('🧹 Vaciando tablas operativas...');
  const models = [
    'notificacion', 'alertaRiesgo', 'entrega', 'detalleAsistencia', 'asistencia', 
    'actividad', 'evaluacion', 'instructorFicha', 'aprendiz', 'instructor', 'ficha', 
    'resultadoAprendizaje', 'competencia', 'programa'
  ];

  for (const model of models) {
    if (prisma[model]) {
      await prisma[model].deleteMany({});
    }
  }

  // Las tablas implícitas n-m pueden necesitar truncate o se vacían con deleteMany de los lados
  try { await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`_CompetenciaToPrograma\`;`); } catch (e) {}
  
  await prisma.user.deleteMany({
    where: {
      email: {
        notIn: ['admin@sena.edu.co', 'Isaias@sena.edu.co', 'Ivan@sena.edu.co', 'Luis@sena.edu.co', 'Julio@sena.edu.co']
      }
    }
  });

  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);
  console.log('✅ Tablas vaciadas correctamente');

  // Asegurar Roles Básicos
  const roles = await prisma.rol.findMany();
  const rolesIds = {};
  roles.forEach(r => rolesIds[r.nombre] = r.id);

  if (!rolesIds['APOYO_COORDINACION']) {
    const r = await prisma.rol.create({ data: { nombre: 'APOYO_COORDINACION', descripcion: 'Apoyo Coordinacion' }});
    rolesIds['APOYO_COORDINACION'] = r.id;
  }
  if (!rolesIds['COORDINADOR']) {
    const r = await prisma.rol.create({ data: { nombre: 'COORDINADOR', descripcion: 'Coordinador' }});
    rolesIds['COORDINADOR'] = r.id;
  }
  if (!rolesIds['ADMINISTRADOR']) {
    const r = await prisma.rol.create({ data: { nombre: 'ADMINISTRADOR', descripcion: 'Administrador' }});
    rolesIds['ADMINISTRADOR'] = r.id;
  }
  if (!rolesIds['INSTRUCTOR']) {
    const r = await prisma.rol.create({ data: { nombre: 'INSTRUCTOR', descripcion: 'Instructor' }});
    rolesIds['INSTRUCTOR'] = r.id;
  }
  if (!rolesIds['APRENDIZ']) {
    const r = await prisma.rol.create({ data: { nombre: 'APRENDIZ', descripcion: 'Aprendiz' }});
    rolesIds['APRENDIZ'] = r.id;
  }

  // 1. Institución y Sede
  let institucion = await prisma.institucion.findFirst();
  if (!institucion) {
    institucion = await prisma.institucion.create({
      data: { nit: '899999239-1', nombre: 'SENA', municipio: 'Santa Marta', departamento: 'Magdalena', direccion: 'Av 1', telefono: '123', email: 'sena@sena.edu.co' }
    });
  }
  let sede = await prisma.sede.findFirst();
  if (!sede) {
    sede = await prisma.sede.create({
      data: { nombre: 'Sede Principal', institucionId: institucion.id, direccion: 'Av 1', municipio: 'Santa Marta', esPrincipal: true }
    });
  }

  // 2. Usuarios clave
  console.log('👤 Configurando usuarios...');
  const usersToCreate = [
    { email: 'admin@sena.edu.co', pass: 'Admin2026#', rol: 'ADMINISTRADOR', nombre: 'Administrador' },
    { email: 'Isaias@sena.edu.co', pass: '123456', rol: 'INSTRUCTOR', nombre: 'Isaias (Instructor)' },
    { email: 'Ivan@sena.edu.co', pass: '123456', rol: 'APRENDIZ', nombre: 'Ivan (Aprendiz)' },
    { email: 'Luis@sena.edu.co', pass: '123456', rol: 'APOYO_COORDINACION', nombre: 'Luis (Apoyo Coordinacion)' },
    { email: 'Julio@sena.edu.co', pass: '123456', rol: 'COORDINADOR', nombre: 'Julio (Coordinador Academico)' },
    { email: 'OtroInstructor1@sena.edu.co', pass: '123456', rol: 'INSTRUCTOR', nombre: 'Maria (Instructora)' },
    { email: 'OtroInstructor2@sena.edu.co', pass: '123456', rol: 'INSTRUCTOR', nombre: 'Carlos (Instructor)' }
  ];

  const userIds = {};
  for (const u of usersToCreate) {
    const passwordHash = bcrypt.hashSync(u.pass, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, rolId: rolesIds[u.rol], nombre: u.nombre },
      create: {
        nombre: u.nombre,
        email: u.email,
        passwordHash,
        rolId: rolesIds[u.rol],
        institucionId: institucion.id
      }
    });
    userIds[u.email] = user.id;

    if (u.rol === 'INSTRUCTOR') {
      await prisma.instructor.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          numeroDocumento: Math.floor(Math.random() * 1000000000).toString(),
          tipoDocumento: 'CC',
          nombres: u.nombre.split(' ')[0],
          apellidos: 'SENA',
          email: u.email,
          telefono: '3000000000',
          profesion: 'Profesional',
          userId: user.id
        }
      });
    }
  }
  console.log('✅ Usuarios creados');

  // 3. Programas y Fichas
  console.log('📚 Configurando Programas y Fichas...');
  const programasData = [
    { codigo: 'PROG-ADSI', nombre: 'Analisis y desarollo en sistemas de informacion', fichaCodigo: '3173430', lider: 'Isaias@sena.edu.co' },
    { codigo: 'PROG-SOLD', nombre: 'Soldadura', fichaCodigo: '3148450', lider: 'OtroInstructor1@sena.edu.co' },
    { codigo: 'PROG-ENFE', nombre: 'Enfermeria', fichaCodigo: '3126543', lider: 'OtroInstructor2@sena.edu.co' }
  ];

  const fichasObjects = [];

  for (const pd of programasData) {
    const programa = await prisma.programa.create({
      data: { codigo: pd.codigo, nombre: pd.nombre, nivelFormacion: 'TECNOLOGO' }
    });

    const compT = await prisma.competencia.create({
      data: {
        codigo: `COMP-${pd.codigo}-1`, nombre: `Técnica de ${pd.nombre}`, tipo: 'TECNICA', duracionHoras: 100,
        programas: { connect: [{ id: programa.id }] }
      }
    });

    const compE = await prisma.competencia.create({
      data: {
        codigo: `COMP-${pd.codigo}-2`, nombre: `Ética y Transversal`, tipo: 'TRANSVERSAL', duracionHoras: 40,
        programas: { connect: [{ id: programa.id }] }
      }
    });

    await prisma.resultadoAprendizaje.createMany({
      data: [
        { codigo: `RAP-1-${pd.codigo}`, nombre: 'RAP Técnico', fase: 'ANALISIS', competenciaId: compT.id },
        { codigo: `RAP-2-${pd.codigo}`, nombre: 'RAP Transversal', fase: 'EJECUCION', competenciaId: compE.id }
      ]
    });

    const ficha = await prisma.ficha.create({
      data: {
        codigo: pd.fichaCodigo,
        programaId: programa.id,
        institucionId: institucion.id,
        sedeId: sede.id,
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2027-01-01'),
        jornada: 'MAÑANA'
      }
    });

    // Asignar líder técnico
    const liderInstructor = await prisma.instructor.findUnique({ where: { userId: userIds[pd.lider] } });
    await prisma.instructorFicha.create({
      data: { fichaId: ficha.id, instructorId: liderInstructor.id, rolFicha: 'LIDER_TECNICO' }
    });

    // Si Isaias no es líder, lo metemos como TRANSVERSAL
    if (pd.lider !== 'Isaias@sena.edu.co') {
      const isaiasInstructor = await prisma.instructor.findUnique({ where: { userId: userIds['Isaias@sena.edu.co'] } });
      await prisma.instructorFicha.create({
        data: { fichaId: ficha.id, instructorId: isaiasInstructor.id, rolFicha: 'TRANSVERSAL' }
      });
    }

    fichasObjects.push({ ficha, programa, liderInstructor });
  }

  // 4. Aprendices (15 por ficha)
  console.log('👨‍🎓 Creando aprendices...');
  const passHash = bcrypt.hashSync('123456', 10);
  let countAprendiz = 1;

  for (const { ficha, programa } of fichasObjects) {
    for (let i = 0; i < 15; i++) {
      let email = `estudiante${countAprendiz}@sena.edu.co`;
      let nombres = `Estudiante ${countAprendiz}`;
      let apellidos = `SENA`;

      // Si es la ficha de ADSI y es el primero, meter a Iván
      if (ficha.codigo === '3173430' && i === 0) {
        email = 'Ivan@sena.edu.co';
        nombres = 'Ivan';
      }

      let userId;
      if (email === 'Ivan@sena.edu.co') {
        userId = userIds['Ivan@sena.edu.co'];
      } else {
        const u = await prisma.user.create({
          data: { nombre: `${nombres} ${apellidos}`, email, passwordHash: passHash, rolId: rolesIds['APRENDIZ'], institucionId: institucion.id }
        });
        userId = u.id;
      }

      await prisma.aprendiz.create({
        data: {
          numeroDocumento: (1000000000 + countAprendiz).toString(),
          tipoDocumento: 'CC',
          nombres,
          apellidos,
          emailPersonal: email,
          emailSena: email,
          telefono: '3000000000',
          fichaId: ficha.id,
          userId: userId,
          nivelRiesgo: i % 5 === 0 ? 'MEDIO' : (i % 7 === 0 ? 'ALTO' : 'BAJO'),
          porcentajeAsistencia: Math.random() * 20 + 80,
          promedioAcumulado: Math.random() * 2 + 3
        }
      });
      countAprendiz++;
    }
  }

  // 5. Actividades y Asistencias
  console.log('📅 Creando actividades y asistencias de 15 días...');
  const hoy = new Date();
  
  for (const { ficha, liderInstructor } of fichasObjects) {
    const aprendicesFicha = await prisma.aprendiz.findMany({ where: { fichaId: ficha.id } });

    // 3 Actividades
    for (let a = 1; a <= 3; a++) {
      await prisma.actividad.create({
        data: {
          fichaId: ficha.id,
          instructorId: liderInstructor.id,
          nombre: `Actividad ${a} de ${ficha.codigo}`,
          descripcion: `Descripción de la actividad ${a}`,
          tipo: 'TALLER',
          fechaInicio: new Date(hoy.getTime() - 20 * 24 * 60 * 60 * 1000),
          fechaVencimiento: new Date(hoy.getTime() + 5 * 24 * 60 * 60 * 1000),
          estado: 'ACTIVA'
        }
      });
    }

    // 15 días de asistencia
    for (let d = 1; d <= 15; d++) {
      const fechaAsist = new Date(hoy.getTime() - d * 24 * 60 * 60 * 1000);

      const asistencia = await prisma.asistencia.create({
        data: {
          fichaId: ficha.id,
          instructorId: liderInstructor.id,
          fecha: fechaAsist,
          totalPresentes: 0,
          totalFaltas: 0,
          totalExcusas: 0,
          estado: 'REGISTRADA'
        }
      });

      let presentes = 0, faltas = 0, excusas = 0;
      const detalles = [];

      for (const ap of aprendicesFicha) {
        const rand = Math.random();
        let estadoStr = 'PRESENTE';
        if (rand > 0.9) { estadoStr = 'FALLA'; faltas++; }
        else if (rand > 0.85) { estadoStr = 'EXCUSA'; excusas++; }
        else { presentes++; }

        detalles.push({
          asistenciaId: asistencia.id,
          aprendizId: ap.id,
          estado: estadoStr
        });
      }

      await prisma.detalleAsistencia.createMany({ data: detalles });
      await prisma.asistencia.update({
        where: { id: asistencia.id },
        data: { totalPresentes: presentes, totalFaltas: faltas, totalExcusas: excusas }
      });
    }
  }

  console.log('🎉 Operación Finalizada con Éxito!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
