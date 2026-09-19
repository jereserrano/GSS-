import React from "react";
import { RiesgosTable } from "@/features/seguimiento/RiesgosTable";
import { getRiesgosAction } from "@/actions/riesgos.actions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export default async function RiesgosPage({ searchParams }: { searchParams: Promise<{ busqueda?: string }> }) {
  const session = await getServerSession();
  let instructorId: string | null = null;
  let fichaIds: string[] = [];
  let fichasData: any[] = [];
  
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email },
      include: { rol: true, instructor: true }
    });
    
    if (user?.rol?.nombre?.toUpperCase() === "INSTRUCTOR" && user.instructor) {
      instructorId = user.instructor.id;
      const instructorFichas = await prisma.instructorFicha.findMany({
        where: { instructorId },
        select: { fichaId: true }
      });
      fichaIds = instructorFichas.map((f: any) => f.fichaId);

      fichasData = await prisma.ficha.findMany({
        where: { id: { in: fichaIds } },
        include: {
          programa: true,
          aprendices: {
            include: { alertas: { where: { gestionada: false } } }
          }
        }
      });
    }
  }

  const result = await getRiesgosAction({ 
    busqueda: (await searchParams).busqueda,
    fichaIds 
  });
  const initialData = result.success ? result.data : null;

  const aprendices = await prisma.aprendiz.findMany({
    select: { 
      id: true, 
      nombres: true, 
      apellidos: true, 
      numeroDocumento: true,
      ficha: { select: { codigo: true } }
    },
    where: { 
      estado: "EN_FORMACION",
      ...(instructorId ? { fichaId: { in: fichaIds } } : {})
    },
    orderBy: { apellidos: "asc" }
  });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Sistema de Riesgos</h1>
        <p className="text-text-secondary mt-1">
          Alertas tempranas por deserción, inasistencia o bajo rendimiento.
        </p>
      </div>

      {instructorId && fichasData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {fichasData.map((ficha) => {
            const riesgosAltos = ficha.aprendices.flatMap((a: any) => a.alertas.filter((r: any) => r.nivel === "ALTO")).length;
            const riesgosMedios = ficha.aprendices.flatMap((a: any) => a.alertas.filter((r: any) => r.nivel === "MEDIO")).length;
            const riesgosBajos = ficha.aprendices.flatMap((a: any) => a.alertas.filter((r: any) => r.nivel === "BAJO")).length;
            
            let nivelRiesgoFicha = "BAJO";
            let colorClase = "bg-success-50 text-success-700 border-success-200";
            if (riesgosAltos > 0) {
              nivelRiesgoFicha = "ALTO";
              colorClase = "bg-danger-50 text-danger-700 border-danger-200";
            } else if (riesgosMedios > 0) {
              nivelRiesgoFicha = "MEDIO";
              colorClase = "bg-warning-50 text-warning-700 border-warning-200";
            }

            return (
              <div key={ficha.id} className={`p-4 rounded-xl border ${colorClase} flex flex-col gap-2`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm">Ficha: {ficha.codigo}</h3>
                    <p className="text-xs opacity-80 line-clamp-1" title={ficha.programa?.nombre}>{ficha.programa?.nombre}</p>
                  </div>
                  <span className="px-2 py-1 bg-white/50 rounded-md text-xs font-bold shadow-sm uppercase tracking-wider">
                    Riesgo {nivelRiesgoFicha}
                  </span>
                </div>
                <div className="mt-2 text-xs flex gap-3 opacity-90">
                  <span>Altos: {riesgosAltos}</span>
                  <span>Medios: {riesgosMedios}</span>
                  <span>Bajos: {riesgosBajos}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RiesgosTable initialData={initialData} aprendices={aprendices} />
    </div>
  );
}
