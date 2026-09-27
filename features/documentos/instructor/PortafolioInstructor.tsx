"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { User, FileText, CheckCircle, Clock, XCircle, Save, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PortafolioInstructor({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState("datos");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [datos, setDatos] = useState<any>({});
  
  useEffect(() => {
    const fetchDatos = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/documentos/instructor");
        const json = await res.json();
        if (json.success) setDatos(json.data);
      } catch (e) {
        toast.error("Error al cargar datos");
      }
      setLoading(false);
    };
    fetchDatos();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/documentos/instructor", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });
      const json = await res.json();
      if (json.success) toast.success("Datos guardados correctamente");
      else toast.error(json.error);
    } catch (e) {
      toast.error("Error al guardar");
    }
    setSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#00304D]/10">
      <div className="flex space-x-4 mb-6 border-b pb-2">
        <button 
          className={`flex items-center pb-2 px-1 border-b-2 font-medium transition-colors ${activeTab === 'datos' ? 'border-[#39A900] text-[#00304D]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab("datos")}
        >
          <User className="mr-2 h-4 w-4" /> Datos Personales
        </button>
        <button 
          className={`flex items-center pb-2 px-1 border-b-2 font-medium transition-colors ${activeTab === 'docs' ? 'border-[#39A900] text-[#00304D]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab("docs")}
        >
          <FileText className="mr-2 h-4 w-4" /> Soportes y Documentos
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500 animate-pulse">Cargando portafolio...</div>
      ) : activeTab === "datos" ? (
        <form onSubmit={handleSave} className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#00304D]">Dirección de Residencia</label>
              <Input value={datos.direccionResidencia} onChange={e => setDatos({...datos, direccionResidencia: e.target.value})} placeholder="Ej. Calle 123 # 45-67" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#00304D]">Municipio de Residencia</label>
              <Input value={datos.municipioResidencia} onChange={e => setDatos({...datos, municipioResidencia: e.target.value})} placeholder="Ej. Medellín" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#00304D]">Teléfono</label>
              <Input value={datos.telefono} onChange={e => setDatos({...datos, telefono: e.target.value})} placeholder="Ej. 3001234567" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#00304D]">Fecha de Nacimiento</label>
              <Input type="date" value={datos.fechaNacimiento} onChange={e => setDatos({...datos, fechaNacimiento: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-[#00304D]">Estado Civil</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" value={datos.estadoCivil} onChange={e => setDatos({...datos, estadoCivil: e.target.value})}>
                <option value="">Seleccionar...</option>
                <option value="SOLTERO">Soltero(a)</option>
                <option value="CASADO">Casado(a)</option>
                <option value="UNION_LIBRE">Unión Libre</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#00304D]">EPS</label>
              <Input value={datos.eps} onChange={e => setDatos({...datos, eps: e.target.value})} placeholder="Ej. Sura" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#00304D]">Fondo de Pensión</label>
              <Input value={datos.fondoPension} onChange={e => setDatos({...datos, fondoPension: e.target.value})} placeholder="Ej. Protección" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#00304D]">ARL</label>
              <Input value={datos.arl} onChange={e => setDatos({...datos, arl: e.target.value})} placeholder="Ej. Sura" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={saving} className="bg-[#39A900] hover:bg-[#007832] text-white">
              <Save className="mr-2 h-4 w-4" /> {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6 animate-in fade-in">
          <p className="text-sm text-gray-500">
            Sube aquí los documentos obligatorios requeridos para tu contratación y seguimiento.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocCard title="Documento de Identidad" tipo="CEDULA" />
            <DocCard title="Hoja de Vida (Formato SENA)" tipo="HOJA_DE_VIDA" />
            <DocCard title="Certificados Académicos" tipo="CERTIFICADO_ESTUDIO" />
            <DocCard title="Certificación Bancaria" tipo="CERTIFICADO_BANCARIO" />
          </div>
        </div>
      )}
    </div>
  );
}

function DocCard({ title, tipo }: { title: string; tipo: string }) {
  // Simularemos el UI de estado por ahora
  return (
    <div className="border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <UploadCloud className="h-5 w-5 text-gray-400" />
      </div>
      <h3 className="font-semibold text-sm text-[#00304D]">{title}</h3>
      <p className="text-xs text-gray-500 mt-1 mb-3">PDF (Max 5MB)</p>
      <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => alert("Función de subida en desarrollo")}>Subir Archivo</Button>
    </div>
  );
}
