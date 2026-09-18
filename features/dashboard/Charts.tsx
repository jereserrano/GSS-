"use client";

import React from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// Data simulada para el gráfico de tendencias (Fase 1)
const asistenciaData = [
  { mes: "Feb", asistencia: 92, entregas: 88 },
  { mes: "Mar", asistencia: 89, entregas: 85 },
  { mes: "Abr", asistencia: 85, entregas: 80 },
  { mes: "May", asistencia: 88, entregas: 84 },
  { mes: "Jun", asistencia: 91, entregas: 89 },
  { mes: "Jul", asistencia: 93, entregas: 92 },
];

const distribucionRiesgo = [
  { name: "Riesgo Bajo", value: 3200, color: "var(--color-success-500)" },
  { name: "Riesgo Medio", value: 850, color: "var(--color-warning-500)" },
  { name: "Riesgo Alto", value: 200, color: "var(--color-danger-500)" },
];

export function TrendChart() {
  return (
    <Card className="border border-slate-200 shadow-xs rounded-xl bg-white col-span-1 lg:col-span-2 h-full flex flex-col">
      <CardHeader className="pb-2 border-b border-slate-100">
        <CardTitle className="text-sm font-bold text-slate-900">Tendencias Académicas</CardTitle>
        <CardDescription className="text-xs text-slate-500">Evolución de asistencia y cumplimiento de entregas</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={asistenciaData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} domain={[50, 100]} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 500 }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Line 
              type="monotone" 
              name="Asistencia Promedio %"
              dataKey="asistencia" 
              stroke="#003F8C" 
              strokeWidth={2.5}
              dot={{ r: 3.5, strokeWidth: 1.5 }}
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              name="Entregas a Tiempo %"
              dataKey="entregas" 
              stroke="#39A900" 
              strokeWidth={2.5}
              dot={{ r: 3.5, strokeWidth: 1.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DistributionChart() {
  return (
    <Card className="border border-slate-200 shadow-xs rounded-xl bg-white h-full flex flex-col">
      <CardHeader className="pb-2 border-b border-slate-100">
        <CardTitle className="text-sm font-bold text-slate-900">Distribución de Riesgo</CardTitle>
        <CardDescription className="text-xs text-slate-500">Población de aprendices por nivel</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribucionRiesgo} margin={{ top: 20, right: 10, left: 0, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "#334155", fontSize: 12, fontWeight: 500 }} width={100} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
              {distribucionRiesgo.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
