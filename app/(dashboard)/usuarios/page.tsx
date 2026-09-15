import React from "react";
import { UsuariosTable } from "@/features/administracion/UsuariosTable";
import { getUsers, getRoles } from "@/actions/user.actions";

export default async function UsuariosPage() {
  const usuarios = await getUsers();
  const roles = await getRoles();

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Gestión de Usuarios</h1>
        <p className="text-text-secondary mt-1">
          Administración de cuentas de acceso al sistema Maestro.
        </p>
      </div>
      <UsuariosTable initialUsers={usuarios} roles={roles} />
    </div>
  );
}
