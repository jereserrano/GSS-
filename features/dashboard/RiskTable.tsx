"use client";

import React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { RiskBadge } from "@/components/shared/RiskBadge";
import type { Aprendiz } from "@/types/aprendiz.types";
import type { ColumnaDef } from "@/types/common.types";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface RiskTableProps {
  aprendices: Aprendiz[];
  isLoading: boolean;
}

export function RiskTable({ aprendices, isLoading }: RiskTableProps) {
  const columnas: ColumnaDef<Aprendiz>[] = [
    {
      key: "nombres",
      header: "Aprendiz",
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-medium">{a.nombres} {a.apellidos}</span>
          <span className="text-xs text-text-secondary">{a.numeroDocumento}</span>
        </div>
      )
    },
    {
      key: "ficha",
      header: "Ficha",
      render: (a) => (
        <div className="flex flex-col">
          <span>{a.ficha?.codigo || "—"}</span>
          <span className="text-xs text-text-secondary truncate max-w-[150px]">
            {a.institucion?.nombre || "—"}
          </span>
        </div>
      )
    },
    {
      key: "porcentajeAsistencia",
      header: "Asist.",
      align: "center",
      render: (a) => (
        <span className={a.porcentajeAsistencia < 75 ? "text-danger-600 font-medium" : ""}>
          {a.porcentajeAsistencia}%
        </span>
      )
    },
    {
      key: "nivelRiesgo",
      header: "Riesgo",
      align: "center",
      render: (a) => <RiskBadge nivel={a.nivelRiesgo} />
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      render: (a) => (
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/aprendices/${a.id}`}>
            <ChevronRight size={16} />
          </Link>
        </Button>
      )
    }
  ];

  return (
    <div className="card-institucional flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-text-primary">Atención Prioritaria</h3>
          <p className="text-sm text-text-secondary">Aprendices en riesgo alto o medio</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/riesgos">Ver todos</Link>
        </Button>
      </div>
      
      <div className="flex-1">
        <DataTable 
          data={aprendices}
          columnas={columnas}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
