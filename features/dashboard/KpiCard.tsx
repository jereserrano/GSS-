import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { KpiData } from "@/types/common.types";
import { 
  Users, Building2, MapPin, Target, TrendingUp, AlertTriangle, 
  BookCheck, FileSignature, CheckCheck, Clock, GraduationCap, Award
} from "lucide-react";

// Mapeo dinámico de íconos ampliado para contexto académico
const IconMap: Record<string, React.ElementType> = {
  Users,
  Building2,
  MapPin,
  Target,
  TrendingUp,
  AlertTriangle,
  BookCheck,
  FileSignature,
  CheckCheck,
  Clock,
  GraduationCap,
  Award
};

export function KpiCard({ kpi }: { kpi: KpiData }) {
  const Icon = IconMap[kpi.icono] || Users;

  return (
    <Card className="border border-slate-200 shadow-xs bg-white rounded-xl overflow-hidden hover:border-slate-300 transition-colors">
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start gap-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight">
            {kpi.titulo}
          </p>
          <div className="p-2 rounded-lg bg-[#f0fdf4] text-[#267000] shrink-0 border border-[#bbf7d0]">
            <Icon size={18} />
          </div>
        </div>
        
        <div className="mt-3">
          <div className="text-3xl font-bold tracking-tight text-slate-900">
            {kpi.valor}
          </div>
          
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
            {kpi.tendencia && (
              <span className={cn(
                "text-[11px] font-semibold px-1.5 py-0.5 rounded-full flex items-center",
                kpi.tendencia.positivo ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              )}>
                {kpi.tendencia.positivo ? "↑" : "↓"} {Math.abs(kpi.tendencia.valor)}%
              </span>
            )}
            <span className="truncate">
              {kpi.subtitulo}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
