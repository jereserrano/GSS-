"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

interface UploadExcelDialogProps {
  title: string;
  description: string;
  onUpload: (data: any[]) => Promise<{ success: boolean; count?: number; error?: string }>;
  templateUrl?: string;
}

export function UploadExcelDialog({ title, description, onUpload, templateUrl }: UploadExcelDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rawJson = XLSX.utils.sheet_to_json(worksheet);
          
          // Retrocompatibilidad con la plantilla antigua
          const json = rawJson.map((row: any) => {
            if (row.fichaId && !row.codigoFicha) {
              row.codigoFicha = row.fichaId;
            }
            return row;
          });

          if (json.length === 0) {
            toast.error("El archivo está vacío");
            setLoading(false);
            return;
          }

          const res = await onUpload(json);
          
          if (res.success) {
            toast.success(`Carga exitosa: ${res.count} registros insertados.`);
            setOpen(false);
            setFile(null);
          } else {
            toast.error(res.error || "Error en la validación de los datos. Operación abortada.");
          }
        } catch (err: any) {
          toast.error("Error al procesar el archivo Excel.");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      toast.error("Error al leer el archivo");
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <Upload className="w-4 h-4" />
        Carga Masiva
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-border shadow-2xl rounded-xl w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-4 space-y-1">
              <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
              <p className="text-sm text-text-secondary">{description}</p>
            </div>
            
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted border-border transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-text-secondary" />
                    <p className="mb-2 text-sm text-text-secondary">
                      <span className="font-semibold text-primary">Click para subir</span> o arrastra el archivo
                    </p>
                    <p className="text-xs text-text-secondary">Archivos .xlsx o .xls</p>
                  </div>
                  <input 
                    id="dropzone-file" 
                    type="file" 
                    className="hidden" 
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              
              {file && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2.5 rounded-md border border-green-200">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="font-medium truncate">{file.name}</span>
                </div>
              )}
              
              <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                <p>La carga es <strong>atómica</strong>. Si un solo registro contiene errores (ej. documento duplicado), se abortará toda la operación.</p>
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 mt-6 pt-4 border-t border-border">
              <div>
                {templateUrl && (
                  <Button variant="link" onClick={() => window.open(`${templateUrl}?v=${Date.now()}`, "_blank")} className="text-primary hover:text-primary/80 px-0">
                    Descargar Plantilla Excel
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                  Cancelar
                </Button>
                <Button onClick={handleUpload} disabled={!file || loading}>
                  {loading ? "Procesando..." : "Subir Datos"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
