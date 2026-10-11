import React from "react";
import { RolesTable } from "@/features/administracion/RolesTable";
import { getRolesWithStats } from "@/actions/roles.actions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { redirect } from "next/navigation";

export default async function RolesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any)?.role?.toUpperCase() || "";
  if (role === "COORDINADOR_SEDE" || (role.includes("COORD") && role.includes("SEDE")) || (!role.includes("ADMIN") && role !== "COORDINADOR")) {
    redirect("/dashboard");
  }

  const initialRoles = await getRolesWithStats();
  const isAdmin = role === "ADMINISTRADOR";

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Roles y Permisos</h1>
        <p className="text-text-secondary mt-1">
          Definición de perfiles y niveles de acceso a los módulos del sistema institucional.
        </p>
      </div>
      <RolesTable initialRoles={initialRoles} isAdmin={isAdmin} />
    </div>
  );
}
