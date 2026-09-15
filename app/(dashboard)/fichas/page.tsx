import React from "react";
import { FichasTable } from "@/features/fichas/FichasTable";

export default function FichasPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Fichas / Grupos</h1>
        <p className="text-text-secondary mt-1">
          Administración de los grupos de formación vinculados a instituciones educativas.
        </p>
      </div>

      <FichasTable />
    </div>
  );
}
