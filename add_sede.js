const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE users ADD COLUMN sedeId VARCHAR(191) NULL;');
    console.log("Column sedeId added successfully");
  } catch (e) {
    if (e.message.includes("Duplicate column name")) {
       console.log("Column already exists");
    } else {
       console.error("Error:", e);
    }
  }
  
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE users ADD CONSTRAINT users_sedeId_fkey FOREIGN KEY (sedeId) REFERENCES sedes(id) ON DELETE SET NULL ON UPDATE CASCADE;');
    console.log("FK constraint added successfully");
  } catch(e) {
    console.error("FK error:", e);
  }
}

main().finally(() => prisma.$disconnect());
