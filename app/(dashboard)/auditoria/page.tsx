import React from "react";
import { AuditoriaTable } from "@/features/administracion/AuditoriaTable";
import { getAuditLogsAction } from "@/actions/reportes.actions";

export default async function AuditoriaPage() {
  const result = await getAuditLogsAction();
  const initialData = result.success ? result.data : null;

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Auditoría del Sistema</h1>
        <p className="text-text-secondary mt-1">
          Registro inmutable de todas las acciones y eventos críticos realizados en la plataforma.
        </p>
      </div>
      <AuditoriaTable initialData={initialData} />
    </div>
  );
}
