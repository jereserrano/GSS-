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
    <Card className="border-0 shadow-sm col-span-1 lg:col-span-2 h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Tendencias Académicas</CardTitle>
        <CardDescription>Evolución de asistencia y entregas a lo largo del semestre</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={asistenciaData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-slate-200)" />
            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "var(--color-slate-500)", fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-slate-500)", fontSize: 12 }} domain={[50, 100]} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
              itemStyle={{ fontSize: '14px', fontWeight: 500 }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
            <Line 
              type="monotone" 
              name="Asistencia Promedio %"
              dataKey="asistencia" 
              stroke="var(--color-sena-500)" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              name="Entregas a Tiempo %"
              dataKey="entregas" 
              stroke="var(--color-verde-500)" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DistributionChart() {
  return (
    <Card className="border-0 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Distribución de Riesgo</CardTitle>
        <CardDescription>Población total de aprendices</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribucionRiesgo} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-slate-200)" />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "var(--color-slate-700)", fontSize: 13, fontWeight: 500 }} width={100} />
            <Tooltip 
              cursor={{ fill: 'var(--color-slate-50)' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
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
