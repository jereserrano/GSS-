"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, CheckCircle2, Settings, Bell, Shield } from "lucide-react";
import { toast } from "sonner";

export function ConfiguracionForm() {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simular guardado con delay realista
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    toast.success("Configuración guardada correctamente", {
      description: "Los cambios se aplicarán en la próxima sesión.",
      icon: <CheckCircle2 size={18} className="text-success-600" />,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Parámetros Académicos */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-slate-50 flex flex-row items-center gap-3 py-4">
          <div className="p-2 rounded-lg bg-sena-50">
            <Settings size={18} className="text-sena-600" />
          </div>
          <div>
            <CardTitle className="text-base">Parámetros Académicos</CardTitle>
            <p className="text-sm text-text-secondary mt-0.5">Variables globales del período de formación</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Año Lectivo Actual</label>
              <Input id="input-anio-lectivo" defaultValue="2026" type="number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trimestre Actual</label>
              <Input id="input-trimestre" defaultValue="3" type="number" max="4" min="1" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre de la Regional</label>
              <Input id="input-regional" defaultValue="SENA Regional Magdalena" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ciudad Principal</label>
              <Input id="input-ciudad" defaultValue="Santa Marta" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Umbrales de Alertas */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-slate-50 flex flex-row items-center gap-3 py-4">
          <div className="p-2 rounded-lg bg-warning-50">
            <Bell size={18} className="text-warning-600" />
          </div>
          <div>
            <CardTitle className="text-base">Umbrales de Alertas Tempranas</CardTitle>
            <p className="text-sm text-text-secondary mt-0.5">Parámetros del sistema de detección de riesgos</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Faltas consecutivas → Riesgo Alto</label>
              <Input id="input-faltas-riesgo" defaultValue="3" type="number" min="1" />
              <p className="text-xs text-text-secondary">Número de faltas seguidas para activar alerta crítica</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">% Asistencia mínima permitida</label>
              <Input id="input-asistencia-minima" defaultValue="75" type="number" min="0" max="100" />
              <p className="text-xs text-text-secondary">Por debajo de este % el aprendiz entra en riesgo</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Promedio mínimo para aprobación</label>
              <Input id="input-promedio-minimo" defaultValue="3.0" type="number" step="0.1" min="0" max="5" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Días máx. para entregar actividad</label>
              <Input id="input-dias-entrega" defaultValue="7" type="number" min="1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seguridad */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-slate-50 flex flex-row items-center gap-3 py-4">
          <div className="p-2 rounded-lg bg-danger-50">
            <Shield size={18} className="text-danger-600" />
          </div>
          <div>
            <CardTitle className="text-base">Seguridad del Sistema</CardTitle>
            <p className="text-sm text-text-secondary mt-0.5">Políticas de acceso y sesiones</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Duración de sesión (horas)</label>
              <Input id="input-sesion-horas" defaultValue="8" type="number" min="1" max="24" />
              <p className="text-xs text-text-secondary">Jornada laboral SENA</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Intentos de login fallidos</label>
              <Input id="input-intentos-login" defaultValue="5" type="number" min="3" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t justify-end gap-3">
          <Button id="btn-guardar-configuracion" type="submit" disabled={saving} className="min-w-[160px]">
            {saving ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Guardando...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Guardar Configuración
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
