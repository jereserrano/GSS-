import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExcusasAprendiz } from "@/features/seguimiento/ExcusasAprendiz";
import { redirect } from "next/navigation";

export default async function MisExcusasPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Verificar si es aprendiz
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { aprendiz: true }
  });

  if (!user?.aprendiz) {
    return (
      <div className="page-container text-center py-20">
        <h2 className="text-xl font-bold">No tienes el rol de Aprendiz.</h2>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Mis Excusas</h1>
        <p className="text-text-secondary mt-1">
          Radica excusas por inasistencia y consulta su estado de aprobación.
        </p>
      </div>

      <ExcusasAprendiz />
    </div>
  );
}
