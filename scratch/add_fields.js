const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE users ADD COLUMN googleDriveLinked BOOLEAN DEFAULT false, ADD COLUMN googleDriveFolderId VARCHAR(255), ADD COLUMN googleRefreshToken TEXT;');
  console.log('Done');
}
main().catch(console.error);
