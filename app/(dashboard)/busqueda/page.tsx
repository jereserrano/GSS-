import React from "react";
import { BusquedaPageClient } from "./BusquedaPageClient";
import { buscarGlobalmente } from "@/actions/busqueda.actions";

export const dynamic = "force-dynamic";

export default async function BusquedaPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || "";
  let resultados: any = { aprendices: [], fichas: [], actividades: [] };
  
  if (query.trim().length > 0) {
    const response = await buscarGlobalmente(query);
    if (response.success && response.data) {
      resultados = response.data;
    }
  }

  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Resultados de Búsqueda
        </h1>
        <p className="text-text-secondary mt-1">
          Buscando: <span className="font-semibold text-sena-600">"{query}"</span>
        </p>
      </div>

      <BusquedaPageClient query={query} resultados={resultados} />
    </div>
  );
}
