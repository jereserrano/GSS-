import React from "react";
import { UsuariosTable } from "@/features/administracion/UsuariosTable";
import { getUsers, getRoles } from "@/actions/user.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getHierarchyLevel } from "@/lib/hierarchy";
import { redirect } from "next/navigation";

export default async function UsuariosPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect("/login");

  const u = session.user as any;
  const currentUserSession = {
    id: u.id,
    role: u.role || "",
    hierarchyLevel: u.hierarchyLevel ?? getHierarchyLevel(u.role),
  };

  const usuarios = await getUsers();
  let roles = await getRoles();

  // Restringir roles para APOYO_COORDINACION
  if (currentUserSession.role.toUpperCase() === "APOYO_COORDINACION") {
    roles = roles.filter((r: any) => ["APRENDIZ", "INSTRUCTOR"].includes(r));
  }
  const { prisma } = await import("@/lib/prisma");
  const instituciones = await prisma.institucion.findMany({ select: { id: true, nombre: true }, orderBy: { nombre: "asc" } });

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Gestión de Usuarios</h1>
        <p className="text-text-secondary mt-1">
          Administración de cuentas de acceso al sistema GSS.
        </p>
      </div>
      <UsuariosTable
        initialUsers={usuarios}
        roles={roles}
        instituciones={instituciones}
        currentUserSession={currentUserSession}
      />
    </div>
  );
}
