import React from "react";
import { RolesTable } from "@/features/administracion/RolesTable";
import { getRolesWithStats } from "@/actions/roles.actions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function RolesPage() {
  const initialRoles = await getRolesWithStats();
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as any)?.role?.toUpperCase() === "ADMINISTRADOR";

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
