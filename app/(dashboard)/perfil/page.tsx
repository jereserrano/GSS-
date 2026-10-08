import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PerfilUsuario } from "@/features/perfil/PerfilUsuario";
import { Suspense } from "react";

export const metadata = {
  title: "Mi Perfil | GSS Media Técnica",
};

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Mi Perfil</h1>
        <p className="text-text-secondary mt-1">Gestiona tu información personal y foto de perfil.</p>
      </div>

      <Suspense fallback={<div className="py-10 text-center text-gray-500 animate-pulse">Cargando perfil...</div>}>
        <PerfilUsuario userId={session.user.id} role={(session.user as any).role || ""} />
      </Suspense>
    </div>
  );
}
