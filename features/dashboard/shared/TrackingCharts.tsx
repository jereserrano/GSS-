"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLOR_TEXT = "#00304D";
const COLOR_QUALIFIED = "#007832"; // Verde institucional
const COLOR_PENDING = "#3b82f6"; // Azul para cuellos de botella (por calificar)
const COLOR_MISSING = "#cbd5e1"; // Gris claro para no entregadas (o rojo si es crítico)

// 1. Gráfico de Barras Apiladas (Seguimiento de Entregas)
export function StackedDeliveryChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-5 h-full flex flex-col min-h-[350px]">
      <h3 className="text-[#00304D] font-bold text-sm mb-1">Volumen y Estado de Entregas</h3>
      <p className="text-[#00304D]/70 text-xs mb-4">Identifica cuellos de botella en la calificación semana a semana.</p>
      
      <div className="flex-1 w-full relative min-h-[250px]">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke={COLOR_TEXT} vertical={false} />
            <XAxis 
              dataKey="semana" 
              tick={{ fill: COLOR_TEXT, fontSize: 11, fontWeight: 500 }} 
              axisLine={{ stroke: COLOR_TEXT, opacity: 0.3 }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: COLOR_TEXT, fontSize: 11 }} 
              axisLine={{ stroke: COLOR_TEXT, opacity: 0.3 }}
              tickLine={false}
              label={{ value: 'Cantidad de Actividades', angle: -90, position: 'insideLeft', fill: COLOR_TEXT, fontSize: 11, fontWeight: 600 }} 
            />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              content={({active, payload, label}) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/95 backdrop-blur-md border border-[#00304D]/20 p-3 rounded-xl shadow-xl text-sm min-w-[200px] z-50">
                      <p className="font-bold text-[#00304D] mb-2">{label}</p>
                      {payload.map((entry, index) => (
                        <div key={index} className="flex justify-between items-center text-xs mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-[#00304D]/80">{entry.name}:</span>
                          </div>
                          <span className="font-bold" style={{ color: entry.color }}>{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '11px', fontWeight: 500, color: COLOR_TEXT, paddingTop: '10px' }} 
              iconType="circle"
            />
            <Bar dataKey="calificadas" name="Calificadas" stackId="a" fill={COLOR_QUALIFIED} radius={[0, 0, 4, 4]} />
            <Bar dataKey="pendientes" name="Por Calificar" stackId="a" fill={COLOR_PENDING} />
            <Bar dataKey="noEntregadas" name="No Entregadas" stackId="a" fill={COLOR_MISSING} radius={[4, 4, 0, 0]} />
          </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// 2. Mapa de Calor (Heatmap) de Hábitos de Entrega
export function DeliveryHeatmap({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  // Extraemos todos los días del primer registro (asumiendo estructura uniforme L-D)
  const days = data[0].entregas.map((e: any) => e.dia);

  // Encontrar el valor máximo para calcular la intensidad del color
  let maxDeliveries = 1;
  data.forEach(act => {
    act.entregas.forEach((e: any) => {
      if (e.cantidad > maxDeliveries) maxDeliveries = e.cantidad;
    });
  });

  // Va de un gris muy pálido a un Verde Institucional (#007832) puro.
  const getCellColor = (value: number) => {
    if (value === 0) return 'bg-slate-100/50';
    const intensity = Math.max(0.15, value / maxDeliveries);
    // Para no ensuciar el componente con estilos inline complejos, usaremos rgba
    // RGB de #007832 es 0, 120, 50
    return `rgba(0, 120, 50, ${intensity})`;
  };

  const getTextColor = (value: number) => {
    const intensity = value / maxDeliveries;
    return intensity > 0.4 ? 'text-white' : 'text-[#00304D]';
  };

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-5 h-full flex flex-col">
      <h3 className="text-[#00304D] font-bold text-sm mb-1">Hábitos de Entrega (Mapa de Calor)</h3>
      <p className="text-[#00304D]/70 text-xs mb-4">Identifica qué días los aprendices suben más evidencias.</p>
      
      <div className="flex-1 overflow-x-auto">
        <div className="min-w-[450px]">
          {/* Header Row (Días) */}
          <div className="flex mb-2">
            <div className="w-24 shrink-0"></div> {/* Espacio vacío para etiquetas Y */}
            {days.map((day: string, idx: number) => (
              <div key={idx} className="flex-1 text-center text-[10px] font-bold text-[#00304D]/70 uppercase tracking-wider">
                {day.substring(0, 3)}
              </div>
            ))}
          </div>

          {/* Grid Rows (Actividades) */}
          <div className="space-y-1.5">
            {data.map((row, rIdx) => (
              <div key={rIdx} className="flex items-center group">
                {/* Etiqueta Y */}
                <div className="w-24 shrink-0 text-xs font-semibold text-[#00304D] truncate pr-2 group-hover:text-[#39A900] transition-colors">
                  {row.actividad}
                </div>
                {/* Celdas X */}
                <div className="flex flex-1 gap-1.5">
                  {row.entregas.map((cell: any, cIdx: number) => (
                    <div 
                      key={cIdx} 
                      className="flex-1 aspect-square md:aspect-auto md:h-10 rounded-md flex items-center justify-center text-xs font-bold transition-all hover:scale-105 cursor-default shadow-sm border border-[#00304D]/5"
                      style={{ 
                        backgroundColor: cell.cantidad === 0 ? undefined : getCellColor(cell.cantidad) 
                      }}
                      title={`${cell.cantidad} entregas el ${cell.dia}`}
                    >
                      {cell.cantidad > 0 && (
                        <span className={getTextColor(cell.cantidad)}>
                          {cell.cantidad}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Leyenda Simple */}
          <div className="mt-4 flex items-center justify-end gap-2 text-[10px] font-medium text-[#00304D]/70">
            <span>Menos entregas</span>
            <div className="flex gap-0.5">
              <div className="w-3 h-3 rounded-sm bg-slate-100 border border-[#00304D]/10"></div>
              <div className="w-3 h-3 rounded-sm" style={{backgroundColor: 'rgba(0, 120, 50, 0.3)'}}></div>
              <div className="w-3 h-3 rounded-sm" style={{backgroundColor: 'rgba(0, 120, 50, 0.6)'}}></div>
              <div className="w-3 h-3 rounded-sm" style={{backgroundColor: 'rgba(0, 120, 50, 1)'}}></div>
            </div>
            <span>Más entregas</span>
          </div>

        </div>
      </div>
    </div>
  );
}
