import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { KpiData } from "@/types/common.types";
import { Users, Building2, MapPin, Target, TrendingUp, AlertTriangle } from "lucide-react";

// Mapeo dinámico de íconos
const IconMap = {
  Users,
  Building2,
  MapPin,
  Target,
  TrendingUp,
  AlertTriangle
} as Record<string, React.ElementType>;

export function KpiCard({ kpi }: { kpi: KpiData }) {
  const Icon = IconMap[kpi.icono] || Users;

  return (
    <Card className="border-0 shadow-sm overflow-hidden relative group">
      {/* Línea de color superior decorativa */}
      <div className={cn("absolute top-0 left-0 right-0 h-1", kpi.color)} />
      
      <CardContent className="p-5 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-text-secondary leading-tight">
            {kpi.titulo}
          </p>
          <div className={cn(
            "p-2 rounded-lg bg-opacity-10 transition-transform group-hover:scale-110",
            kpi.color.replace("bg-", "text-").replace("500", "600"),
            kpi.color.replace("bg-", "bg-").replace("500", "100") // Fondo claro
          )}>
            <Icon size={18} />
          </div>
        </div>
        
        <div className="flex flex-col mt-2">
          <h3 className="text-3xl font-bold tracking-tight text-text-primary">
            {kpi.valor}
          </h3>
          
          <div className="flex items-center gap-2 mt-1">
            {kpi.tendencia && (
              <span className={cn(
                "text-xs font-semibold px-1.5 py-0.5 rounded-full flex items-center",
                kpi.tendencia.positivo ? "bg-success-50 text-success-700" : "bg-danger-50 text-danger-700"
              )}>
                {kpi.tendencia.positivo ? "↑" : "↓"} {Math.abs(kpi.tendencia.valor)}%
              </span>
            )}
            <span className="text-xs text-text-secondary">
              {kpi.subtitulo}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
