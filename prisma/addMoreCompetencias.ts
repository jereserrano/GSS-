import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Añadiendo más competencias para la gráfica de araña...");

  const ficha = await prisma.ficha.findUnique({ where: { codigo: "2700123" } });
  if (!ficha) throw new Error("Ficha no encontrada");

  const programa = await prisma.programa.findUnique({ where: { codigo: "228118" } });
  if (!programa) throw new Error("Programa no encontrado");

  // Crear 2 competencias adicionales
  const competenciasData = [
    { codigo: "COMP-03", nombre: "Implantar la solución de software", duracionHoras: 80 },
    { codigo: "COMP-04", nombre: "Administrar bases de datos", duracionHoras: 90 },
    { codigo: "COMP-05", nombre: "Aplicar prácticas de calidad", duracionHoras: 50 },
  ];

  const competencias = [];
  for (const c of competenciasData) {
    const comp = await prisma.competencia.upsert({
      where: { codigo: c.codigo },
      update: {},
      create: {
        codigo: c.codigo,
        nombre: c.nombre,
        duracionHoras: c.duracionHoras,
        programas: { connect: { id: programa.id } }
      }
    });
    competencias.push(comp);
  }

  // Crear RAs para las nuevas competencias
  const raData = [
    { codigo: "RA-03-1", nombre: "Desplegar aplicación en producción", competenciaId: competencias[0].id },
    { codigo: "RA-04-1", nombre: "Crear consultas SQL complejas", competenciaId: competencias[1].id },
    { codigo: "RA-05-1", nombre: "Realizar pruebas unitarias", competenciaId: competencias[2].id },
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

  // Generar evaluaciones
  const aprendices = await prisma.aprendiz.findMany({ where: { fichaId: ficha.id } });

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
          observaciones: "Evaluación complementaria"
        }
      });
    }
  }

  console.log("¡Competencias añadidas y evaluadas correctamente!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
