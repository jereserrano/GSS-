import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { canAccessRoute } from "./lib/permissions";

// Protege y autoriza todas las rutas del dashboard mediante RBAC
export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;
    const pathname = req.nextUrl.pathname;
    const role = (token?.role as string) || "APRENDIZ";

    // Validar autorización de rol para la ruta solicitada
    if (!canAccessRoute(role, pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("denied", "true");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Solo usuarios con JWT válido
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Aplicar middleware a todas las rutas protegidas del sistema
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/instituciones/:path*",
    "/sedes/:path*",
    "/programas/:path*",
    "/fichas/:path*",
    "/aprendices/:path*",
    "/instructores/:path*",
    "/docentes/:path*",
    "/competencias/:path*",
    "/resultados-aprendizaje/:path*",
    "/plan-formacion/:path*",
    "/actividades/:path*",
    "/entregas/:path*",
    "/asistencia/:path*",
    "/evaluaciones/:path*",
    "/resultados/:path*",
    "/seguimiento/:path*",
    "/riesgos/:path*",
    "/reportes/:path*",
    "/documentos/:path*",
    "/notificaciones/:path*",
    "/usuarios/:path*",
    "/roles/:path*",
    "/auditoria/:path*",
    "/configuracion/:path*",
  ],
};
