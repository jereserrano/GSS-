import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoIcon, Clock, Users } from "lucide-react";
import { ClaseVirtualFormDialog } from "@/features/clases-virtuales/ClaseVirtualFormDialog";
import { DeleteClaseButton } from "@/features/clases-virtuales/DeleteClaseButton";

export const metadata = {
  title: "Clases Virtuales | GSS SENA",
};

export default async function ClasesVirtualesPage() {
  const session = await getServerSession();
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email || "" },
    include: { instructor: true, aprendiz: true }
  });

  if (!user) return null;

  let clases: any[] = [];
  let fichasMapped: { id: string; codigo: string; programa: string }[] = [];
  
  if (user.rol.includes("INSTRUCT") && user.instructor) {
    clases = await prisma.claseVirtual.findMany({
      where: { instructorId: user.instructor.id },
      include: { ficha: { select: { codigo: true, programa: { select: { nombre: true } } } } },
      orderBy: { fechaInicio: "desc" }
    });

    const fichasData = await prisma.instructorFicha.findMany({
      where: { instructorId: user.instructor.id },
      include: { ficha: { include: { programa: true } } }
    });
    
    fichasMapped = fichasData.map(fi => ({
      id: fi.ficha.id,
      codigo: fi.ficha.codigo,
      programa: fi.ficha.programa.nombre
    }));
  } else if (user.rol.includes("APRENDIZ") && user.aprendiz) {
    clases = await prisma.claseVirtual.findMany({
      where: { fichaId: user.aprendiz.fichaId },
      include: { instructor: { select: { nombres: true, apellidos: true } } },
      orderBy: { fechaInicio: "desc" }
    });
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-sena-navy">Clases Virtuales (Zoom)</h1>
          <p className="text-muted-foreground">
            {user.rol.includes("INSTRUCT") 
              ? "Programa y gestiona tus sesiones sincrónicas con las fichas asignadas." 
              : "Encuentra los enlaces a tus próximas sesiones sincrónicas."}
          </p>
        </div>
        {user.rol.includes("INSTRUCT") && (
          <ClaseVirtualFormDialog fichas={fichasMapped} />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clases.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-white rounded-lg border border-dashed">
            No hay clases virtuales programadas.
          </div>
        ) : (
          clases.map((clase) => (
            <Card key={clase.id} className="overflow-hidden border-t-4 border-t-sena-green hover:shadow-md transition-all">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <Badge variant={clase.estado === "ACTIVO" ? "default" : "secondary"}>
                    {clase.estado}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <VideoIcon className="h-5 w-5 text-sena-green" />
                    {user.rol.includes("INSTRUCT") && (
                      <DeleteClaseButton claseId={clase.id} />
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl mt-2">{clase.titulo}</CardTitle>
                {clase.descripcion && <CardDescription>{clase.descripcion}</CardDescription>}
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {new Date(clase.fechaInicio).toLocaleString()} ({clase.duracionMin} min)
                </div>
                {clase.ficha && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Ficha: {clase.ficha.codigo} - {clase.ficha.programa?.nombre}
                  </div>
                )}
                {(clase as any).instructor && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Instructor: {(clase as any).instructor.nombres} {(clase as any).instructor.apellidos}
                  </div>
                )}
                {clase.enlaceUrl ? (
                  <a 
                    href={clase.enlaceUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-4 flex w-full items-center justify-center rounded-md bg-[#2D8CFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#1C69D4] transition-colors"
                  >
                    Unirse a la reunión de Zoom
                  </a>
                ) : (
                  <div className="mt-4 text-center text-sm text-muted-foreground italic">
                    Enlace no disponible
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
