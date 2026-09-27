"use client";

import React, { useMemo } from "react";
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceArea,
  BarChart, Bar, LabelList
} from "recharts";

interface RiskData {
  id: string;
  nombre: string;
  fichaId: string;
  asistencia: number;
  rendimiento: number;
  nivelRiesgo: string;
}

export function RiskMatrix({ data, fichas }: { data: RiskData[], fichas: any[] }) {
  // Colores institucionales
  const COLOR_TEXT = "#00304D"; // Azul petróleo profundo
  const COLOR_GOOD = "#007832"; // Verde oscuro para positivo
  const COLOR_GOOD_VIBRANT = "#39A900"; // Verde vibrante
  const COLOR_MEDIUM = "#f59e0b"; // Naranja / Ámbar
  const COLOR_HIGH = "#ef4444"; // Rojo

  const getRiskColor = (nivel: string) => {
    if (nivel === "Alto") return COLOR_HIGH;
    if (nivel === "Medio") return COLOR_MEDIUM;
    return COLOR_GOOD;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const ficha = fichas.find(f => f.id === data.fichaId);
      return (
        <div className="bg-white/90 backdrop-blur-sm border border-[#00304D]/20 p-3 rounded-xl shadow-xl text-sm min-w-[200px] z-50 relative">
          <p className="font-bold text-[#00304D] mb-1">{data.nombre}</p>
          <p className="text-[#00304D]/70 text-xs mb-2">Ficha: {ficha?.codigo || data.fichaId}</p>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#00304D]/80">Asistencia:</span>
            <span className="font-semibold" style={{ color: data._originalAsistencia < 75 ? COLOR_HIGH : COLOR_GOOD }}>{data._originalAsistencia}%</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#00304D]/80">Rendimiento:</span>
            <span className="font-semibold" style={{ color: data._originalRendimiento < 70 ? COLOR_HIGH : COLOR_GOOD }}>{data._originalRendimiento}%</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#00304D]/10 flex items-center justify-between">
            <span className="text-xs font-medium text-[#00304D]/60">Nivel de Riesgo</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white shadow-sm" style={{ backgroundColor: getRiskColor(data.nivelRiesgo) }}>
              {data.nivelRiesgo === "Bajo" ? "Sin Riesgo" : data.nivelRiesgo}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Jittering (ruido aleatorio) para evitar el overplotting
  const jitteredData = useMemo(() => {
    return data.map(d => ({
      ...d,
      _originalAsistencia: d.asistencia,
      _originalRendimiento: d.rendimiento,
      // Aplicar un ligero desvío aleatorio entre -0.75 y +0.75 para separar visualmente los puntos
      asistencia: Math.max(0, Math.min(100, d.asistencia + (Math.random() - 0.5) * 1.5)),
      rendimiento: Math.max(0, Math.min(100, d.rendimiento + (Math.random() - 0.5) * 1.5))
    }));
  }, [data]);

  // Datos para el gráfico de barras (Resumen)
  const summaryData = useMemo(() => {
    return [
      { name: 'Riesgo Alto', cantidad: data.filter(d => d.nivelRiesgo === 'Alto').length, fill: COLOR_HIGH },
      { name: 'Riesgo Medio', cantidad: data.filter(d => d.nivelRiesgo === 'Medio').length, fill: COLOR_MEDIUM },
      { name: 'Sin Riesgo', cantidad: data.filter(d => d.nivelRiesgo === 'Bajo').length, fill: COLOR_GOOD },
    ];
  }, [data]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full h-full min-h-[400px]">
      
      {/* Columna Izquierda: Gráfico de Barras Simplificado */}
      <div className="lg:w-1/3 flex flex-col gap-4">
        <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-5 h-full flex flex-col">
          <h3 className="text-[#00304D] font-bold text-sm mb-1">Resumen por Riesgo</h3>
          <p className="text-[#00304D]/70 text-xs mb-6">Vista rápida de la cantidad de aprendices según su estado.</p>
          
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.15} stroke={COLOR_TEXT} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: COLOR_TEXT, fontSize: 11, fontWeight: 600 }} width={80} />
                <Tooltip cursor={{fill: 'transparent'}} content={() => null} />
                <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} barSize={28}>
                  <LabelList dataKey="cantidad" position="right" style={{ fill: COLOR_TEXT, fontWeight: 'bold', fontSize: 13 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Matriz de Dispersión (Glassmorphism y Cuadrantes) */}
      <div className="lg:w-2/3">
        <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-5 h-full flex flex-col min-h-[400px]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-[#00304D] font-bold text-sm">Matriz de Rendimiento vs Asistencia</h3>
              <p className="text-[#00304D]/70 text-xs mt-0.5">Análisis de correlación individual por aprendiz.</p>
            </div>
            <div className="flex flex-col md:flex-row items-end md:items-center gap-1.5 md:gap-3 text-[10px] md:text-xs">
              <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: COLOR_HIGH}}></div> Riesgo Alto</span>
              <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: COLOR_MEDIUM}}></div> Riesgo Medio</span>
              <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: COLOR_GOOD}}></div> Sin Riesgo</span>
            </div>
          </div>

          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke={COLOR_TEXT} />
                
                {/* Eje X (Asistencia) configurado para arrancar desde el mínimo dinámico */}
                <XAxis 
                  type="number" 
                  dataKey="asistencia" 
                  name="Asistencia" 
                  unit="%" 
                  domain={[(dataMin: number) => Math.max(0, Math.floor(dataMin) - 2), 100]} 
                  tick={{ fill: COLOR_TEXT, fontSize: 11 }}
                  axisLine={{ stroke: COLOR_TEXT, opacity: 0.3 }}
                  tickLine={false}
                  label={{ value: 'Porcentaje de Asistencia', position: 'insideBottom', offset: -15, fill: COLOR_TEXT, fontSize: 11, fontWeight: 600 }}
                />
                
                {/* Eje Y (Rendimiento) */}
                <YAxis 
                  type="number" 
                  dataKey="rendimiento" 
                  name="Rendimiento" 
                  unit="%" 
                  domain={[(dataMin: number) => Math.max(0, Math.floor(dataMin) - 3), 100]}
                  tick={{ fill: COLOR_TEXT, fontSize: 11 }}
                  axisLine={{ stroke: COLOR_TEXT, opacity: 0.3 }}
                  tickLine={false}
                  label={{ value: 'Rendimiento Académico', angle: -90, position: 'insideLeft', fill: COLOR_TEXT, fontSize: 11, fontWeight: 600, offset: 15 }} 
                />
                
                {/* ZAxis para el tamaño dinámico de los puntos */}
                <ZAxis type="number" dataKey="rendimiento" range={[70, 300]} name="Puntaje" />
                
                <Tooltip cursor={{ strokeDasharray: '3 3', stroke: COLOR_TEXT, opacity: 0.2 }} content={<CustomTooltip />} />
                
                {/* ZONAS (CUADRANTES SUAVES) */}
                {/* Zona de Riesgo Alto (Área de deserción, baja nota y asistencia) */}
                <ReferenceArea x1={0} x2={75} y1={0} y2={70} fill={COLOR_HIGH} fillOpacity={0.15} />
                <ReferenceArea x1={0} x2={75} y1={70} y2={100} fill={COLOR_HIGH} fillOpacity={0.05} />
                <ReferenceArea x1={75} x2={100} y1={0} y2={70} fill={COLOR_HIGH} fillOpacity={0.05} />
                
                {/* Zona de Éxito (Arriba a la derecha) con el verde institucional vibrante */}
                <ReferenceArea x1={85} x2={100} y1={80} y2={100} fill={COLOR_GOOD_VIBRANT} fillOpacity={0.1} />
                
                {/* PUNTOS */}
                <Scatter name="Aprendices" data={jitteredData} opacity={0.85}>
                  {jitteredData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getRiskColor(entry.nivelRiesgo)} 
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
