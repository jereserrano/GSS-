"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

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
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
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
