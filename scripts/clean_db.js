const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetProgramaId = 'cmuh56x0b0003umcco5qmk9yy';
  const targetFichaId = 'cmuh56xns0064umcc02ciyi5y';

  console.log("Deshabilitando llaves foráneas temporalmente...");
  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS=0;`);

  console.log("Eliminando fichas no deseadas...");
  await prisma.$executeRawUnsafe(`DELETE FROM fichas WHERE id != '${targetFichaId}';`);

  console.log("Eliminando programas no deseados...");
  await prisma.$executeRawUnsafe(`DELETE FROM programas WHERE id != '${targetProgramaId}';`);

  // Limpiar huerfanos (opcional)
  console.log("Eliminando aprendices huérfanos...");
  await prisma.$executeRawUnsafe(`DELETE FROM aprendices WHERE fichaId NOT IN (SELECT id FROM fichas);`);
  
  console.log("Eliminando actividades huérfanas...");
  await prisma.$executeRawUnsafe(`DELETE FROM actividades WHERE fichaId NOT IN (SELECT id FROM fichas);`);
  
  console.log("Eliminando competencias huérfanas...");
  // Las competencias están ligadas al programa
  // La tabla intermedia _CompetenciaToPrograma necesita limpiarse
  await prisma.$executeRawUnsafe(`DELETE FROM _CompetenciaToPrograma WHERE B NOT IN (SELECT id FROM programas);`);
  
  console.log("Rehabilitando llaves foráneas...");
  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS=1;`);

  console.log("¡Limpieza completada con éxito!");
}

main()
  .catch(async (e) => {
    console.error("Error durante la limpieza:", e);
    await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS=1;`);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
