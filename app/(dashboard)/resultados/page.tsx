import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Target } from "lucide-react";

export default function ResultadosPage() {
  return (
    <div className="page-container space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Resultados Académicos</h1>
        <p className="text-text-secondary mt-1">
          Consolidado de rendimiento por competencia, RAP y ficha.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Tasa de Aprobación Global", valor: "87.2%", icono: Award, color: "text-success-600 bg-success-50" },
          { label: "RAPs Completados (promedio)", valor: "6 / 9", icono: Target, color: "text-sena-600 bg-sena-50" },
          { label: "Promedio General", valor: "3.6 / 5.0", icono: TrendingUp, color: "text-verde-600 bg-verde-50" },
        ].map((stat, idx) => {
          const Icon = stat.icono;
          return (
            <Card key={idx} className="border-0 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-text-secondary font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.valor}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-0 shadow-sm min-h-[400px]">
        <CardHeader>
          <CardTitle>Distribución de Resultados por Competencia</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px] text-text-secondary italic">
          Gráfico de barras por competencia (datos reales desde MySQL en construcción)
        </CardContent>
      </Card>
    </div>
  );
}
