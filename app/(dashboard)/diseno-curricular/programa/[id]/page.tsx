import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DisenoCurricularTree } from "@/features/academico/DisenoCurricularTree";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DisenoCurricularProgramaPage({ params }: PageProps) {
  const resolvedParams = await params;
  const programaId = resolvedParams.id;

  const programa = await prisma.programa.findUnique({
    where: { id: programaId }
  });

  if (!programa) {
    notFound();
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/programas">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diseño Curricular Completo</h1>
          <p className="text-gray-500">
            Programa: {programa.codigo} - {programa.nombre}
          </p>
        </div>
      </div>
      
      {/* We pass the initial programaId so the tree loads directly for this program */}
      <DisenoCurricularTree initialProgramaId={programa.id} hideSelector={true} />
    </div>
  );
}
