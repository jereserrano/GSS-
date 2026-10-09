import { GestorActividades } from "@/features/ejecucion/GestorActividades";
import { GestorActividadesGlobal } from "@/features/ejecucion/GestorActividadesGlobal";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function GestorActividadesPage() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role?.toUpperCase();
  const isAdminOrCoord = userRole === "ADMINISTRADOR" || userRole === "COORDINADOR";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {isAdminOrCoord ? (
        <GestorActividadesGlobal />
      ) : (
        <GestorActividades />
      )}
    </div>
  );
}
