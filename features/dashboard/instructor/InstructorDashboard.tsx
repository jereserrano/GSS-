"use client";

import React, { useState, useEffect } from "react";
import { AcademicDashboardLayout } from "../shared/AcademicDashboardLayout";

export function InstructorDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Filtros en cascada
  const [selectedFicha, setSelectedFicha] = useState<string>("");
  const [selectedCompetencia, setSelectedCompetencia] = useState<string>("");
  const [selectedRA, setSelectedRA] = useState<string>("");

  // Reset de cascada
  useEffect(() => {
    setSelectedCompetencia("");
    setSelectedRA("");
  }, [selectedFicha]);

  useEffect(() => {
    setSelectedRA("");
  }, [selectedCompetencia]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = new URL("/api/dashboard/instructor", window.location.origin);
        if (selectedFicha) url.searchParams.set("fichaId", selectedFicha);
        if (selectedCompetencia) url.searchParams.set("competenciaId", selectedCompetencia);
        if (selectedRA) url.searchParams.set("raId", selectedRA);

        const res = await fetch(url.toString());
        const json = await res.json();
        if (json.success) setData(json);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [selectedFicha, selectedCompetencia, selectedRA]);

  const dashboard = data?.dashboard || {};
  
  // RAs filtrados por la competencia seleccionada
  const rasDisponibles = dashboard.resultadosAprendizaje 
    ? dashboard.resultadosAprendizaje.filter((ra: any) => ra.competenciaId === selectedCompetencia)
    : [];

  return (
    <AcademicDashboardLayout loading={loading} data={data}>
      {/* 1. FICHA */}
      <select 
        value={selectedFicha} 
        onChange={(e) => setSelectedFicha(e.target.value)}
        className="flex h-9 w-full md:flex-1 md:max-w-xs rounded-lg border border-[#00304D]/20 bg-white/50 px-3 py-1 text-xs shadow-sm transition-colors focus:ring-1 focus:ring-[#39A900] text-[#00304D] font-medium"
      >
        <option value="">Todas mis fichas</option>
        {data?.fichas?.map((f: any) => (
          <option key={f.id} value={f.id}>{f.codigo} - {f.programa}</option>
        ))}
      </select>

      {/* 2. COMPETENCIA */}
      <select 
        value={selectedCompetencia} 
        onChange={(e) => setSelectedCompetencia(e.target.value)}
        disabled={!selectedFicha || !dashboard.competencias?.length}
        className="flex h-9 w-full md:flex-1 md:max-w-xs rounded-lg border border-[#00304D]/20 bg-white/50 px-3 py-1 text-xs shadow-sm transition-colors focus:ring-1 focus:ring-[#39A900] disabled:opacity-50 text-[#00304D] font-medium"
      >
        <option value="">Todas las Competencias</option>
        {dashboard.competencias?.map((c: any) => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>

      {/* 3. RESULTADO DE APRENDIZAJE */}
      <select 
        value={selectedRA} 
        onChange={(e) => setSelectedRA(e.target.value)}
        disabled={!selectedCompetencia || !rasDisponibles.length}
        className="flex h-9 w-full md:flex-1 md:max-w-xs rounded-lg border border-[#00304D]/20 bg-white/50 px-3 py-1 text-xs shadow-sm transition-colors focus:ring-1 focus:ring-[#39A900] disabled:opacity-50 text-[#00304D] font-medium"
      >
        <option value="">Todos los RAs</option>
        {rasDisponibles.map((ra: any) => (
          <option key={ra.id} value={ra.id}>{ra.nombre}</option>
        ))}
      </select>
    </AcademicDashboardLayout>
  );
}
