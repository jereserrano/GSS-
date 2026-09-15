import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserLoginSchema } from "@/lib/validations";

export const authOptions = {
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

        let normalizedRole = "INSTRUCTOR";
        if (user.rol.nombre.toUpperCase().includes("ADMIN")) normalizedRole = "ADMINISTRADOR";
        else if (user.rol.nombre.toUpperCase().includes("COORD")) normalizedRole = "COORDINADOR";

        return {
          id: user.id,
          name: user.nombre,
          email: user.email,
          role: normalizedRole,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Agregar rol y persistir datos en el JWT en el primer login
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      // Permitir actualización de sesión desde el cliente
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      // Exponer rol, id, nombre y email en la sesión del cliente
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).name = token.name;
        (session.user as any).email = token.email;
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

  secret: process.env.NEXTAUTH_SECRET as string,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
