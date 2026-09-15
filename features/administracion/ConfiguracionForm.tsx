"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";

export function ConfiguracionForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simular guardado
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <h3 className="font-bold text-lg">Parámetros del Sistema</h3>
        <p className="text-sm text-text-secondary">
          Configura las variables globales que afectan el comportamiento de todos los módulos, 
          como periodos académicos y umbrales de riesgo.
        </p>
      </div>
      
      <div className="md:col-span-2">
        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-slate-50">
              <CardTitle className="text-lg">Configuración Académica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Año Lectivo Actual</label>
                  <Input defaultValue="2026" type="number" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Trimestre Actual</label>
                  <Input defaultValue="3" type="number" max="4" min="1" />
                </div>
              </div>
              
              <div className="space-y-2 pt-4 border-t border-dashed">
                <h4 className="font-semibold text-sm mb-4">Umbrales de Alertas Tempranas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Faltas consecutivas para Riesgo Alto</label>
                    <Input defaultValue="3" type="number" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">% Asistencia mínima permitida</label>
                    <Input defaultValue="75" type="number" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t justify-end">
              <Button type="submit">
                <Save size={16} className="mr-2" />
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
