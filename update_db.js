const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log("Renombrando columnas en la tabla users...");
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE `users` RENAME COLUMN `msAccessToken` TO `zoomAccessToken`');
    console.log("✓ zoomAccessToken actualizado");
  } catch(e) { console.log("Omitido o ya existe:", e.message) }

  try {
    await prisma.$executeRawUnsafe('ALTER TABLE `users` RENAME COLUMN `msRefreshToken` TO `zoomRefreshToken`');
    console.log("✓ zoomRefreshToken actualizado");
  } catch(e) { console.log("Omitido o ya existe:", e.message) }

  console.log("Renombrando columnas en la tabla clases_virtuales...");
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE `clases_virtuales` RENAME COLUMN `microsoftMeetingId` TO `zoomMeetingId`');
    console.log("✓ zoomMeetingId actualizado");
  } catch(e) { console.log("Omitido o ya existe:", e.message) }

  console.log("¡Cambios aplicados correctamente en la base de datos!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
