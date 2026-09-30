"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ExcelJS from "exceljs";

interface CsvImporterProps {
  onDataParsed: (data: any[]) => void;
  isLoading?: boolean;
  buttonText?: string;
}

export function CsvImporter({ onDataParsed, isLoading = false, buttonText = "Importar Masivo" }: CsvImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();

      // Parsear con exceljs (sin vulnerabilidades de xlsx: CVE-2023-30533, CVE-2024-22363)
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        toast.error("El archivo no contiene hojas de cálculo.");
        return;
      }

      // Extraer encabezados de la primera fila
      const headers: string[] = [];
      worksheet.getRow(1).eachCell((cell) => {
        headers.push(String(cell.value ?? ""));
      });

      // Convertir filas a objetos JSON
      const jsonData: any[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Saltar encabezados
        const rowObj: any = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header) rowObj[header] = cell.value ?? "";
        });
        // Solo añadir filas que no estén completamente vacías
        if (Object.values(rowObj).some((v) => v !== "" && v !== null && v !== undefined)) {
          jsonData.push(rowObj);
        }
      });

      if (jsonData.length === 0) {
        toast.error("El archivo está vacío o no tiene formato válido.");
      } else {
        onDataParsed(jsonData);
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error("Error al leer el archivo. Asegúrese de que sea un Excel o CSV válido.");
    } finally {
      setParsing(false);
      // Limpiar el input para permitir subir el mismo archivo si hubo error y se corrigió
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button 
        variant="outline" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading || parsing}
        className="bg-surface text-primary border-primary/20 hover:bg-primary/5"
      >
        <Upload size={16} className="mr-2" />
        {parsing ? "Leyendo..." : buttonText}
      </Button>
    </div>
  );
}
