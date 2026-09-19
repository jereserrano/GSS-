"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDocumento, updateDocumento } from "@/actions/documentos.actions";
import { toast } from "sonner";
import { X, FileText, UploadCloud } from "lucide-react";

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
  const [uploadMode, setUploadMode] = useState<"url" | "file">(documento?.url && !documento.url.startsWith("/uploads/") ? "url" : "file");
  const [file, setFile] = useState<File | null>(null);
  const isEditing = !!documento;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    let finalUrl = formData.get("url") as string;

    if (uploadMode === "file" && file) {
      try {
        const fileData = new FormData();
        fileData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fileData,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.error || "Error al subir archivo");
        finalUrl = uploadJson.url;
      } catch (err: any) {
        toast.error(err.message);
        setLoading(false);
        return;
      }
    }

    const data = {
      nombre: formData.get("nombre") as string,
      tipo: formData.get("tipo") as string,
      url: finalUrl,
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b shrink-0">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
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

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-text-primary">Archivo o Enlace *</label>
              <div className="flex bg-slate-100 p-1 rounded-md">
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`px-3 py-1 text-xs font-medium rounded ${uploadMode === "file" ? "bg-white shadow-sm text-sena-600" : "text-slate-500"}`}
                >
                  Subir Archivo
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={`px-3 py-1 text-xs font-medium rounded ${uploadMode === "url" ? "bg-white shadow-sm text-sena-600" : "text-slate-500"}`}
                >
                  Pegar Enlace
                </button>
              </div>
            </div>

            {uploadMode === "file" ? (
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
                <Input
                  type="file"
                  className="hidden"
                  id="fileUploadDoc"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="fileUploadDoc" className="cursor-pointer flex flex-col items-center gap-2 w-full">
                  <div className="p-3 bg-sena-50 text-sena-600 rounded-full">
                    <UploadCloud size={24} />
                  </div>
                  <div className="text-sm">
                    <span className="text-sena-600 font-semibold">Haz clic para subir</span> o arrastra un archivo
                  </div>
                  <p className="text-xs text-slate-500">
                    {file ? file.name : documento?.url ? "Archivo actual subido. Selecciona otro para reemplazar." : "PDF, Word, Excel, ZIP (Max. 10MB)"}
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Input
                  name="url"
                  type="url"
                  required={uploadMode === "url" && !file}
                  defaultValue={uploadMode === "url" ? (documento?.url || "") : ""}
                  placeholder="https://drive.google.com/... o ruta del archivo"
                />
                <p className="text-[10px] text-text-secondary">Pegue el enlace de acceso al documento (Google Drive, SharePoint, etc.)</p>
              </div>
            )}
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
