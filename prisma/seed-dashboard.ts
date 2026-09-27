import { PrismaClient, EstadoEntrega, JuicioValorativo } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando inyección de datos realistas para el Dashboard...");

  // 1. Encontrar el programa "Análisis y Desarrollo"
  const programa = await prisma.programa.findFirst({
    where: { nombre: { contains: "análisis", } } // Intentar buscar sin acento o con acento
  }) || await prisma.programa.findFirst({
    where: { nombre: { contains: "analisis" } }
  }) || await prisma.programa.findFirst(); // Fallback al primer programa

  if (!programa) {
    console.error("No se encontró ningún programa.");
    return;
  }
  console.log(`Programa seleccionado: ${programa.nombre}`);

  // 2. Encontrar la Ficha
  const ficha = await prisma.ficha.findFirst({
    where: { programaId: programa.id },
    include: { aprendices: true }
  });

  if (!ficha) {
    console.error("No se encontró ninguna ficha para este programa.");
    return;
  }
  console.log(`Ficha seleccionada: ${ficha.codigo} con ${ficha.aprendices.length} aprendices.`);

  // 3. Obtener o crear Competencias
  let competencias = await prisma.competencia.findMany({
    where: { programas: { some: { id: programa.id } } }
  });

  if (competencias.length === 0) {
    console.log("Creando competencias básicas...");
    const compNombres = [
      "Especificar requisitos del sistema",
      "Desarrollar la arquitectura de software",
      "Construir el software (Codificación)",
      "Implementar bases de datos",
      "Realizar pruebas de software"
    ];
    for (let i = 0; i < compNombres.length; i++) {
      const comp = await prisma.competencia.create({
        data: {
          codigo: `COMP-${i+1}00`,
          nombre: compNombres[i]!,
          duracionHoras: 120,
          programas: { connect: [{ id: programa.id }] }
        }
      });
      competencias.push(comp);
    }
  }

  // 4. Crear RAs para cada competencia
  for (const comp of competencias) {
    console.log(`\nProcesando competencia: ${comp.nombre}`);
    
    // Crear 5 RAs por competencia
    const ras = [];
    for (let i = 1; i <= 5; i++) {
      const ra = await prisma.resultadoAprendizaje.create({
        data: {
          codigo: `${comp.codigo}-RA${i}`,
          nombre: `RA ${i} - Componente práctico y analítico para ${comp.nombre}`,
          competenciaId: comp.id
        }
      });
      ras.push(ra);
    }

    // A 3 de esos RAs les creamos actividades y las calificamos
    for (let i = 0; i < 3; i++) {
      const ra = ras[i];
      if (!ra) continue;
      console.log(`  -> Creando actividades para ${ra.codigo}...`);

      // Crear 2 actividades por RA
      for (let j = 1; j <= 2; j++) {
        // Semanas distintas para ver dispersión
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() - Math.floor(Math.random() * 20)); // Hace 0-20 días

        const actividad = await prisma.actividad.create({
          data: {
            nombre: `Evidencia ${j} de ${ra.codigo}`,
            fichaId: ficha.id,
            resultadoAprendizajeId: ra.id,
            fechaVencimiento
          }
        });

        // Crear entregas para los aprendices
        for (const aprendiz of ficha.aprendices) {
          const suerte = Math.random();
          let estado: EstadoEntrega = EstadoEntrega.PENDIENTE;
          let calificacion: string | null = null;
          let notaNum: number | null = null;
          let fechaEntrega = new Date(fechaVencimiento);
          
          // Dispersión de días de entrega (Hábitos - Heatmap)
          // Hacer que tiendan a entregar los viernes o domingos
          if (suerte < 0.2) fechaEntrega.setDate(fechaEntrega.getDate() - 2); // Viernes
          else if (suerte < 0.5) fechaEntrega.setDate(fechaEntrega.getDate()); // Domingo
          else fechaEntrega.setDate(fechaEntrega.getDate() - Math.floor(Math.random() * 5));

          if (suerte < 0.15) {
            // No entregó
            estado = EstadoEntrega.PENDIENTE; // O TARDIA, pero dejemos PENDIENTE para q cuente como "por calificar" o "no entregada" dependiendo de la fecha
          } else if (suerte < 0.35) {
            // Entregó pero bajo rendimiento
            estado = EstadoEntrega.CALIFICADA;
            notaNum = 40 + Math.random() * 25; // 40-65
            calificacion = notaNum.toFixed(1);
          } else {
            // Entregó bien
            estado = EstadoEntrega.CALIFICADA;
            notaNum = 70 + Math.random() * 30; // 70-100
            calificacion = notaNum.toFixed(1);
          }

          // Solo registramos la entrega si 'entregó' (estado CALIFICADA) o si queremos simular que la subió y está PENDIENTE
          // Para "No entregada", Next.js asume q si no hay registro de entrega, no entregó.
          if (suerte > 0.1) {
            await prisma.entrega.create({
              data: {
                actividadId: actividad.id,
                aprendizId: aprendiz.id,
                fechaEntrega,
                estado,
                calificacion
              }
            });
          }
        }
      }

      // Crear EvaluacionAprendiz final para ese RA (basado en lo anterior)
      for (const aprendiz of ficha.aprendices) {
        const entregas = await prisma.entrega.findMany({
          where: { aprendizId: aprendiz.id, actividad: { resultadoAprendizajeId: ra.id } }
        });
        
        let notaFinal = 0;
        let juicio: JuicioValorativo = JuicioValorativo.PENDIENTE;

        if (entregas.length === 0) {
          notaFinal = 10; // Prácticamente desertor en este RA
          juicio = JuicioValorativo.DEFICIENTE;
        } else {
          const validas = entregas.filter(e => e.calificacion);
          if (validas.length > 0) {
            const sum = validas.reduce((acc, e) => acc + parseFloat(e.calificacion!), 0);
            notaFinal = sum / validas.length;
          } else {
            notaFinal = 40;
          }
          juicio = notaFinal >= 70 ? JuicioValorativo.APROBADO : JuicioValorativo.DEFICIENTE;
        }

        await prisma.evaluacionAprendiz.upsert({
          where: {
            aprendizId_resultadoAprendizajeId: {
              aprendizId: aprendiz.id,
              resultadoAprendizajeId: ra.id
            }
          },
          update: { nota: notaFinal, juicio },
          create: {
            aprendizId: aprendiz.id,
            resultadoAprendizajeId: ra.id,
            nota: notaFinal,
            juicio
          }
        });
      }
    }
  }

  console.log("\n¡Datos generados exitosamente! Ya puedes recargar tu dashboard.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
