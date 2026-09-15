"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Aprendiz } from "@/types/aprendiz.types";
import { User, Phone, Mail, Building2, MapPin, Target, CalendarDays, Activity } from "lucide-react";
import { formatDateShort, getInitials } from "@/lib/utils";

export function AprendizProfile({ aprendiz }: { aprendiz: Aprendiz }) {
  const [activeTab, setActiveTab] = useState("resumen");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Panel Lateral: Información General y Riesgo */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-0 shadow-sm overflow-hidden">
          {/* Cabecera del perfil */}
          <div className="bg-sena-900 p-6 flex flex-col items-center justify-center text-center">
            <div className="h-24 w-24 rounded-full bg-white text-sena-900 flex items-center justify-center text-3xl font-bold shadow-lg mb-4">
              {getInitials(`${aprendiz.nombres} ${aprendiz.apellidos}`)}
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">
              {aprendiz.nombres} <br/> {aprendiz.apellidos}
            </h2>
            <div className="mt-2 flex gap-2">
              <StatusBadge estado={aprendiz.estado} />
              <RiskBadge nivel={aprendiz.nivelRiesgo} />
            </div>
          </div>
          
          {/* Detalles rápidos */}
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <div className="p-4 flex items-start gap-3">
                <User size={18} className="text-text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Documento</p>
                  <p className="font-medium text-sm text-text-primary">{aprendiz.tipoDocumento} {aprendiz.numeroDocumento}</p>
                </div>
              </div>
              <div className="p-4 flex items-start gap-3">
                <Mail size={18} className="text-text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Correo SENA</p>
                  <p className="font-medium text-sm text-primary break-all">{aprendiz.emailSena || "No asignado"}</p>
                </div>
              </div>
              <div className="p-4 flex items-start gap-3">
                <Phone size={18} className="text-text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Teléfono</p>
                  <p className="font-medium text-sm text-text-primary">{aprendiz.telefono}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panel de Formación */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Target size={18} className="text-sena-600" /> Formación Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-xs text-text-secondary font-medium">Programa</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">{aprendiz.ficha?.programa?.nombre}</p>
              <p className="text-xs text-text-secondary mt-1">Ficha: <span className="font-medium text-primary">{aprendiz.ficha?.codigo}</span></p>
            </div>
            
            <div className="flex gap-2">
              <Building2 size={16} className="text-text-secondary shrink-0" />
              <p className="text-xs font-medium text-text-secondary truncate" title={aprendiz.institucion?.nombre}>
                {aprendiz.institucion?.nombre}
              </p>
            </div>
            <div className="flex gap-2">
              <MapPin size={16} className="text-text-secondary shrink-0" />
              <p className="text-xs font-medium text-text-secondary">{aprendiz.sede?.nombre}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido Principal: Tabs */}
      <div className="lg:col-span-3">
        <Tabs className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto bg-surface border-b pb-0 h-auto rounded-none p-0 gap-2">
            {[
              { id: "resumen", label: "Resumen Académico" },
              { id: "asistencia", label: "Control de Asistencia" },
              { id: "evaluaciones", label: "Evaluaciones" },
              { id: "seguimiento", label: "Línea de Tiempo" },
            ].map(tab => (
              <TabsTrigger 
                key={tab.id}
                active={activeTab === tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-none border-b-2 px-4 py-3 bg-transparent ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-secondary'}`}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent active={activeTab === "resumen"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="border-0 shadow-sm bg-surface">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Promedio Acumulado</p>
                    <h3 className="text-3xl font-bold mt-1 text-text-primary">{aprendiz.promedioAcumulado.toFixed(1)}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-sena-50 text-sena-600 flex items-center justify-center">
                    <Activity size={24} />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-surface">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Asistencia Global</p>
                    <h3 className="text-3xl font-bold mt-1 text-text-primary">{aprendiz.porcentajeAsistencia}%</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-verde-50 text-verde-600 flex items-center justify-center">
                    <CalendarDays size={24} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Resultados de Aprendizaje Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary italic text-sm">Este componente de Recharts se implementará en el siguiente bloque.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent active={activeTab === "asistencia"}>
            <Card className="border-0 shadow-sm min-h-[400px]">
              <CardContent className="flex items-center justify-center h-[400px]">
                <p className="text-text-secondary">Módulo de asistencia en construcción</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent active={activeTab === "evaluaciones"}>
            <Card className="border-0 shadow-sm min-h-[400px]">
              <CardContent className="flex items-center justify-center h-[400px]">
                <p className="text-text-secondary">Módulo de evaluaciones en construcción</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent active={activeTab === "seguimiento"}>
            <Card className="border-0 shadow-sm min-h-[400px]">
              <CardContent className="flex items-center justify-center h-[400px]">
                <p className="text-text-secondary">Línea de tiempo de seguimiento en construcción</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
