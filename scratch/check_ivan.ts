import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const ap = await prisma.aprendiz.findFirst({
    where: { numeroDocumento: "1000000001" },
    include: {
      entregas: true,
      evaluaciones: true,
      alertas: true
    }
  });

  if (!ap) {
    console.log("No se encontró aprendiz con documento 1000000001");
    return;
  }

  console.log(`Aprendiz: ${ap.nombres} ${ap.apellidos} (ID: ${ap.id})`);
  
  const entregasNoAprobadas = ap.entregas.filter(e => e.estado === "NO_APROBADA" || e.estado === "TARDIA");
  console.log(`Entregas NO_APROBADA o TARDIA: ${entregasNoAprobadas.length}`);
  
  const evaluacionesDeficientes = ap.evaluaciones.filter(e => e.juicio === "DEFICIENTE");
  console.log(`Evaluaciones DEFICIENTE: ${evaluacionesDeficientes.length}`);
  
  console.log(`Alertas:`);
  ap.alertas.forEach(a => console.log(` - ${a.nivel}: ${a.motivo} (Gestionada: ${a.gestionada})`));

  console.log(`Entregas totales: ${ap.entregas.length}`);
  console.log(`Evaluaciones totales: ${ap.evaluaciones.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
