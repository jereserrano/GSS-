const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addColumns() {
  try {
    console.log("Adding new branding columns to configuracion_sistema table...");
    
    // Check if columns exist first by trying to query them, or just use ALTER TABLE ... ADD COLUMN
    // Since MySQL doesn't support IF NOT EXISTS in ADD COLUMN easily, we can just run them and catch errors if they exist.
    
    const columns = [
      "ALTER TABLE \`users\` ADD COLUMN \`fotoPerfil\` TEXT;"
    ];

    for (const sql of columns) {
      try {
        await prisma.$executeRawUnsafe(sql);
        console.log("Executed:", sql);
      } catch(e) {
        if(e.message.includes("Duplicate column name")) {
          console.log("Column already exists, skipping...");
        } else {
          console.error("Error executing:", sql, e.message);
        }
      }
    }
    
    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addColumns();
