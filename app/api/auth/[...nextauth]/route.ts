import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserLoginSchema } from "@/lib/validations";
import { getHierarchyLevel } from "@/lib/hierarchy";

export const authOptions: AuthOptions = {
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

        const cleanEmail = parsed.data.email.trim().toLowerCase();
        const { password } = parsed.data;

        // Buscar usuario en la BD
        const user = await prisma.user.findFirst({
          where: { email: { equals: cleanEmail } },
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
        const rolUpper = user.rol.nombre.toUpperCase();
        if (rolUpper.includes("ADMIN")) normalizedRole = "ADMINISTRADOR";
        else if (rolUpper.includes("APRENDIZ")) normalizedRole = "APRENDIZ";
        else if (rolUpper.includes("APOYO")) normalizedRole = "APOYO_ADMINISTRATIVO";
        else if (rolUpper.includes("SEDE")) normalizedRole = "COORDINADOR_SEDE";
        else if (rolUpper.includes("COORD")) normalizedRole = "COORDINADOR";
        else if (rolUpper.includes("INSTRUCT")) normalizedRole = "INSTRUCTOR";

        const hierarchyLevel = getHierarchyLevel(user.rol.nombre);

        return {
          id: user.id,
          name: user.nombre,
          email: user.email,
          role: normalizedRole,
          rolName: user.rol.nombre,
          hierarchyLevel,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Primer login: poblar el JWT con datos del usuario autenticado desde BD
      if (user) {
        token.role = user.role;
        token.rolName = user.rolName;
        token.hierarchyLevel = user.hierarchyLevel;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      // Actualización de sesión desde el cliente: SOLO campos seguros, NUNCA role/hierarchyLevel
      if (trigger === "update" && session) {
        if (typeof session.name === "string" && session.name) {
          token.name = session.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Copiar datos del JWT (origen confiable del servidor) hacia session.user del cliente
      if (session.user) {
        session.user.role = token.role;
        session.user.rolName = token.rolName;
        session.user.hierarchyLevel = token.hierarchyLevel;
        session.user.id = token.id;
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
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
