"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Save } from "lucide-react";
import { asignarCargasMasivas } from "@/actions/academico.actions";

interface Instructor {
  id: string;
  nombres: string;
  apellidos: string;
}

interface RAP {
  id: string;
  codigo: string;
  nombre: string;
}

interface Competencia {
  id: string;
  codigo: string;
  nombre: string;
  resultadosAprendizaje?: RAP[];
}

interface Programa {
  id: string;
  codigo: string;
  nombre: string;
  competencias?: {
    competencia: Competencia;
  }[];
}

export function AsignacionCargaPanel({ programas, instructores }: { programas: any[], instructores: any[] }) {
  const [asignaciones, setAsignaciones] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleInstructorChange = (rapId: string, instructorId: string) => {
    setAsignaciones(prev => ({
      ...prev,
      [rapId]: instructorId
    }));
  };

  const handleGuardar = async () => {
    setLoading(true);
    try {
      if (!programas || programas.length === 0) throw new Error("No hay programa seleccionado");
      
      const res = await asignarCargasMasivas(programa.id, asignaciones);
      if (res.error) throw new Error(res.error);
      
      toast.success("Cargas asignadas correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al asignar cargas");
    } finally {
      setLoading(false);
    }
  };

  if (!programas || programas.length === 0) {
    return <div className="text-center p-4">No hay programas disponibles.</div>;
  }

  const programa = programas[0]; // Por simplicidad, tomamos el primero
  const competencias = programa.competencias?.map((c: any) => c.competencia) || [];

  return (
    <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <Users size={20} />
          <h2 className="font-semibold text-lg">Asignación de Cargas - {programa.nombre}</h2>
        </div>
        <Button onClick={handleGuardar} disabled={loading || Object.keys(asignaciones).length === 0}>
          <Save size={16} className="mr-2" /> {loading ? "Guardando..." : "Guardar Asignaciones"}
        </Button>
      </div>

      <div className="p-4 space-y-6 max-h-[500px] overflow-y-auto">
        {competencias.length === 0 ? (
          <p className="text-center text-slate-500">No hay competencias en este programa.</p>
        ) : (
          competencias.map((comp: Competencia) => (
            <div key={comp.id} className="border border-border rounded-lg p-4 bg-slate-50/50">
              <h3 className="font-semibold text-md mb-2">{comp.codigo} - {comp.nombre}</h3>
              <div className="space-y-3 mt-4 pl-4 border-l-2 border-primary/20">
                {comp.resultadosAprendizaje && comp.resultadosAprendizaje.length > 0 ? (
                  comp.resultadosAprendizaje.map((rap: RAP) => (
                    <div key={rap.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-white rounded-md border border-border shadow-sm">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{rap.codigo}</p>
                        <p className="text-xs text-slate-500 line-clamp-2">{rap.nombre}</p>
                      </div>
                      <div className="w-full sm:w-64">
                        <select 
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={asignaciones[rap.id] || ""}
                          onChange={(e) => handleInstructorChange(rap.id, e.target.value)}
                        >
                          <option value="">Sin Asignar</option>
                          {instructores.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.nombres} {inst.apellidos}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">Sin resultados de aprendizaje.</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
