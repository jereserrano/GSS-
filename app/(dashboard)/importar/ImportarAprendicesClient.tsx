"use client";

import { useState } from "react";
import { read, utils } from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { importAprendicesMasivo } from "@/actions/import.actions";
import { Loader2, UploadCloud, FileSpreadsheet, AlertTriangle, CheckCircle2 } from "lucide-react";

export function ImportarAprendicesClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [resultado, setResultado] = useState<{success: boolean, message: string, issues?: any[]} | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const wb = read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      if (!wsname) return;
      const ws = wb.Sheets[wsname];
      const data = utils.sheet_to_json(ws);
      setPreview(data.slice(0, 5)); // show first 5 rows
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setResultado(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const bstr = event.target?.result;
        const wb = read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        if (!wsname) return;
        const ws = wb.Sheets[wsname];
        const data = utils.sheet_to_json(ws);

        // Normalize data to match schema
        const normalizedData = data.map((row: any) => ({
          numeroDocumento: row['Numero Documento'] || row.numeroDocumento || String(row.Identificacion || ''),
          tipoDocumento: row['Tipo Documento'] || row.tipoDocumento || 'CC',
          nombres: row['Nombres'] || row.nombres || '',
          apellidos: row['Apellidos'] || row.apellidos || '',
          emailSena: row['Email SENA'] || row.emailSena || '',
          emailPersonal: row['Email Personal'] || row.emailPersonal || '',
          telefono: row['Telefono'] || row.telefono ? String(row['Telefono'] || row.telefono) : undefined,
          codigoFicha: row['Ficha'] || row.codigoFicha || String(row.Ficha || ''),
        }));

        const res = await importAprendicesMasivo(normalizedData);
        if (res.success) {
          toast.success(`Se importaron ${res.count} aprendices exitosamente.`);
          setResultado({ success: true, message: `Importación completada: ${res.count} registros procesados.` });
          setFile(null);
          setPreview([]);
        } else {
          toast.error(res.error || "Error en la importación");
          setResultado({ success: false, message: res.error || "Error desconocido", issues: (res.issues as any[]) });
        }
        setLoading(false);
      };
      reader.readAsBinaryString(file);
    } catch (e: any) {
      toast.error("No se pudo procesar el archivo.");
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          Importar Aprendices (Excel / CSV)
        </CardTitle>
        <CardDescription>
          Sube un archivo de Excel (.xlsx, .xls) o CSV con las columnas: 
          <strong> Numero Documento, Tipo Documento, Nombres, Apellidos, Email SENA, Telefono, Ficha</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-10 text-center hover:bg-slate-50 transition-colors">
          <Input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            onChange={handleFile}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
            <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
            <span className="text-sm font-medium text-slate-700">
              {file ? file.name : "Haz clic o arrastra un archivo aquí"}
            </span>
            <span className="text-xs text-slate-500 mt-1">Solo .xlsx, .xls, .csv</span>
          </label>
        </div>

        {preview.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Vista Previa (Primeras 5 filas)</h3>
            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    {Object.keys(preview[0]).map(k => <th key={k} className="p-2">{k}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {preview.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val: any, j) => <td key={j} className="p-2">{String(val)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Button onClick={handleImport} disabled={loading} className="w-full bg-[#39A900] hover:bg-[#2b8200]">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
              Procesar Importación
            </Button>
          </div>
        )}

        {resultado && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${resultado.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {resultado.success ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
            <div>
              <p className="font-semibold">{resultado.message}</p>
              {resultado.issues && (
                <ul className="list-disc ml-5 mt-2 text-xs space-y-1">
                  {resultado.issues.map((issue, idx) => (
                    <li key={idx}>
                      <strong>Fila / Campo ({issue.path.join(".")}):</strong> {issue.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
