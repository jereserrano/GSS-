import { CentroCalificaciones } from "@/features/ejecucion/CentroCalificaciones";
import { ExploradorProgramas } from "@/components/shared/ExploradorProgramas";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function CentroCalificacionesPage() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role?.toUpperCase();
  const isAdminOrCoord = userRole === "ADMINISTRADOR" || userRole === "COORDINADOR";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {isAdminOrCoord ? (
        <ExploradorProgramas basePath="/centro-calificaciones/ficha" moduloName="Centro de Calificaciones" />
      ) : (
        <CentroCalificaciones />
      )}
    </div>
  );
}
