import React from "react";
import { ConfiguracionForm } from "@/features/administracion/ConfiguracionForm";
import { getConfiguracionAction } from "@/actions/configuracion.actions";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ConfiguracionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any)?.role?.toUpperCase() || "";
  if (role === "COORDINADOR_SEDE" || (role.includes("COORD") && role.includes("SEDE")) || (!role.includes("ADMIN") && role !== "COORDINADOR")) {
    redirect("/dashboard");
  }

  const result = await getConfiguracionAction();
  const configuracion = result.success ? result.data : null;

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Configuración Global</h1>
        <p className="text-text-secondary mt-1">
          Ajustes generales, variables académicas y reglas de negocio del sistema.
        </p>
      </div>
      <ConfiguracionForm initialData={configuracion} />
    </div>
  );
}
