import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ImportarAprendicesClient } from "./ImportarAprendicesClient";
import { redirect } from "next/navigation";

export default async function ImportarPage() {
  const session = await getServerSession(authOptions);
  const rol = session?.user?.role?.toUpperCase() || "";

  // Solo Administradores y Coordinadores pueden importar
  const allowedRoles = ["ADMINISTRADOR", "COORDINADOR", "COORDINADOR_ACADEMICO", "COORDINADOR_SEDE", "COORDINADOR_REGIONAL"];
  const isAllowed = allowedRoles.some(r => rol.includes(r) || rol === r);

  if (!isAllowed) {
    redirect("/dashboard");
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <ImportarAprendicesClient />
    </div>
  );
}
