"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, CheckCircle2, Settings, Bell, Shield, Palette, Eye, RotateCcw, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { updateConfiguracionAction } from "@/actions/configuracion.actions";
import Image from "next/image";

export function ConfiguracionForm({ initialData }: { initialData?: any }) {
  const [isPending, startTransition] = useTransition();
  const [uploadingLogo, setUploadingLogo] = useState(false);
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
    nombreInstitucion: initialData?.nombreInstitucion || "SENA",
    nombreSoftware: initialData?.nombreSoftware || "GSS - Media Técnica",
    colorPrincipal: initialData?.colorPrincipal || "#39A900",
    colorSecundario: initialData?.colorSecundario || "#00304D",
    logoUrl: initialData?.logoUrl || "/logo-sena.png",
  });

  const PRESET_COLORS = [
    { name: "Verde SENA", primary: "#39A900", secondary: "#00304D" },
    { name: "Azul Océano", primary: "#0ea5e9", secondary: "#0f172a" },
    { name: "Púrpura Real", primary: "#8b5cf6", secondary: "#2e1065" },
    { name: "Rojo Carmesí", primary: "#e11d48", secondary: "#4c0519" },
    { name: "Naranja Atardecer", primary: "#f97316", secondary: "#431407" },
    { name: "Gris Oscuro", primary: "#475569", secondary: "#020617" },
  ];

  const handleResetDefaults = () => {
    setFormData(prev => ({
      ...prev,
      nombreInstitucion: "SENA",
      nombreSoftware: "GSS - Media Técnica",
      colorPrincipal: "#39A900",
      colorSecundario: "#00304D",
      logoUrl: "/logo-sena.png",
    }));
    toast.info("Valores por defecto restaurados. Haz clic en Guardar para aplicar.");
  };

  const applyPreset = (primary: string, secondary: string) => {
    setFormData(prev => ({ ...prev, colorPrincipal: primary, colorSecundario: secondary }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, sube solo archivos de imagen (PNG, JPG, etc.)");
      return;
    }

    try {
      setUploadingLogo(true);
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir la imagen");

      setFormData(prev => ({ ...prev, logoUrl: data.url }));
      toast.success("Logo subido correctamente al servidor. Haz clic en guardar para aplicar.");
    } catch (err: any) {
      toast.error(err.message || "Ocurrió un problema al subir la imagen");
    } finally {
      setUploadingLogo(false);
    }
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
      </Card>

      {/* Marca Blanca / Apariencia */}
      <Card className="border-0 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0" />
        <CardHeader className="border-b bg-slate-50 flex flex-row items-center gap-3 py-4 relative z-10">
          <div className="p-2 rounded-lg bg-primary/10">
            <Palette size={18} className="text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Marca Blanca & Apariencia</CardTitle>
            <p className="text-sm text-text-secondary mt-0.5">Personaliza los colores, logos y nombres del software</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre de la Institución</label>
                <Input name="nombreInstitucion" value={formData.nombreInstitucion} onChange={handleChange} placeholder="Ej: SENA" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del Software</label>
                <Input name="nombreSoftware" value={formData.nombreSoftware} onChange={handleChange} placeholder="Ej: GSS - Gestión" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Logo Institucional (Seleccionar imagen)</label>
                <div className="flex gap-2">
                  <Input 
                    name="logoUrl" 
                    value={formData.logoUrl} 
                    onChange={handleChange} 
                    placeholder="URL local o web..." 
                    className="bg-slate-50 opacity-80"
                  />
                  <div className="relative shrink-0">
                    <Input 
                      type="file" 
                      accept="image/png, image/jpeg, image/svg+xml, image/webp" 
                      onChange={handleLogoUpload}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                      disabled={uploadingLogo}
                    />
                    <Button type="button" variant="outline" className="w-[120px] pointer-events-none relative z-0">
                      {uploadingLogo ? (
                        <span className="animate-spin mr-2">⟳</span>
                      ) : (
                        <UploadCloud size={16} className="mr-2" />
                      )}
                      {uploadingLogo ? "Subiendo..." : "Subir Logo"}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-text-secondary">Sube una imagen desde tu equipo (se recomienda PNG con fondo transparente).</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color Principal</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      name="colorPrincipal" 
                      value={formData.colorPrincipal} 
                      onChange={handleChange}
                      className="h-10 w-14 rounded cursor-pointer border-0 p-0" 
                    />
                    <Input name="colorPrincipal" value={formData.colorPrincipal} onChange={handleChange} className="font-mono text-sm uppercase" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color Secundario</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      name="colorSecundario" 
                      value={formData.colorSecundario} 
                      onChange={handleChange}
                      className="h-10 w-14 rounded cursor-pointer border-0 p-0" 
                    />
                    <Input name="colorSecundario" value={formData.colorSecundario} onChange={handleChange} className="font-mono text-sm uppercase" />
                  </div>
                </div>
              </div>

              {/* Paletas Predefinidas */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paletas Predefinidas</label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyPreset(preset.primary, preset.secondary)}
                      className="group flex flex-col items-center gap-1.5 focus:outline-none"
                      title={preset.name}
                    >
                      <div className="flex w-10 h-10 rounded-full overflow-hidden shadow-sm border border-slate-200 group-hover:scale-110 group-hover:shadow-md transition-all">
                        <div className="w-1/2 h-full" style={{ backgroundColor: preset.primary }}></div>
                        <div className="w-1/2 h-full" style={{ backgroundColor: preset.secondary }}></div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {preset.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Vista Previa */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Eye size={16} /> Vista Previa del Tema
                </h3>
                <div className="bg-white border shadow-sm rounded-lg overflow-hidden flex h-40">
                  {/* Sidebar simulado */}
                  <div className="w-16 h-full flex flex-col items-center py-4" style={{ backgroundColor: formData.colorSecundario }}>
                    <div className="w-8 h-8 rounded-full bg-white/20 mb-4 flex items-center justify-center p-1">
                      {formData.logoUrl && (
                        <div className="relative w-full h-full">
                          <img src={formData.logoUrl} alt="Logo" className="object-contain w-full h-full brightness-0 invert" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-md bg-white/10 mb-2"></div>
                    <div className="w-8 h-8 rounded-md bg-white/10 mb-2"></div>
                  </div>
                  {/* Contenido simulado */}
                  <div className="flex-1 p-4 bg-slate-50">
                    <div className="h-4 w-1/3 rounded mb-4" style={{ backgroundColor: formData.colorSecundario }}></div>
                    <div className="h-8 w-24 rounded-md text-white text-[10px] font-bold flex items-center justify-center mb-4" style={{ backgroundColor: formData.colorPrincipal }}>Botón</div>
                    <div className="w-full h-16 bg-white border rounded-md shadow-sm"></div>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-4">Los cambios de color se aplicarán instantáneamente a todo el sistema al guardar.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t flex justify-between gap-3">
          <Button type="button" variant="outline" onClick={handleResetDefaults} className="text-slate-600 hover:text-slate-900">
            <RotateCcw size={16} className="mr-2" />
            Restaurar por defecto
          </Button>
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
