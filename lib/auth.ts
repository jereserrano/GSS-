import { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserLoginSchema } from "@/lib/validations";
import { getHierarchyLevel } from "@/lib/hierarchy";
import { authenticator } from "otplib";
import { logAudit } from "@/lib/audit.service";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales SENA",
      credentials: {
        email: { label: "Correo electrónico", type: "email" },
        password: { label: "Contraseña", type: "password" },
        totpCode: { label: "Código 2FA", type: "text" },
        deviceId: { label: "Device ID", type: "text" },
        trustDevice: { label: "Confiar en dispositivo", type: "text" },
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
        });

        if (!user || user.estado !== "ACTIVO") return null;

        // Verificar contraseña
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // --- 2FA y Session Log ---
        if (user.twoFactorEnabled) {
          const { totpCode, deviceId } = parsed.data;
          const trustDevice = String((credentials as any)?.trustDevice) === "true";

          if (!deviceId) throw new Error("Missing device ID");

          // Buscar sesión existente para este dispositivo
          const sessionLog = await prisma.sessionLog.findFirst({
            where: { userId: user.id, deviceId },
            orderBy: { lastActiveAt: "desc" },
          });

          // ¿Este dispositivo está en lista de confianza y aún no expiró?
          const now = new Date();
          const deviceIsTrusted =
            sessionLog?.trustedUntil != null &&
            sessionLog.trustedUntil > now;

          if (!deviceIsTrusted) {
            // Requiere código 2FA
            if (!totpCode || totpCode === "undefined" || totpCode.trim() === "") {
              throw new Error("2FA_REQUIRED");
            }
            if (!user.twoFactorSecret) {
              throw new Error("2FA configuration error");
            }
            const isTotpValid = authenticator.verify({
              token: totpCode,
              secret: user.twoFactorSecret,
            });
            if (!isTotpValid) {
              throw new Error("Invalid 2FA code");
            }

            // Actualizar fecha 2FA global
            await prisma.user.update({
              where: { id: user.id },
              data: { last2FADate: now },
            });
          }

          // Calcular trustedUntil según elección del usuario
          const trustedUntil = trustDevice
            ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 días
            : null;

          // Iniciar sesión en SessionLog — desactivar otros dispositivos
          await prisma.sessionLog.updateMany({
            where: { userId: user.id, deviceId: { not: deviceId } },
            data: { isActive: false },
          });

          if (sessionLog) {
            await prisma.sessionLog.update({
              where: { id: sessionLog.id },
              data: {
                lastActiveAt: now,
                isActive: true,
                // Si el usuario marcó 'Recordar', extendemos a 30 días. Si no, conservamos la fecha que ya tenía.
                trustedUntil: trustDevice ? trustedUntil : sessionLog.trustedUntil,
              },
            });
          } else {
            await prisma.sessionLog.create({
              data: {
                userId: user.id,
                deviceId,
                isActive: true,
                trustedUntil,
              },
            });
          }
        }

        // Actualizar último acceso
        await prisma.user.update({
          where: { id: user.id },
          data: { ultimoAcceso: new Date() },
        });

        // Registrar inicio de sesión en auditoría
        await logAudit({
          userId: user.id,
          modulo: "SEGURIDAD",
          accion: "LOGIN",
          entidad: "User",
          entidadId: user.id,
          detalle: `Inicio de sesión exitoso de ${user.email} (Rol: ${user.rol})`,
        });

        let normalizedRole = user.rol;
        const rolUpper = user.rol.toUpperCase();
        const hierarchyLevel = getHierarchyLevel(rolUpper);

        return {
          id: user.id,
          name: user.nombre,
          email: user.email,
          role: normalizedRole,
          rolName: user.rol,
          hierarchyLevel,
          twoFactorEnabled: user.twoFactorEnabled,
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
        token.twoFactorEnabled = (user as any).twoFactorEnabled;
      }
      // Actualización de sesión desde el cliente: SOLO campos seguros, NUNCA role/hierarchyLevel
      if (trigger === "update" && session) {
        if (typeof session.name === "string" && session.name) {
          token.name = session.name;
        }
        if (session.twoFactorEnabled !== undefined) {
          token.twoFactorEnabled = session.twoFactorEnabled;
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
        session.user.twoFactorEnabled = token.twoFactorEnabled;
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

  // Desactivar cookies seguras para entorno HTTP en red local
  // Esto permite que funcione tanto en localhost como desde la IP de la red
  useSecureCookies: false,

  // Configuración de cookies para aceptar peticiones desde cualquier host en la LAN
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",       // "lax" en vez de "strict" para permitir redirecciones cross-origin
        path: "/",
        secure: false,         // false porque estamos en HTTP (no HTTPS)
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },
};
