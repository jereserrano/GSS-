import { DisenoCurricularTree } from "@/features/academico/DisenoCurricularTree";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ExploradorProgramas } from "@/components/shared/ExploradorProgramas";

export default async function DisenoCurricularPage() {
  const session = await getServerSession(authOptions);
  const rol = session?.user?.role?.toUpperCase();
  const isAdminOrCoord = rol === "ADMINISTRADOR" || rol === "COORDINADOR" || rol === "APOYO_COORDINACION";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {isAdminOrCoord ? (
        <ExploradorProgramas basePath="/diseno-curricular/ficha" moduloName="Diseño Curricular" />
      ) : (
        <DisenoCurricularTree />
      )}
    </div>
  );
}
