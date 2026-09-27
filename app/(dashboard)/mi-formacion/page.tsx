import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function MiFormacionPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== "APRENDIZ") {
    redirect("/dashboard");
  }

  const aprendiz = await prisma.aprendiz.findUnique({
    where: { userId: session.user.id },
    include: {
      ficha: {
        include: {
          programa: true,
          institucion: true,
          sede: true,
        }
      },
      detallesAsistencia: {
        include: { asistencia: true }
      },
      evaluaciones: {
        include: { resultadoAprendizaje: true }
      }
    }
  });

  if (!aprendiz) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No se encontró información del aprendiz asociada a este usuario.
      </div>
    );
  }

  const totalAsistencias = aprendiz.detallesAsistencia.length;
  const faltas = aprendiz.detallesAsistencia.filter(d => d.estado === "FALLA").length;
  const porcentaje = totalAsistencias > 0 
    ? Math.round(((totalAsistencias - faltas) / totalAsistencias) * 100) 
    : 100;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Mi Formación</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ficha / Programa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aprendiz.ficha.codigo}</div>
            <p className="text-xs text-muted-foreground">
              {aprendiz.ficha.programa.nombre}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{porcentaje}%</div>
            <p className="text-xs text-muted-foreground">
              {faltas} faltas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sede / Institución</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{aprendiz.ficha.sede.nombre}</div>
            <p className="text-xs text-muted-foreground">
              {aprendiz.ficha.institucion.nombre}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resultados de Aprendizaje</CardTitle>
          </CardHeader>
          <CardContent>
            {aprendiz.evaluaciones.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay evaluaciones registradas aún.</p>
            ) : (
              <ul className="space-y-4">
                {aprendiz.evaluaciones.map(ev => (
                  <li key={ev.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{ev.resultadoAprendizaje.codigo}</p>
                      <p className="text-xs text-muted-foreground">{ev.resultadoAprendizaje.nombre}</p>
                    </div>
                    <div className="text-sm font-bold p-2 bg-secondary rounded-md">
                      {ev.juicio}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
