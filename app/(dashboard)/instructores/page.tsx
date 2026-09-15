import React from "react";
import { InstructoresTable } from "@/features/actores/InstructoresTable";

export default function InstructoresPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Instructores SENA</h1>
        <p className="text-text-secondary mt-1">
          Personal encargado de impartir la formación técnica en articulación.
        </p>
      </div>

      <InstructoresTable />
    </div>
  );
}
