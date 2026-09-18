import type { DefaultSession, DefaultJWT } from "next-auth";

/**
 * Extensión del tipo Session de NextAuth para incluir los campos
 * de rol, jerarquía e id del sistema GSS.
 *
 * Esta declaración es OBLIGATORIA para que useSession() exponga
 * correctamente los campos de rol en el cliente.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      /** Rol normalizado del sistema (ej: "ADMINISTRADOR", "INSTRUCTOR") */
      role: string;
      /** Nombre real del rol tal como está en la base de datos */
      rolName: string;
      /** Nivel de jerarquía numérico (1 = mayor autoridad) */
      hierarchyLevel: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    /** Rol normalizado */
    role: string;
    /** Nombre real del rol en BD */
    rolName: string;
    /** Nivel de jerarquía */
    hierarchyLevel: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    /** Rol normalizado del sistema */
    role: string;
    /** Nombre real del rol en BD */
    rolName: string;
    /** Nivel de jerarquía numérico */
    hierarchyLevel: number;
  }
}
