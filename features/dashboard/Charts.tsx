"use client";

import React from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// Fallback data only used when no real data is provided
const fallbackAsistencia = [
  { mes: "Sin datos", asistencia: 0, entregas: 0 },
];

const fallbackRiesgo = [
  { name: "Riesgo Bajo", value: 0, color: "var(--color-success-500)" },
  { name: "Riesgo Medio", value: 0, color: "var(--color-warning-500)" },
  { name: "Riesgo Alto", value: 0, color: "var(--color-danger-500)" },
];

interface TrendChartProps {
  data?: { mes: string; asistencia: number; entregas: number }[];
}

export function TrendChart({ data }: TrendChartProps) {
  const chartData = data && data.length > 0 ? data : fallbackAsistencia;
  
  return (
    <Card className="border border-slate-200 shadow-xs rounded-xl bg-white col-span-1 lg:col-span-2 h-full flex flex-col">
      <CardHeader className="pb-2 border-b border-slate-100">
        <CardTitle className="text-sm font-bold text-slate-900">Tendencias Académicas</CardTitle>
        <CardDescription className="text-xs text-slate-500">Evolución de asistencia y cumplimiento de entregas</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAsistencia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#003F8C" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#003F8C" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEntregas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#39A900" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#39A900" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(4px)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 600 }}
              labelStyle={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '10px' }} />
            <Area 
              type="monotone" 
              name="Asistencia Promedio %"
              dataKey="asistencia" 
              stroke="#003F8C" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAsistencia)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "#003F8C" }}
            />
            <Area 
              type="monotone" 
              name="Entregas a Tiempo %"
              dataKey="entregas" 
              stroke="#39A900" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorEntregas)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "#39A900" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface DistributionChartProps {
  data?: { name: string; value: number; color: string }[];
}

export function DistributionChart({ data }: DistributionChartProps) {
  const chartData = data && data.length > 0 ? data : fallbackRiesgo;

  return (
    <Card className="border border-slate-200 shadow-xs rounded-xl bg-white h-full flex flex-col">
      <CardHeader className="pb-2 border-b border-slate-100">
        <CardTitle className="text-sm font-bold text-slate-900">Distribución de Riesgo</CardTitle>
        <CardDescription className="text-xs text-slate-500">Población de aprendices por nivel</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "#334155", fontSize: 12, fontWeight: 500 }} width={100} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

