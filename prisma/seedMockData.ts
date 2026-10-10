import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Generando datos de prueba (19 estudiantes, competencias, RA, actividades, entregas, evaluaciones)...");

  const ficha = await prisma.ficha.findUnique({ where: { codigo: "2700123" } });
  if (!ficha) throw new Error("Ficha 2700123 no encontrada");

  const programa = await prisma.programa.findUnique({ where: { codigo: "228118" } });
  if (!programa) throw new Error("Programa no encontrado");

  const instructor = await prisma.instructor.findUnique({ where: { email: "isaias@sena.edu.co" } });
  if (!instructor) throw new Error("Instructor no encontrado");

  // Crear 19 estudiantes
  const passwordHash = await bcrypt.hash("123456", 10);
  const aprendices = [];

  for (let i = 1; i <= 19; i++) {
    const user = await prisma.user.create({
      data: {
        nombre: `Estudiante ${i}`,
        email: `estudiante${i}@sena.edu.co`,
        passwordHash,
        rol: "APRENDIZ",
        institucionId: ficha.institucionId,
      }
    });

    const aprendiz = await prisma.aprendiz.create({
      data: {
        numeroDocumento: `10000000${i + 10}`,
        nombres: `Estudiante ${i}`,
        apellidos: `Apellido ${i}`,
        emailSena: `estudiante${i}@sena.edu.co`,
        fichaId: ficha.id,
        userId: user.id,
        estado: "EN_FORMACION",
        promedioAcumulado: parseFloat((Math.random() * (5 - 3) + 3).toFixed(2)),
        porcentajeAsistencia: Math.floor(Math.random() * 20) + 80,
      }
    });
    aprendices.push(aprendiz);
  }

  // Agregar a Iván a la lista de aprendices para iterar sobre él también
  const ivan = await prisma.aprendiz.findFirst({ where: { emailSena: "ivan@sena.edu.co" } });
  if (ivan) aprendices.push(ivan);

  console.log("Creados los aprendices.");

  // Crear Competencias
  const competenciasData = [
    { codigo: "COMP-01", nombre: "Construir el sistema que cumpla con los requisitos", duracionHoras: 120 },
    { codigo: "COMP-02", nombre: "Diseñar la arquitectura del software", duracionHoras: 100 },
  ];

  const competencias = [];
  for (const c of competenciasData) {
    const comp = await prisma.competencia.create({
      data: {
        codigo: c.codigo,
        nombre: c.nombre,
        duracionHoras: c.duracionHoras,
        programas: { connect: { id: programa.id } }
      }
    });
    competencias.push(comp);
  }

  console.log("Competencias creadas.");

  // Crear Resultados de Aprendizaje
  const raData = [
    { codigo: "RA-01-1", nombre: "Escribir código orientado a objetos", competenciaId: competencias[0].id },
    { codigo: "RA-01-2", nombre: "Aplicar patrones de diseño", competenciaId: competencias[0].id },
    { codigo: "RA-02-1", nombre: "Diseñar diagramas UML", competenciaId: competencias[1].id },
  ];

  const resultados = [];
  for (const ra of raData) {
    const res = await prisma.resultadoAprendizaje.create({
      data: {
        codigo: ra.codigo,
        nombre: ra.nombre,
        competenciaId: ra.competenciaId,
      }
    });
    resultados.push(res);
  }

  console.log("Resultados de Aprendizaje creados.");

  // Crear Actividades y Asignar Entregas
  const actividadesData = [
    { nombre: "Taller de Java Básicos", tipo: "TALLER", raId: resultados[0].id },
    { nombre: "Proyecto Tienda Online", tipo: "PROYECTO", raId: resultados[1].id },
    { nombre: "Diagrama de Clases UML", tipo: "TALLER", raId: resultados[2].id },
  ];

  for (let i = 0; i < actividadesData.length; i++) {
    const actData = actividadesData[i];
    
    const actividad = await prisma.actividad.create({
      data: {
        fichaId: ficha.id,
        nombre: actData.nombre,
        tipo: actData.tipo as any,
        fechaInicio: new Date("2024-02-01"),
        fechaVencimiento: new Date("2024-03-01"),
        instructorId: instructor.id,
        resultadoAprendizajeId: actData.raId,
        estado: "CERRADA"
      }
    });

    // Crear entregas para todos los estudiantes
    for (const ap of aprendices) {
      const isAprobado = Math.random() > 0.2;
      await prisma.entrega.create({
        data: {
          actividadId: actividad.id,
          aprendizId: ap.id,
          estado: isAprobado ? "CALIFICADA" : "NO_APROBADA",
          calificacion: isAprobado ? "Aprobado" : "Deficiente",
          comentario: "Entrega realizada",
          retroalimentacion: isAprobado ? "Buen trabajo" : "Falta profundizar",
          instructorId: instructor.id,
          fechaEntrega: new Date("2024-02-15"),
          fechaEvaluacion: new Date("2024-02-20"),
        }
      });
    }
  }

  console.log("Actividades y entregas creadas.");

  // Crear Evaluaciones de Aprendiz (Calificaciones finales de RA)
  for (const res of resultados) {
    for (const ap of aprendices) {
      const isAprobado = Math.random() > 0.1;
      await prisma.evaluacionAprendiz.create({
        data: {
          aprendizId: ap.id,
          resultadoAprendizajeId: res.id,
          juicio: isAprobado ? "APROBADO" : "DEFICIENTE",
          nota: parseFloat((Math.random() * (5 - 3) + 3).toFixed(2)),
          fecha: new Date(),
          observaciones: "Calificación de cierre de RA"
        }
      });
    }
  }

  console.log("Evaluaciones de Resultados de Aprendizaje creadas.");
  console.log("Datos de prueba inyectados correctamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
