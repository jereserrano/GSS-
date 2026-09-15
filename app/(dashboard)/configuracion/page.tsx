import React from "react";
import { ConfiguracionForm } from "@/features/administracion/ConfiguracionForm";

export default function ConfiguracionPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Configuración Global</h1>
        <p className="text-text-secondary mt-1">
          Ajustes generales, variables académicas y reglas de negocio del sistema.
        </p>
      </div>
      <ConfiguracionForm />
    </div>
  );
}
