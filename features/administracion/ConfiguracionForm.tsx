"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, CheckCircle2, Settings, Bell, Shield } from "lucide-react";
import { toast } from "sonner";
import { updateConfiguracionAction } from "@/actions/configuracion.actions";

export function ConfiguracionForm({ initialData }: { initialData?: any }) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    anioLectivo: initialData?.anioLectivo || 2026,
    trimestre: initialData?.trimestre || 3,
    regional: initialData?.regional || "SENA Regional Magdalena",
    ciudad: initialData?.ciudad || "Santa Marta",
    faltasRiesgoAlto: initialData?.faltasRiesgoAlto || 3,
    asistenciaMinima: initialData?.asistenciaMinima || 75,
    promedioMinimo: initialData?.promedioMinimo || 3.0,
    diasEntrega: initialData?.diasEntrega || 7,
    duracionSesionHoras: initialData?.duracionSesionHoras || 8,
    intentosLogin: initialData?.intentosLogin || 5,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      const res = await updateConfiguracionAction(formData);
      if (res.success) {
        toast.success("Configuración guardada correctamente", {
          description: "Los cambios se aplicarán en todo el sistema.",
          icon: <CheckCircle2 size={18} className="text-success-600" />,
        });
      } else {
        toast.error(res.error || "Error al guardar configuración");
      }
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
              <Input name="anioLectivo" value={formData.anioLectivo} onChange={handleChange} type="number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trimestre Actual</label>
              <Input name="trimestre" value={formData.trimestre} onChange={handleChange} type="number" max="4" min="1" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre de la Regional</label>
              <Input name="regional" value={formData.regional} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ciudad Principal</label>
              <Input name="ciudad" value={formData.ciudad} onChange={handleChange} />
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
              <Input name="faltasRiesgoAlto" value={formData.faltasRiesgoAlto} onChange={handleChange} type="number" min="1" />
              <p className="text-xs text-text-secondary">Número de faltas seguidas para alerta</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">% Asistencia mínima permitida</label>
              <Input name="asistenciaMinima" value={formData.asistenciaMinima} onChange={handleChange} type="number" min="0" max="100" />
              <p className="text-xs text-text-secondary">Por debajo de este % entra en riesgo</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Promedio mínimo para aprobación</label>
              <Input name="promedioMinimo" value={formData.promedioMinimo} onChange={handleChange} type="number" step="0.1" min="0" max="5" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Días máx. para entregar actividad</label>
              <Input name="diasEntrega" value={formData.diasEntrega} onChange={handleChange} type="number" min="1" />
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
              <Input name="duracionSesionHoras" value={formData.duracionSesionHoras} onChange={handleChange} type="number" min="1" max="24" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Intentos de login fallidos</label>
              <Input name="intentosLogin" value={formData.intentosLogin} onChange={handleChange} type="number" min="3" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t justify-end gap-3">
          <Button type="submit" disabled={isPending} className="min-w-[160px]">
            {isPending ? (
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
