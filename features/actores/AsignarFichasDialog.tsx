"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getFichasInstructor, assignFichasToInstructor } from "@/actions/instructores.actions";
import { toast } from "sonner";
import { X, Link as LinkIcon, Loader2 } from "lucide-react";

interface AsignarFichasDialogProps {
  instructor: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function AsignarFichasDialog({ instructor, onClose, onSuccess }: AsignarFichasDialogProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fichas, setFichas] = useState<any[]>([]);
  const [selectedFichas, setSelectedFichas] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadFichas() {
      try {
        const res = await getFichasInstructor(instructor.id);
        if (res.success) {
          setFichas(res.fichas || []);
          setSelectedFichas(new Set(res.asignadasIds || []));
        } else {
          toast.error(res.error || "Error al cargar las fichas");
        }
      } catch (error: any) {
        toast.error("Error cargando fichas");
      } finally {
        setLoading(false);
      }
    }
    loadFichas();
  }, [instructor.id]);

  const handleToggle = (id: string) => {
    const next = new Set(selectedFichas);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedFichas(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await assignFichasToInstructor(instructor.id, Array.from(selectedFichas));
      if (res.error) throw new Error(res.error);
      toast.success("Fichas asignadas correctamente");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error al asignar fichas");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sena-50 rounded-lg">
              <LinkIcon size={20} className="text-sena-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Asignar Fichas
              </h2>
              <p className="text-xs text-text-secondary">
                Instructor: {instructor.nombres} {instructor.apellidos}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1 bg-gray-50/50">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-text-secondary">
              <Loader2 className="animate-spin mr-2" size={20} /> Cargando fichas...
            </div>
          ) : fichas.length === 0 ? (
            <div className="text-center py-8 text-sm text-text-secondary bg-white rounded-lg border border-dashed">
              No hay fichas activas disponibles.
            </div>
          ) : (
            <div className="grid gap-2">
              {fichas.map((f) => (
                <label
                  key={f.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedFichas.has(f.id) 
                      ? 'bg-sena-50/50 border-sena-200' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-sena-600 rounded border-gray-300 focus:ring-sena-500"
                      checked={selectedFichas.has(f.id)}
                      onChange={() => handleToggle(f.id)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-text-primary">
                      Ficha {f.codigo}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {f.programa?.nombre}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-white rounded-b-xl">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving || loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Guardando..." : "Guardar Asignaciones"}
          </Button>
        </div>
      </div>
    </div>
  );
}
