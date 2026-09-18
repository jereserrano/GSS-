import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const users = await prisma.user.findMany({ include: { rol: true }, take: 20 });
users.forEach(u => console.log(JSON.stringify({ email: u.email, nombre: u.nombre, rol: u.rol.nombre, estado: u.estado })));
await prisma.$disconnect();
