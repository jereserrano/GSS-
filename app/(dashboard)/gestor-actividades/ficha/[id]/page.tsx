import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { GestorActividades } from "@/features/ejecucion/GestorActividades";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GestorActividadesFichaPage({ params }: PageProps) {
  const resolvedParams = await params;
  const fichaId = resolvedParams.id;

  const ficha = await prisma.ficha.findUnique({
    where: { id: fichaId },
    include: { programa: true }
  });

  if (!ficha) {
    notFound();
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/gestor-actividades">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestor de Actividades</h1>
          <p className="text-gray-500">
            Ficha {ficha.codigo} - {ficha.programa.nombre}
          </p>
        </div>
      </div>
      
      <GestorActividades initialFichaId={ficha.id} hideSelector={true} />
    </div>
  );
}
