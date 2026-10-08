import { SeguimientoRiesgosConsolidado } from "@/features/seguimiento/SeguimientoRiesgosConsolidado";
import { SaludAcademicaAprendiz } from "@/features/seguimiento/SaludAcademicaAprendiz";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ExploradorProgramas } from "@/components/shared/ExploradorProgramas";

export default async function SeguimientoRiesgosPage() {
  const session = await getServerSession(authOptions);
  const rol = session?.user?.role?.toUpperCase();
  const isAdminOrCoord = rol === "ADMINISTRADOR" || rol === "COORDINADOR";
  const isAprendiz = rol === "APRENDIZ";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {isAdminOrCoord ? (
        <ExploradorProgramas basePath="/seguimiento-riesgos/ficha" moduloName="Seguimiento a Riesgos" />
      ) : isAprendiz ? (
        <SaludAcademicaAprendiz />
      ) : (
        <SeguimientoRiesgosConsolidado />
      )}
    </div>
  );
}
