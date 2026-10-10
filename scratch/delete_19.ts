import { PrismaClient } from '@prisma/client';
import { deleteAprendiz } from '../actions/aprendices.actions';

const prisma = new PrismaClient();

async function main() {
  console.log("Buscando aprendices de prueba...");
  const aprendices = await prisma.aprendiz.findMany({
    where: {
      numeroDocumento: { not: '1000000002' } // El doc de ivan
    },
    select: { id: true, nombres: true, userId: true }
  });

  console.log(`Encontrados ${aprendices.length} aprendices. Procediendo a eliminar...`);

  console.log("Buscando usuarios relacionados...");
  const userIds = aprendices.map(a => a.userId).filter(Boolean) as string[];

  console.log("Borrando Registros de Asistencia...");
  try { await prisma.registroAsistencia.deleteMany({ where: { aprendizId: { in: aprendices.map(a => a.id) } } }); } catch(e) {}
  
  console.log("Borrando Entregas...");
  try { await prisma.entrega.deleteMany({ where: { aprendizId: { in: aprendices.map(a => a.id) } } }); } catch(e) {}
  
  console.log("Borrando EvaluacionesAprendiz...");
  try { await prisma.evaluacionAprendiz.deleteMany({ where: { aprendizId: { in: aprendices.map(a => a.id) } } }); } catch(e) {}
  
  console.log("Borrando AlertasRiesgo...");
  try { await prisma.alertaRiesgo.deleteMany({ where: { aprendizId: { in: aprendices.map(a => a.id) } } }); } catch(e) {}
  
  console.log("Borrando VisitasSeguimiento...");
  try { await prisma.visitaSeguimiento.deleteMany({ where: { aprendizId: { in: aprendices.map(a => a.id) } } }); } catch(e) {}

  console.log("Borrando Excusas...");
  try { (prisma as any).excusa?.deleteMany({ where: { aprendizId: { in: aprendices.map(a => a.id) } } }); } catch(e) {}

  console.log("Borrando Novedades...");
  try { await (prisma as any).novedad?.deleteMany({ where: { aprendizId: { in: aprendices.map(a => a.id) } } }); } catch (e) {}

  console.log("Borrando Aprendices...");
  try { await prisma.aprendiz.deleteMany({ where: { id: { in: aprendices.map(a => a.id) } } }); } catch(e) { console.error("Error borrando aprendices:", e); }

  if (userIds.length > 0) {
    console.log("Borrando Users...");
    try { await prisma.user.deleteMany({ where: { id: { in: userIds } } }); } catch(e) { console.error("Error borrando users:", e); }
  }

  console.log(`Proceso terminado. Se intentó eliminar ${aprendices.length} aprendices.`);
}

main().finally(() => prisma.$disconnect());
