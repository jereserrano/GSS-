import React from "react";
import { AprendicesTable } from "@/features/aprendices/AprendicesTable";
import { getAprendicesAction } from "@/actions/aprendices.actions";
import { getFichasAction } from "@/actions/fichas.actions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { Users, Building2, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AprendicesPage() {
  const session = await getServerSession(authOptions);
  let isInstructor = false;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { rol: true }
    });
    if (user?.rol?.nombre?.toUpperCase() === "INSTRUCTOR") {
      isInstructor = true;
    }
  }

  if (isInstructor) {
    // Si es instructor, mostramos las fichas en forma de tarjetas
    const resultFichas = await getFichasAction({ pagina: 1, tamano: 100 });
    const misFichas = resultFichas.success ? resultFichas.data?.data || [] : [];

    return (
      <div className="page-container space-y-6 page-enter">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Mis Fichas Asignadas</h1>
          <p className="text-text-secondary mt-1">
            Selecciona una ficha para gestionar y ver a sus aprendices.
          </p>
        </div>

        {misFichas.length === 0 ? (
          <div className="py-12 flex justify-center text-sm text-slate-500">
            No tienes fichas asignadas actualmente.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {misFichas.map((f: any) => (
              <Link key={f.id} href={`/aprendices/ficha/${f.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-primary/80 h-full flex flex-col group">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold flex justify-between items-center group-hover:text-primary transition-colors">
                      Ficha {f.codigo}
                    </CardTitle>
                    <CardDescription className="line-clamp-2" title={f.programa?.nombre}>
                      {f.programa?.nombre}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-slate-400" />
                      <span className="truncate">{f.institucion?.nombre}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      <span className="truncate">{f.sede?.nombre}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Users size={14} />
                        <span>Ver Aprendices</span>
                      </div>
                      <span className="text-[10px] font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">
                        {f.estado}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Si no es instructor, mostramos la tabla global como estaba
  const [initialResult, fichas] = await Promise.all([
    getAprendicesAction({ pagina: 1, tamano: 10 }),
    prisma.ficha.findMany({
      where: { estado: "ACTIVO" },
      select: { id: true, codigo: true },
      orderBy: { codigo: "desc" },
    }),
  ]);

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Aprendices</h1>
        <p className="text-text-secondary mt-1">
          Gestión y seguimiento de los estudiantes vinculados al programa de Media Técnica.
        </p>
      </div>

      <AprendicesTable
        initialData={initialResult.success ? initialResult.data : null}
        fichas={fichas}
      />
    </div>
  );
}
