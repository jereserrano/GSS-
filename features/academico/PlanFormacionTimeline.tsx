"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

export function PlanFormacionTimeline() {
  const fases = [
    {
      id: "analisis",
      nombre: "Fase de Análisis",
      duracion: "Mes 1 - Mes 2",
      estado: "completado",
      raps: [
        { codigo: "RAP1", nombre: "Identificar necesidades del cliente", estado: "completado" },
        { codigo: "RAP2", nombre: "Elaborar el modelo de requisitos", estado: "completado" }
      ]
    },
    {
      id: "planeacion",
      nombre: "Fase de Planeación",
      duracion: "Mes 3 - Mes 4",
      estado: "en_progreso",
      raps: [
        { codigo: "RAP3", nombre: "Diseñar la arquitectura del software", estado: "en_progreso" },
        { codigo: "RAP4", nombre: "Modelar la base de datos", estado: "pendiente" }
      ]
    },
    {
      id: "ejecucion",
      nombre: "Fase de Ejecución",
      duracion: "Mes 5 - Mes 8",
      estado: "pendiente",
      raps: [
        { codigo: "RAP5", nombre: "Desarrollar el frontend", estado: "pendiente" },
        { codigo: "RAP6", nombre: "Desarrollar el backend", estado: "pendiente" },
        { codigo: "RAP7", nombre: "Integrar base de datos", estado: "pendiente" }
      ]
    },
    {
      id: "evaluacion",
      nombre: "Fase de Evaluación",
      duracion: "Mes 9",
      estado: "pendiente",
      raps: [
        { codigo: "RAP8", nombre: "Ejecutar pruebas de software", estado: "pendiente" },
        { codigo: "RAP9", nombre: "Desplegar aplicación", estado: "pendiente" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Selector superior */}
      <Card className="border-0 shadow-sm bg-surface">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h3 className="font-semibold text-text-primary">Programa: Técnico en Programación de Software</h3>
            <p className="text-sm text-text-secondary">Código: 228120 • Versión: 1</p>
          </div>
          <Button variant="outline">Cambiar Programa</Button>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {fases.map((fase, idx) => (
          <Card key={fase.id} className={`border-0 shadow-sm relative overflow-hidden ${
            fase.estado === 'completado' ? 'border-t-4 border-t-success-500' :
            fase.estado === 'en_progreso' ? 'border-t-4 border-t-warning-500' :
            'border-t-4 border-t-slate-200 opacity-70'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                {fase.nombre}
                {fase.estado === 'completado' && <CheckCircle2 className="text-success-500" size={18} />}
                {fase.estado === 'en_progreso' && <ArrowRight className="text-warning-500" size={18} />}
                {fase.estado === 'pendiente' && <Circle className="text-slate-300" size={18} />}
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-sena-500">{fase.duracion}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-3">
                {fase.raps.map((rap, rapIdx) => (
                  <li key={rapIdx} className="flex gap-2 items-start">
                    {rap.estado === 'completado' ? (
                      <CheckCircle2 size={14} className="text-success-500 shrink-0 mt-0.5" />
                    ) : rap.estado === 'en_progreso' ? (
                      <div className="h-3 w-3 rounded-full bg-warning-500 shrink-0 mt-1" />
                    ) : (
                      <Circle size={14} className="text-slate-300 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-text-primary block">{rap.codigo}</span>
                      <span className="text-xs text-text-secondary line-clamp-2 leading-tight">{rap.nombre}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
