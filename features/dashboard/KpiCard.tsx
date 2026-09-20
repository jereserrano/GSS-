import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { KpiData } from "@/types/common.types";
import { 
  Users, Building2, MapPin, Target, TrendingUp, AlertTriangle, 
  BookCheck, FileSignature, CheckCheck, Clock, GraduationCap, Award
} from "lucide-react";

import Link from "next/link";

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

  const content = (
    <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden hover:border-[#39A900] transition-all duration-300 group hover:bg-[#39A900] hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full">
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start gap-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight group-hover:text-white/90 transition-colors">
            {kpi.titulo}
          </p>
          <div className="p-2 rounded-xl bg-[#f0fdf4] text-[#267000] shrink-0 border border-[#bbf7d0] group-hover:bg-white group-hover:text-[#39A900] group-hover:border-white transition-colors">
            <Icon size={20} strokeWidth={2.5} />
          </div>
        </div>
        
        <div className="mt-3">
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 group-hover:text-white transition-colors">
            {kpi.valor}
          </div>
          
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 group-hover:text-white/80 transition-colors">
            {kpi.tendencia && (
              <span className={cn(
                "text-[11px] font-bold px-1.5 py-0.5 rounded-md flex items-center transition-colors",
                kpi.tendencia.positivo 
                  ? "bg-emerald-50 text-emerald-700 group-hover:bg-white/20 group-hover:text-white" 
                  : "bg-red-50 text-red-700 group-hover:bg-white/20 group-hover:text-white"
              )}>
                {kpi.tendencia.positivo ? "↑" : "↓"} {Math.abs(kpi.tendencia.valor)}%
              </span>
            )}
            <span className="truncate font-medium">
              {kpi.subtitulo}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (kpi.enlace) {
    return (
      <Link href={kpi.enlace} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
