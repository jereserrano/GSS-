import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRaw`ALTER TABLE users ADD COLUMN firmaDigitalUrl TEXT NULL`;
    console.log('Column added');
  } catch (error: any) {
    console.error('Error (might already exist):', error.message);
  }
}

main().finally(() => prisma.$disconnect());
