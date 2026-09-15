import { PrismaClient, Estado, EstadoAprendiz, NivelRiesgo, NivelFormacion, TipoDocumento, TipoCompetencia, FaseProyecto, EstadoActividad, JuicioValorativo } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos Sena_Gss...");

  // ----------------------------------------------------------
  // 1. ROLES
  // ----------------------------------------------------------
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: "Administrador Sistema" },
    update: {},
    create: { nombre: "Administrador Sistema", descripcion: "Acceso total al sistema." }
  });

  const rolCoord = await prisma.rol.upsert({
    where: { nombre: "Coordinador Académico" },
    update: {},
    create: { nombre: "Coordinador Académico", descripcion: "Gestión de fichas, programas y reportes." }
  });

  const rolInstructor = await prisma.rol.upsert({
    where: { nombre: "Instructor" },
    update: {},
    create: { nombre: "Instructor", descripcion: "Gestión de sus fichas asignadas." }
  });

  console.log("✅ Roles creados.");

  // ----------------------------------------------------------
  // 2. USUARIO ADMINISTRADOR
  // ----------------------------------------------------------
  const passwordHash = await bcrypt.hash("Admin2026#", 12);
  await prisma.user.upsert({
    where: { email: "admin@sena.edu.co" },
    update: {},
    create: {
      nombre: "Carlos Administrador",
      email: "admin@sena.edu.co",
      passwordHash,
      rolId: rolAdmin.id,
      estado: Estado.ACTIVO
    }
  });

  console.log("✅ Usuario admin creado (admin@sena.edu.co / Admin2026#).");

  // ----------------------------------------------------------
  // 3. INSTITUCIONES
  // ----------------------------------------------------------
  const inst1 = await prisma.institucion.upsert({
    where: { nit: "800123456-7" },
    update: {},
    create: {
      nit: "800123456-7",
      nombre: "IED Liceo Celedón",
      municipio: "Santa Marta",
      departamento: "Magdalena",
      direccion: "Calle 30 # 5-22, Barrio Centro",
      telefono: "605 4201234",
      email: "rector@liceoceledon.edu.co",
      rector: "Jorge Fuentes Díaz",
      estado: Estado.ACTIVO
    }
  });

  const inst2 = await prisma.institucion.upsert({
    where: { nit: "800987654-3" },
    update: {},
    create: {
      nit: "800987654-3",
      nombre: "IED Normal Superior",
      municipio: "Santa Marta",
      departamento: "Magdalena",
      direccion: "Cra 5 # 20-40, Barrio San Jorge",
      telefono: "605 4209876",
      email: "rector@normalsuperior.edu.co",
      rector: "Ana Lucía Torres",
      estado: Estado.ACTIVO
    }
  });

  console.log("✅ Instituciones creadas.");

  // ----------------------------------------------------------
  // 4. SEDES
  // ----------------------------------------------------------
  const sede1 = await prisma.sede.upsert({
    where: { id: "sede-principal-celedon" },
    update: {},
    create: {
      id: "sede-principal-celedon",
      nombre: "Sede Principal",
      institucionId: inst1.id,
      direccion: "Calle 30 # 5-22",
      barrio: "Centro",
      municipio: "Santa Marta",
      esPrincipal: true,
      coordinador: "María Pérez",
      telefono: "300 123 4567",
      estado: Estado.ACTIVO
    }
  });

  const sede2 = await prisma.sede.upsert({
    where: { id: "sede-principal-normal" },
    update: {},
    create: {
      id: "sede-principal-normal",
      nombre: "Sede Principal",
      institucionId: inst2.id,
      direccion: "Cra 5 # 20-40",
      barrio: "San Jorge",
      municipio: "Santa Marta",
      esPrincipal: true,
      coordinador: "Juan Gómez",
      telefono: "311 987 6543",
      estado: Estado.ACTIVO
    }
  });

  console.log("✅ Sedes creadas.");

  // ----------------------------------------------------------
  // 5. PROGRAMA
  // ----------------------------------------------------------
  const programa = await prisma.programa.upsert({
    where: { codigo: "228120" },
    update: {},
    create: {
      codigo: "228120",
      nombre: "Técnico en Programación de Software",
      nivelFormacion: NivelFormacion.TECNICO,
      estado: Estado.ACTIVO
    }
  });

  console.log("✅ Programa creado.");

  // ----------------------------------------------------------
  // 6. COMPETENCIAS Y RAPs
  // ----------------------------------------------------------
  const competencia = await prisma.competencia.upsert({
    where: { codigo: "220501096" },
    update: {},
    create: {
      codigo: "220501096",
      nombre: "Implementar la arquitectura del software de acuerdo con prácticas y herramientas de desarrollo",
      programaId: programa.id,
      tipo: TipoCompetencia.TECNICA,
      duracionHoras: 180,
      estado: Estado.ACTIVO
    }
  });

  const rap1 = await prisma.resultadoAprendizaje.create({
    data: {
      codigo: "RAP1",
      nombre: "Interpretar el informe de requisitos para determinar las necesidades tecnológicas",
      competenciaId: competencia.id,
      fase: FaseProyecto.ANALISIS
    }
  }).catch(() => prisma.resultadoAprendizaje.findFirst({ where: { codigo: "RAP1" } }));

  console.log("✅ Competencias y RAPs creados.");

  // ----------------------------------------------------------
  // 7. FICHA
  // ----------------------------------------------------------
  const ficha = await prisma.ficha.upsert({
    where: { codigo: "2987654" },
    update: {},
    create: {
      codigo: "2987654",
      programaId: programa.id,
      institucionId: inst1.id,
      sedeId: sede1.id,
      fechaInicio: new Date("2026-02-01"),
      fechaFin: new Date("2026-11-30"),
      estado: Estado.ACTIVO,
      jornada: "Diurna"
    }
  });

  console.log("✅ Ficha creada.");

  // ----------------------------------------------------------
  // 8. APRENDICES
  // ----------------------------------------------------------
  const aprendiz1 = await prisma.aprendiz.upsert({
    where: { numeroDocumento: "1002333444" },
    update: {},
    create: {
      tipoDocumento: TipoDocumento.CC,
      numeroDocumento: "1002333444",
      nombres: "Carlos Andrés",
      apellidos: "Martínez López",
      telefono: "312 555 0001",
      emailSena: "camartinez@soy.sena.edu.co",
      emailPersonal: "carlos.martinez@gmail.com",
      fichaId: ficha.id,
      estado: EstadoAprendiz.EN_FORMACION,
      nivelRiesgo: NivelRiesgo.BAJO,
      porcentajeAsistencia: 92.5,
      promedioAcumulado: 3.8
    }
  });

  await prisma.aprendiz.upsert({
    where: { numeroDocumento: "1003444555" },
    update: {},
    create: {
      tipoDocumento: TipoDocumento.CC,
      numeroDocumento: "1003444555",
      nombres: "Laura Sofía",
      apellidos: "Gómez Ríos",
      telefono: "313 555 0002",
      emailSena: "lsgomez@soy.sena.edu.co",
      emailPersonal: "laura.gomez@yahoo.com",
      fichaId: ficha.id,
      estado: EstadoAprendiz.EN_FORMACION,
      nivelRiesgo: NivelRiesgo.MEDIO,
      porcentajeAsistencia: 78.0,
      promedioAcumulado: 3.2
    }
  });

  await prisma.aprendiz.upsert({
    where: { numeroDocumento: "1004555666" },
    update: {},
    create: {
      tipoDocumento: TipoDocumento.CC,
      numeroDocumento: "1004555666",
      nombres: "Andrés Felipe",
      apellidos: "Silva Torres",
      telefono: "314 555 0003",
      emailSena: "afsilva@soy.sena.edu.co",
      emailPersonal: "andres.silva@hotmail.com",
      fichaId: ficha.id,
      estado: EstadoAprendiz.EN_FORMACION,
      nivelRiesgo: NivelRiesgo.ALTO,
      porcentajeAsistencia: 55.0,
      promedioAcumulado: 2.1
    }
  });

  console.log("✅ Aprendices creados.");

  // ----------------------------------------------------------
  // 9. INSTRUCTOR Y ACTIVIDAD DE EJEMPLO
  // ----------------------------------------------------------
  const instructor = await prisma.instructor.upsert({
    where: { numeroDocumento: "1082345678" },
    update: {},
    create: {
      tipoDocumento: TipoDocumento.CC,
      numeroDocumento: "1082345678",
      nombres: "Andrés Felipe",
      apellidos: "Gómez Torres",
      email: "agomezt@sena.edu.co",
      telefono: "300 123 4567",
      profesion: "Ingeniero de Sistemas",
      estado: Estado.ACTIVO
    }
  });

  await prisma.actividad.create({
    data: {
      fichaId: ficha.id,
      nombre: "Taller: Modelo Entidad-Relación",
      descripcion: "Diseñar el modelo ER para el caso de estudio de la ficha.",
      tipo: "TALLER",
      fechaVencimiento: new Date(Date.now() + 86400000 * 7),
      estado: EstadoActividad.ACTIVA
    }
  }).catch(() => null);

  console.log("✅ Instructor y Actividad creados.");
  console.log("\n🎉 ¡Seed completado exitosamente!");
  console.log("   Acceso admin: admin@sena.edu.co / Admin2026#");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
