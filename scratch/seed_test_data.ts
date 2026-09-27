import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando la base de datos...");
  // Delete all data in reverse dependency order
  await prisma.visitaSeguimiento.deleteMany();
  await prisma.alertaRiesgo.deleteMany();
  await prisma.evaluacionAprendiz.deleteMany();
  await prisma.entrega.deleteMany();
  await prisma.actividad.deleteMany();
  await prisma.registroAsistencia.deleteMany();
  await prisma.asistencia.deleteMany();
  await prisma.asignacionCarga.deleteMany();
  await prisma.resultadoAprendizaje.deleteMany();
  await prisma.competencia.deleteMany();
  await prisma.instructorFicha.deleteMany();
  await prisma.aprendiz.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.ficha.deleteMany();
  await prisma.programa.deleteMany();
  await prisma.sede.deleteMany();
  await prisma.institucion.deleteMany();
  
  console.log("Base de datos limpia. Sembrando nuevos datos...");

  const passwordHash = await bcrypt.hash("123456", 10);

  // 1. Institucion & Sede
  const institucion = await prisma.institucion.create({
    data: {
      nit: "899999034-1",
      nombre: "SENA Regional Magdalena",
      municipio: "Santa Marta",
      direccion: "Avenida Ferrocarril",
      sedes: {
        create: {
          nombre: "Sede Principal",
          esPrincipal: true
        }
      }
    },
    include: { sedes: true }
  });
  const sedeId = institucion.sedes[0]!.id;

  // 2. Programa
  const programa = await prisma.programa.create({
    data: {
      codigo: "228118",
      nombre: "ANÁLISIS Y DESARROLLO DE SOFTWARE",
      nivelFormacion: "TECNOLOGO",
      version: "1",
      duracion: 3984
    }
  });

  // 3. Ficha
  const ficha = await prisma.ficha.create({
    data: {
      codigo: "2834567",
      programaId: programa.id,
      institucionId: institucion.id,
      sedeId: sedeId,
      fechaInicio: new Date("2024-01-15"),
      fechaFin: new Date("2025-12-15"),
      jornada: "DIURNA"
    }
  });

  // 4. Jerarquía Académica (Competencias y RAs)
  const competencia1 = await prisma.competencia.create({
    data: {
      codigo: "220501096",
      nombre: "ESTABLECER REQUISITOS DE LA SOLUCIÓN DE SOFTWARE DE ACUERDO CON ESTÁNDARES",
      duracionHoras: 100,
      programas: { connect: [{ id: programa.id }] },
      resultadosAprendizaje: {
        create: [
          { codigo: "RAP1", nombre: "ELICITAR REQUISITOS DEL SOFTWARE", fase: "ANALISIS" },
          { codigo: "RAP2", nombre: "ESPECIFICAR REQUISITOS DEL SOFTWARE", fase: "ANALISIS" },
        ]
      }
    },
    include: { resultadosAprendizaje: true }
  });

  const competencia2 = await prisma.competencia.create({
    data: {
      codigo: "220501095",
      nombre: "DISEÑAR LA SOLUCIÓN DE SOFTWARE",
      duracionHoras: 150,
      programas: { connect: [{ id: programa.id }] },
      resultadosAprendizaje: {
        create: [
          { codigo: "RAP3", nombre: "DISEÑAR ARQUITECTURA DEL SOFTWARE", fase: "PLANEACION" },
          { codigo: "RAP4", nombre: "DISEÑAR BASE DE DATOS", fase: "PLANEACION" },
        ]
      }
    },
    include: { resultadosAprendizaje: true }
  });

  // 5. Admin User
  await prisma.user.create({
    data: {
      email: "admin@sena.edu.co",
      nombre: "Administrador",
      passwordHash,
      rol: "ADMINISTRADOR",
      institucionId: institucion.id
    }
  });

  // 6. Instructor
  const userInstructor = await prisma.user.create({
    data: {
      email: "isaias@sena.edu.co",
      nombre: "Isaias Instructor",
      passwordHash,
      rol: "INSTRUCTOR",
      institucionId: institucion.id
    }
  });

  const instructor = await prisma.instructor.create({
    data: {
      numeroDocumento: "987654321",
      nombres: "Isaias",
      apellidos: "Instructor",
      email: "isaias@sena.edu.co",
      userId: userInstructor.id,
      fichas: {
        create: { fichaId: ficha.id, rolFicha: "LIDER_TECNICO" }
      }
    }
  });

  // 7. Aprendices (15 estudiantes)
  const nombresAprendices = [
    "Juan Perez", "Maria Gomez", "Carlos Ruiz", "Ana Lopez", "Luis Torres",
    "Elena Castro", "Pedro Silva", "Laura Ortiz", "Andres Moreno", "Sofia Rios",
    "Javier Diaz", "Carmen Vargas", "Miguel Rojas", "Paula Fernandez"
  ];

  const aprendicesList = [];

  // Crear Ivan primero
  const userIvan = await prisma.user.create({
    data: {
      email: "ivan@sena.edu.co",
      nombre: "Ivan Aprendiz",
      passwordHash,
      rol: "APRENDIZ",
      institucionId: institucion.id
    }
  });

  const aprendizIvan = await prisma.aprendiz.create({
    data: {
      numeroDocumento: "1000000000",
      nombres: "Ivan",
      apellidos: "Aprendiz",
      emailSena: "ivan@sena.edu.co",
      userId: userIvan.id,
      fichaId: ficha.id,
    }
  });
  aprendicesList.push(aprendizIvan);

  // Crear 14 más
  for (let i = 0; i < nombresAprendices.length; i++) {
    const [nombre, apellido] = (nombresAprendices[i] as string).split(" ");
    const doc = `1000000${(i+1).toString().padStart(3, '0')}`;
    const email = `aprendiz${i+1}@sena.edu.co`;

    const u = await prisma.user.create({
      data: {
        email, nombre: `${nombre} ${apellido}`, passwordHash, rol: "APRENDIZ", institucionId: institucion.id
      }
    });

    const ap = await prisma.aprendiz.create({
      data: {
        numeroDocumento: doc, nombres: nombre || "", apellidos: apellido || "", emailSena: email, userId: u.id, fichaId: ficha.id
      }
    });
    aprendicesList.push(ap);
  }

  // 8. Actividades
  const actividad1 = await prisma.actividad.create({
    data: {
      fichaId: ficha.id,
      instructorId: instructor.id,
      resultadoAprendizajeId: competencia1.resultadosAprendizaje[0]!.id,
      nombre: "Taller Elicitación de Requisitos",
      descripcion: "Levantamiento de requerimientos con el cliente.",
      fechaVencimiento: new Date(new Date().setDate(new Date().getDate() + 7)),
      estado: "ACTIVA"
    }
  });

  const actividad2 = await prisma.actividad.create({
    data: {
      fichaId: ficha.id,
      instructorId: instructor.id,
      resultadoAprendizajeId: competencia2.resultadosAprendizaje[0]!.id,
      nombre: "Diagramas de Arquitectura",
      descripcion: "Crear UML.",
      fechaVencimiento: new Date(new Date().setDate(new Date().getDate() - 2)),
      estado: "CERRADA"
    }
  });
  console.log("Actividad creada y cerrada:", actividad2.nombre);

  // 9. Entregas & Calificaciones & Asistencia
  for (const ap of aprendicesList) {
    // Entregas aleatorias
    const entrego1 = Math.random() > 0.2;
    if (entrego1) {
      await prisma.entrega.create({
        data: {
          actividadId: actividad1.id,
          aprendizId: ap.id,
          comentario: "Entrega lista",
          estado: Math.random() > 0.5 ? "CALIFICADA" : "APROBADA"
        }
      });
    }

    // Juicios valorativos en Sabana de Notas
    // Para RAP 1
    await prisma.evaluacionAprendiz.create({
      data: {
        aprendizId: ap.id,
        resultadoAprendizajeId: competencia1.resultadosAprendizaje[0]!.id,
        juicio: Math.random() > 0.2 ? "APROBADO" : "DEFICIENTE",
        fecha: new Date(),
        observaciones: "Evaluado en plataforma"
      }
    });

    // Para RAP 3 (algunos pendientes)
    const j3 = Math.random();
    await prisma.evaluacionAprendiz.create({
      data: {
        aprendizId: ap.id,
        resultadoAprendizajeId: competencia2.resultadosAprendizaje[0]!.id,
        juicio: j3 > 0.6 ? "APROBADO" : (j3 > 0.3 ? "DEFICIENTE" : "PENDIENTE"),
        fecha: new Date(),
      }
    });

    // Riesgos aleatorios para el dashboard
    if (Math.random() > 0.7) {
      await prisma.alertaRiesgo.create({
        data: {
          aprendizId: ap.id,
          nivel: "ALTO",
          motivo: "Bajo rendimiento y falta de entregas",
          gestionada: false
        }
      });
      // Bajar asistencia y promedio para simular
      await prisma.aprendiz.update({
        where: { id: ap.id },
        data: {
          porcentajeAsistencia: 65.0,
          nivelRiesgo: "ALTO"
        }
      });
    }
  }

  // 10. Asistencia
  const asistenciaObj = await prisma.asistencia.create({
    data: {
      fichaId: ficha.id,
      instructorId: instructor.id,
      fecha: new Date()
    }
  });

  for (const ap of aprendicesList) {
    await prisma.registroAsistencia.create({
      data: {
        asistenciaId: asistenciaObj.id,
        aprendizId: ap.id,
        estado: Math.random() > 0.1 ? "PRESENTE" : "FALLA"
      }
    });
  }

  console.log("¡Datos de prueba insertados con éxito!");
  console.log("Ficha ADSO creada. 15 aprendices, notas y actividades listas.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
