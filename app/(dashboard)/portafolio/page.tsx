import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PortafolioAprendiz } from "@/features/portafolio/PortafolioAprendiz";
import { GoogleDriveConfig } from "@/features/portafolio/GoogleDriveConfig";
import { Archive } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Mi Portafolio | GSS Media Técnica",
  description: "Explora y descarga todas tus evidencias organizadas por competencia y resultado de aprendizaje.",
};

export default async function PortafolioPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.role !== "APRENDIZ") {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });

  return (
    <div className="page-container space-y-6 page-enter">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
          <Archive size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Mi Portafolio</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Todas tus evidencias organizadas automáticamente por Competencia y Resultado de Aprendizaje
          </p>
        </div>
      </div>

      <GoogleDriveConfig isLinked={!!user?.googleDriveLinked} />
      <PortafolioAprendiz />
    </div>
  );
}
