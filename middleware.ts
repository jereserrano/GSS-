import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Protege todas las rutas del grupo (dashboard)
export default withAuth(
  function middleware(req) {
    // Si está autenticado, continúa normalmente
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

// Aplicar middleware SOLO a las rutas del dashboard
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
