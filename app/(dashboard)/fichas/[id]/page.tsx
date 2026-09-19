import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function FichaDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) return notFound();

  const resolvedParams = await params;
  const { id } = resolvedParams;

  const ficha = await prisma.ficha.findUnique({
    where: { id },
    include: {
      programa: true,
      institucion: true,
      sede: true,
      instructores: {
        include: {
          instructor: true,
        },
      },
    },
  });

  if (!ficha) return notFound();

  // Helper para el badge del rol
  const getBadgeColor = (rolFicha: string) => {
    switch (rolFicha) {
      case "LIDER_TECNICO":
        return "bg-green-100 text-green-800 border-green-200";
      case "TRANSVERSAL":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "BASICA":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatRol = (rolFicha: string) => {
    switch (rolFicha) {
      case "LIDER_TECNICO":
        return "Líder Técnico";
      case "TRANSVERSAL":
        return "Transversal (Ej: Bilingüismo, Ética)";
      case "BASICA":
        return "Básica (Matemáticas, etc.)";
      default:
        return rolFicha;
    }
  };

  return (
    <div className="page-container space-y-6 page-enter">
      {/* Encabezado Ficha */}
      <div className="bg-white rounded-xl shadow-sm border border-border-light p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Ficha {ficha.codigo}
        </h1>
        <p className="text-text-secondary text-sm mb-4">
          Detalles del grupo y equipo ejecutor asignado.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Programa Técnico
            </h3>
            <p className="text-sm font-medium text-text-primary">
              {ficha.programa.nombre}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Institución
            </h3>
            <p className="text-sm font-medium text-text-primary">
              {ficha.institucion.nombre}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              Sede: {ficha.sede.nombre}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Fechas de Ejecución
            </h3>
            <p className="text-sm font-medium text-text-primary">
              Inicio: {ficha.fechaInicio.toLocaleDateString()}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              Fin: {ficha.fechaFin.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Sección Instructores */}
      <div>
        <h2 className="text-lg font-bold text-text-primary mb-4">
          Equipo Ejecutor (Mis Instructores)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ficha.instructores.length > 0 ? (
            ficha.instructores.map((instFicha) => (
              <div
                key={instFicha.id}
                className="bg-white p-5 rounded-xl border border-border-light shadow-sm flex items-start gap-4 transition-all hover:shadow-md hover:border-primary/20"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-lg flex-shrink-0">
                  {instFicha.instructor.nombres.charAt(0)}
                  {instFicha.instructor.apellidos.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-text-primary truncate">
                    {instFicha.instructor.nombres} {instFicha.instructor.apellidos}
                  </h3>
                  <p className="text-xs text-text-secondary truncate mt-0.5">
                    {instFicha.instructor.email}
                  </p>
                  <div className="mt-2 flex">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${getBadgeColor(
                        instFicha.rolFicha
                      )}`}
                    >
                      {formatRol(instFicha.rolFicha)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-text-secondary col-span-full">
              No hay instructores asignados a esta ficha aún.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
