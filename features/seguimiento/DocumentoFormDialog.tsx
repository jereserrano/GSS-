"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDocumento, updateDocumento } from "@/actions/documentos.actions";
import { toast } from "sonner";
import { X, FileText } from "lucide-react";

interface DocumentoFormDialogProps {
  documento?: any;
  instituciones: { id: string; nombre: string }[];
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const TIPOS_DOC = [
  { value: "ACTA", label: "Acta" },
  { value: "ACUERDO", label: "Acuerdo" },
  { value: "RESOLUCION", label: "Resolución" },
  { value: "CONVENIO", label: "Convenio" },
  { value: "OTRO", label: "Otro" },
];

export function DocumentoFormDialog({ documento, instituciones, onClose, onSuccess }: DocumentoFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!documento;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nombre: formData.get("nombre") as string,
      tipo: formData.get("tipo") as string,
      url: formData.get("url") as string,
      institucionId: formData.get("institucionId") as string || undefined,
    };

    try {
      if (isEditing) {
        const res = await updateDocumento(documento.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Documento actualizado correctamente");
      } else {
        const res = await createDocumento(data);
        if (res.error) throw new Error(res.error);
        toast.success("Documento registrado correctamente");
      }

      if (onSuccess) await onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col my-8">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sena-50 rounded-lg">
              <FileText size={20} className="text-sena-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEditing ? "Editar Documento" : "Registrar Documento"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing ? `Editando: ${documento.nombre}` : "Registrar un acta, acuerdo o resolución"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Nombre del Documento *</label>
            <Input
              name="nombre"
              defaultValue={documento?.nombre}
              required
              placeholder="Ej: Acta de Compromiso 2026.pdf"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Tipo de Documento</label>
              <select name="tipo" defaultValue={documento?.tipo || "OTRO"} className={selectClass}>
                {TIPOS_DOC.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Institución Asociada</label>
              <select name="institucionId" defaultValue={documento?.institucionId || ""} className={selectClass}>
                <option value="">General / Todas</option>
                {instituciones.map(i => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">URL / Enlace del Archivo</label>
            <Input
              name="url"
              defaultValue={documento?.url}
              placeholder="https://drive.google.com/... o ruta del archivo"
            />
            <p className="text-[10px] text-text-secondary">Pegue el enlace de acceso al documento (Google Drive, SharePoint, etc.)</p>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar Documento" : "Registrar Documento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
