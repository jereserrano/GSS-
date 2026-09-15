import React from "react";
import { RolesTable } from "@/features/administracion/RolesTable";

export default function RolesPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Roles y Permisos</h1>
        <p className="text-text-secondary mt-1">
          Definición de niveles de acceso a los módulos del sistema.
        </p>
      </div>
      <RolesTable />
    </div>
  );
}
