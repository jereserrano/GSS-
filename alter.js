const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.$executeRawUnsafe("ALTER TABLE instructores ADD COLUMN emailPersonal VARCHAR(191) NULL")
  .then(console.log)
  .catch(console.error)
  .finally(() => p.$disconnect());
