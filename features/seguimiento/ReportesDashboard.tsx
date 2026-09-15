"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, PieChart, TrendingUp, Users, BookOpen } from "lucide-react";

export function ReportesDashboard() {
  const reportes = [
    {
      titulo: "Reporte General de Matrícula",
      descripcion: "Consolidado de aprendices activos por institución y programa.",
      icono: Users,
      color: "text-sena-600 bg-sena-50"
    },
    {
      titulo: "Rendimiento Académico",
      descripcion: "Análisis de juicios valorativos (A/D) por trimestre.",
      icono: TrendingUp,
      color: "text-verde-600 bg-verde-50"
    },
    {
      titulo: "Reporte de Deserción",
      descripcion: "Estadísticas de aprendices inactivos, retirados o cancelados.",
      icono: PieChart,
      color: "text-danger-600 bg-danger-50"
    },
    {
      titulo: "Plan Estratégico",
      descripcion: "Avance del plan de formación por cada una de las fichas.",
      icono: BookOpen,
      color: "text-info-600 bg-info-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {reportes.map((rep, idx) => {
        const Icon = rep.icono;
        return (
          <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className={`p-3 rounded-xl ${rep.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <CardTitle className="text-lg">{rep.titulo}</CardTitle>
                <CardDescription className="mt-1">{rep.descripcion}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 border-t mt-4 flex justify-between items-center bg-slate-50">
              <span className="text-xs text-text-secondary">Última actualización: Hoy</span>
              <Button size="sm" variant="outline" className="gap-2">
                <FileDown size={16} /> Descargar Excel
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
