const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const excusas = await prisma.excusa.findMany({
    where: { archivoUrl: { startsWith: '/uploads/' } }
  });

  for (const ex of excusas) {
    const newUrl = ex.archivoUrl.replace('/uploads/', '/api/uploads/');
    await prisma.excusa.update({
      where: { id: ex.id },
      data: { archivoUrl: newUrl }
    });
    console.log(`Corregido: ${newUrl}`);
  }

  const mensajes = await prisma.mensaje.findMany({
    where: { adjuntoUrl: { startsWith: '/uploads/' } }
  });

  for (const msj of mensajes) {
    const newUrl = msj.adjuntoUrl.replace('/uploads/', '/api/uploads/');
    await prisma.mensaje.update({
      where: { id: msj.id },
      data: { adjuntoUrl: newUrl }
    });
    console.log(`Corregido: ${newUrl}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
