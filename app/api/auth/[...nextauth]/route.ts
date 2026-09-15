import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserLoginSchema } from "@/lib/validations";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credenciales SENA",
      credentials: {
        email: { label: "Correo electrónico", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        // Validar campos con Zod
        const parsed = UserLoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Buscar usuario en la BD
        const user = await prisma.user.findUnique({
          where: { email },
          include: { rol: true },
        });

        if (!user || user.estado !== "ACTIVO") return null;

        // Verificar contraseña
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Actualizar último acceso
        await prisma.user.update({
          where: { id: user.id },
          data: { ultimoAcceso: new Date() },
        });

        return {
          id: user.id,
          name: user.nombre,
          email: user.email,
          role: user.rol.nombre,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Agregar rol al JWT en el primer login
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Exponer rol en la sesión del cliente
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas (jornada laboral SENA)
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
