const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Get an institucion
    const inst = await prisma.institucion.findFirst();
    if (!inst) {
      console.log("No institucion found");
      return;
    }

    // 2. Create or find Subsede Cienaga
    let sede = await prisma.sede.findFirst({ where: { nombre: { contains: "cienaga" } } });
    if (!sede) {
      sede = await prisma.sede.create({
        data: {
          nombre: "Subsede Cienaga",
          municipio: "Cienaga",
          direccion: "Centro",
          institucionId: inst.id
        }
      });
      console.log("Created Sede:", sede.id);
    } else {
      console.log("Found Sede:", sede.id);
    }

    // 3. Find Programa
    const prog = await prisma.programa.findFirst({
      where: { nombre: { contains: "analisis" } }
    });
    if (!prog) {
      console.log("No programa found");
      return;
    }
    console.log("Found programa:", prog.id);

    // 4. Update Ficha
    const ficha = await prisma.ficha.findFirst({
      where: { programaId: prog.id }
    });
    if (!ficha) {
      console.log("No ficha found for this programa");
      return;
    }
    await prisma.ficha.update({
      where: { id: ficha.id },
      data: { sedeId: sede.id }
    });
    console.log("Updated Ficha:", ficha.codigo, "to Sede:", sede.nombre);

    // 5. Update user luis@sena.edu.co
    let luis = await prisma.user.findUnique({ where: { email: "luis@sena.edu.co" } });
    if (!luis) {
      luis = await prisma.user.create({
        data: {
          email: "luis@sena.edu.co",
          nombre: "Luis",
          apellido: "Apoyo",
          password: "password123", // In a real app we'd hash this
          rol: "APOYO_COORDINACION",
          estado: "ACTIVO",
          sedeId: sede.id
        }
      });
      console.log("Created user luis@sena.edu.co");
    } else {
      await prisma.user.update({
        where: { id: luis.id },
        data: { rol: "APOYO_COORDINACION", sedeId: sede.id }
      });
      console.log("Updated user luis@sena.edu.co");
    }

    console.log("All data assigned successfully!");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
