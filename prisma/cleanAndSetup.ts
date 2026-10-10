import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando base de datos...");
  // Borrar en orden para evitar errores de llaves foráneas
  await prisma.auditLog.deleteMany();
  await prisma.mensajeLeido.deleteMany();
  await prisma.mensaje.deleteMany();
  await prisma.notificacion.deleteMany();
  await prisma.sessionLog.deleteMany();
  await prisma.documentoEmpleado.deleteMany();
  await prisma.solicitudCarta.deleteMany();
  await prisma.passwordResetToken.deleteMany();

  await prisma.entrega.deleteMany();
  await prisma.actividad.deleteMany();
  await prisma.evaluacionAprendiz.deleteMany();
  await prisma.alertaRiesgo.deleteMany();
  await prisma.registroAsistencia.deleteMany();
  await prisma.asistencia.deleteMany();
  await prisma.visitaSeguimiento.deleteMany();
  await prisma.excusa.deleteMany();
  await prisma.asignacionCarga.deleteMany();
  await prisma.instructorFicha.deleteMany();
  await prisma.claseVirtual.deleteMany();

  await prisma.aprendiz.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.user.deleteMany();

  await prisma.ficha.deleteMany();
  await prisma.programa.deleteMany();
  await prisma.sede.deleteMany();
  await prisma.institucion.deleteMany();
  
  console.log("Creando Institución y Sede...");
  const institucion = await prisma.institucion.create({
    data: {
      nit: "899999239-1",
      nombre: "SENA Regional Magdalena",
      municipio: "Santa Marta",
      departamento: "Magdalena",
      direccion: "Avenida Ferrocarril #27-97",
    }
  });

  const sede = await prisma.sede.create({
    data: {
      nombre: "Sede Principal",
      institucionId: institucion.id,
      esPrincipal: true,
      direccion: "Avenida Ferrocarril #27-97"
    }
  });

  console.log("Creando Programa: Análisis y Desarrollo de Software...");
  const programa = await prisma.programa.create({
    data: {
      codigo: "228118",
      nombre: "Análisis y Desarrollo de Software",
      nivelFormacion: "TECNOLOGO"
    }
  });

  console.log("Creando Ficha...");
  const ficha = await prisma.ficha.create({
    data: {
      codigo: "2700123",
      programaId: programa.id,
      institucionId: institucion.id,
      sedeId: sede.id,
      fechaInicio: new Date("2024-01-15"),
      fechaFin: new Date("2026-01-15")
    }
  });

  console.log("Creando Usuarios: Instructor e Aprendiz...");
  const passwordHash = await bcrypt.hash("123456", 10);

  // Instructor
  const userInstructor = await prisma.user.create({
    data: {
      nombre: "Isaías Instructor",
      email: "isaias@sena.edu.co",
      passwordHash,
      rol: "INSTRUCTOR",
      institucionId: institucion.id,
    }
  });

  const instructor = await prisma.instructor.create({
    data: {
      numeroDocumento: "1000000001",
      nombres: "Isaías",
      apellidos: "Instructor",
      email: "isaias@sena.edu.co",
      userId: userInstructor.id
    }
  });

  // Assign instructor to ficha
  await prisma.instructorFicha.create({
    data: {
      instructorId: instructor.id,
      fichaId: ficha.id,
      rolFicha: "LIDER_TECNICO"
    }
  });

  // Aprendiz
  const userAprendiz = await prisma.user.create({
    data: {
      nombre: "Iván Aprendiz",
      email: "ivan@sena.edu.co",
      passwordHash,
      rol: "APRENDIZ",
      institucionId: institucion.id,
    }
  });

  await prisma.aprendiz.create({
    data: {
      numeroDocumento: "1000000002",
      nombres: "Iván",
      apellidos: "Aprendiz",
      emailSena: "ivan@sena.edu.co",
      fichaId: ficha.id,
      userId: userAprendiz.id,
      estado: "EN_FORMACION"
    }
  });

  // Admin user just in case
  await prisma.user.create({
    data: {
      nombre: "Admin Global",
      email: "admin@sena.edu.co",
      passwordHash,
      rol: "ADMINISTRADOR",
      institucionId: institucion.id,
    }
  });

  console.log("¡Base de datos limpia y configurada correctamente!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
