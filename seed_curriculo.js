const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Actualizando diseño curricular de programas existentes...');

  // 1. ADSI
  await prisma.programa.updateMany({
    where: { codigo: 'PROG-ADSI' },
    data: {
      version: "3",
      duracion: 3984,
      modalidad: "PRESENCIAL",
      area: "Tecnologías de la Información",
      areaDesempeno: "Desarrollo de Software y Servicios TI",
      titulacion: "Tecnólogo en Análisis y Desarrollo de Sistemas de Información",
      descripcion: "El programa de Análisis y Desarrollo de Sistemas de Información (ADSI) está diseñado para formar talento humano calificado en la creación de software, análisis de requerimientos, diseño arquitectónico y desarrollo de soluciones tecnológicas aplicadas a diferentes sectores productivos.",
      perfilIngreso: "El aspirante debe contar con educación media (grado 11) aprobada. Se requiere interés por la tecnología, razonamiento lógico, habilidades matemáticas básicas y disposición para el aprendizaje continuo y el trabajo en equipo.",
      perfilEgresado: "El egresado estará en la capacidad de participar en el ciclo de vida de desarrollo de software, desde el levantamiento de requisitos hasta la implementación y pruebas. Dominará fundamentos de programación, bases de datos, metodologías ágiles y principios de arquitectura de software para aportar al crecimiento tecnológico de las organizaciones."
    }
  });

  // 2. Enfermería
  await prisma.programa.updateMany({
    where: { codigo: 'PROG-ENFE' },
    data: {
      version: "2",
      duracion: 3984,
      modalidad: "PRESENCIAL",
      area: "Salud e Integración Social",
      areaDesempeno: "Atención Básica en Salud",
      titulacion: "Técnico en Enfermería",
      descripcion: "Este programa capacita a los aprendices en el cuidado de la salud humana, brindando soporte y atención a pacientes en diferentes niveles de complejidad. Fomenta el compromiso ético, la empatía y la rigurosidad en los protocolos médicos y sanitarios.",
      perfilIngreso: "Educación básica secundaria (grado 9) aprobada. Alta vocación de servicio, empatía, habilidades de comunicación asertiva y capacidad para trabajar bajo presión en ambientes clínicos y comunitarios.",
      perfilEgresado: "El egresado podrá brindar cuidado básico y atención integral de la salud a personas, familias y comunidades. Estará facultado para apoyar procedimientos médicos no invasivos, suministro de medicamentos bajo supervisión y promoción y prevención en salud."
    }
  });

  // 3. Soldadura
  await prisma.programa.updateMany({
    where: { codigo: 'PROG-SOLD' },
    data: {
      version: "1",
      duracion: 2200,
      modalidad: "PRESENCIAL",
      area: "Mecánica y Materiales",
      areaDesempeno: "Sector Metalmecánico y Construcción",
      titulacion: "Técnico en Soldadura de Productos Metálicos",
      descripcion: "El programa forma profesionales capaces de realizar uniones y cortes de metales aplicando diferentes procesos de soldadura (SMAW, GMAW, GTAW). Se enfatiza en la seguridad industrial, lectura de planos y normatividad vigente.",
      perfilIngreso: "Educación básica secundaria (grado 9) aprobada. Interés por el trabajo manual, destreza motriz fina, buena agudeza visual y compromiso total con el cumplimiento de normas de seguridad industrial.",
      perfilEgresado: "El técnico estará capacitado para soldar componentes metálicos y estructuras de acuerdo con especificaciones técnicas, planos y normas internacionales. Podrá desempeñarse en empresas metalmecánicas, astilleros, construcción y mantenimiento industrial."
    }
  });

  console.log('✅ ¡Información curricular agregada con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
