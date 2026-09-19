"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, X, ShieldAlert, Save } from "lucide-react";
import { guardarAsistenciaMasiva } from "@/actions/asistencia.actions";

interface Aprendiz {
  id: string;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
}

interface Ficha {
  id: string;
  codigo: string;
  programa: { nombre: string };
  aprendices: Aprendiz[];
}

interface Instructor {
  id: string;
  nombres: string;
  apellidos: string;
  userId?: string;
}

export function TomaAsistenciaForm({ fichas, instructores, instructorPreseleccionado }: { 
  fichas: Ficha[], 
  instructores: Instructor[],
  instructorPreseleccionado?: Instructor | null
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = ((session?.user as any)?.role || "").toUpperCase();
  const isInstructor = userRole.includes("INSTRUCTOR");
  const currentUserId = (session?.user as any)?.id;
  
  // Usar el instructor preseleccionado del servidor si está disponible
  const currentInstructorRecord = useMemo(() => {
    if (instructorPreseleccionado) return instructorPreseleccionado;
    return isInstructor ? instructores.find(i => i.userId === currentUserId) : null;
  }, [instructorPreseleccionado, isInstructor, instructores, currentUserId]);

  const [fichaId, setFichaId] = useState("");
  const [instructorId, setInstructorId] = useState(instructorPreseleccionado?.id || currentInstructorRecord?.id || "");
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    if (currentInstructorRecord && !instructorId) {
      setInstructorId(currentInstructorRecord.id);
    }
  }, [currentInstructorRecord, instructorId]);
  
  // Asistencias locales
  const [asistencias, setAsistencias] = useState<Record<string, "PRESENTE" | "FALLA" | "EXCUSA">>({});
  const [observaciones, setObservaciones] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const selectedFicha = useMemo(() => fichas.find(f => f.id === fichaId), [fichas, fichaId]);

  // Cuando se selecciona una ficha, inicializamos a todos como PRESENTES
  const handleFichaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setFichaId(id);
    const ficha = fichas.find(f => f.id === id);
    if (ficha) {
      const initial: Record<string, "PRESENTE" | "FALLA" | "EXCUSA"> = {};
      ficha.aprendices.forEach(a => initial[a.id] = "PRESENTE");
      setAsistencias(initial);
      setObservaciones({});
    }
  };

  const setEstado = (aprendizId: string, estado: "PRESENTE" | "FALLA" | "EXCUSA") => {
    setAsistencias(prev => ({ ...prev, [aprendizId]: estado }));
  };

  const handleGuardar = async () => {
    if (!fichaId || !instructorId || !fecha) {
      toast.error("Complete los datos básicos (Ficha, Instructor y Fecha)");
      return;
    }
    
    if (!selectedFicha || selectedFicha.aprendices.length === 0) {
      toast.error("La ficha no tiene aprendices");
      return;
    }

    setLoading(true);

    const detalles = selectedFicha.aprendices.map(a => ({
      aprendizId: a.id,
      estado: asistencias[a.id] || "PRESENTE",
      observaciones: observaciones[a.id] || "",
    }));

    const result = await guardarAsistenciaMasiva({
      fichaId,
      instructorId,
      fecha,
      detalles
    });

    setLoading(false);

    if (result.success) {
      toast.success("Asistencia registrada masivamente con éxito");
      router.push("/asistencia");
    } else {
      toast.error(result.error || "Error al registrar asistencia");
    }
  };

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Ficha / Grupo</label>
          <select value={fichaId} onChange={handleFichaChange} className={selectClass} required>
            <option value="">Seleccione una ficha</option>
            {fichas.map(f => (
              <option key={f.id} value={f.id}>{f.codigo} - {f.programa.nombre}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Instructor</label>
          {isInstructor && currentInstructorRecord ? (
            <div className="flex h-10 w-full items-center rounded-md border border-input bg-sena-50 px-3 py-2 text-sm text-sena-800">
              <span className="font-semibold">{currentInstructorRecord.nombres} {currentInstructorRecord.apellidos}</span>
            </div>
          ) : (
            <select value={instructorId} onChange={(e) => setInstructorId(e.target.value)} className={selectClass} required>
              <option value="">Seleccione un instructor</option>
              {instructores.map(i => (
                <option key={i.id} value={i.id}>{i.nombres} {i.apellidos}</option>
              ))}
            </select>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Fecha de Sesión</label>
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>
      </div>

      {/* Grid de Aprendices */}
      {selectedFicha && selectedFicha.aprendices.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h3 className="font-semibold text-text-primary text-lg">Listado de Aprendices ({selectedFicha.aprendices.length})</h3>
              <p className="text-sm text-text-secondary">Marque la inasistencia o excusa si corresponde.</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const updated: Record<string, "PRESENTE" | "FALLA" | "EXCUSA"> = {};
                selectedFicha.aprendices.forEach(a => updated[a.id] = "PRESENTE");
                setAsistencias(updated);
              }}
              className="hidden sm:flex text-green-600 border-green-200 hover:bg-green-50"
            >
              <Check className="w-4 h-4 mr-1" />
              Marcar todos como Presente
            </Button>
          </div>

          {/* Botón para móvil */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const updated: Record<string, "PRESENTE" | "FALLA" | "EXCUSA"> = {};
              selectedFicha.aprendices.forEach(a => updated[a.id] = "PRESENTE");
              setAsistencias(updated);
            }}
            className="w-full sm:hidden text-green-600 border-green-200 hover:bg-green-50 mt-2"
          >
            <Check className="w-4 h-4 mr-1" />
            Marcar todos como Presente
          </Button>

          <div className="space-y-3">
            {selectedFicha.aprendices.map((a, i) => (
              <div key={a.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary leading-tight">{a.apellidos} {a.nombres}</p>
                    <p className="text-xs text-text-secondary">CC: {a.numeroDocumento}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="flex bg-muted/50 p-1 rounded-md border border-border">
                    <button 
                      onClick={() => setEstado(a.id, "PRESENTE")}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1 ${asistencias[a.id] === "PRESENTE" ? "bg-green-100 text-green-700 shadow-sm" : "text-text-secondary hover:bg-background"}`}
                    >
                      <Check className="w-3 h-3" /> Presente
                    </button>
                    <button 
                      onClick={() => setEstado(a.id, "FALLA")}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1 ${asistencias[a.id] === "FALLA" ? "bg-red-100 text-red-700 shadow-sm" : "text-text-secondary hover:bg-background"}`}
                    >
                      <X className="w-3 h-3" /> Falla
                    </button>
                    <button 
                      onClick={() => setEstado(a.id, "EXCUSA")}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1 ${asistencias[a.id] === "EXCUSA" ? "bg-amber-100 text-amber-700 shadow-sm" : "text-text-secondary hover:bg-background"}`}
                    >
                      <ShieldAlert className="w-3 h-3" /> Excusa
                    </button>
                  </div>

                  <Input 
                    placeholder="Observación (opcional)" 
                    className="w-full sm:w-48 h-8 text-xs bg-background"
                    value={observaciones[a.id] || ""}
                    onChange={(e) => setObservaciones(prev => ({ ...prev, [a.id]: e.target.value }))}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button onClick={handleGuardar} disabled={loading} size="lg" className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Guardando..." : "Guardar Registro Masivo"}
            </Button>
          </div>
        </div>
      )}

      {selectedFicha && selectedFicha.aprendices.length === 0 && (
        <div className="p-8 text-center border border-dashed border-border rounded-xl">
          <p className="text-text-secondary">Esta ficha no tiene aprendices activos asignados.</p>
        </div>
      )}
    </div>
  );
}
