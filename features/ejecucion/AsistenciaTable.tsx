"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Download, Pencil, Trash2 } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { formatDateShort } from "@/lib/utils";
import { deleteAsistencia, exportAsistenciasXLSX } from "@/actions/asistencia.actions";
import { AsistenciaFormDialog } from "./AsistenciaFormDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AsistenciasTableProps {
  initialData: any;
  fichas: { id: string; codigo: string; programa: { nombre: string } }[];
  instructores: { id: string; nombres: string; apellidos: string }[];
}

export function AsistenciaTable({ initialData, fichas, instructores }: AsistenciasTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAsistencia, setSelectedAsistencia] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const asistencias = initialData?.data || [];

  const handleEdit = (asistencia: any) => {
    setSelectedAsistencia(asistencia);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedAsistencia(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta sesión de asistencia?")) return;
    
    setLoading(true);
    try {
      const res = await deleteAsistencia(id);
      if (res.error) throw new Error(res.error);
      toast.success("Sesión eliminada correctamente");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportAsistenciasXLSX();
      if (!result.success || !result.base64) throw new Error(result.error || "Error exportando");
      // Decodificar base64 → Uint8Array → Blob
      const binary = atob(result.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `asistencia_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Reporte XLSX exportado correctamente");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setExporting(false);
    }
  };

  const columnas: ColumnaDef<any>[] = [
    {
      key: "ficha",
      header: "Ficha / Grupo",
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary text-sm">{a.ficha.codigo}</span>
          <span className="text-xs text-text-secondary line-clamp-1">{a.ficha.programa.nombre}</span>
        </div>
      )
    },
    {
      key: "fecha",
      header: "Fecha de Sesión",
      render: (a) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{formatDateShort(a.fecha)}</span>
          {a.tema && <span className="text-xs text-text-secondary truncate max-w-[150px]">{a.tema}</span>}
        </div>
      )
    },
    {
      key: "instructor",
      header: "Instructor",
      render: (a) => <span className="text-sm text-text-secondary">{a.instructor.nombres} {a.instructor.apellidos}</span>
    },
    {
      key: "asistencia",
      header: "Resumen de Asistencia",
      render: (a) => {
        const total = a.ficha._count?.aprendices || 0;
        
        let asistieron = 0;
        let faltas = 0;
        let excusas = 0;
        
        if (a.registros) {
          a.registros.forEach((r: any) => {
            if (r.estado === "ASISTIO") asistieron++;
            else if (r.estado === "FALTA") faltas++;
            else if (r.estado === "EXCUSA") excusas++;
          });
        }

        const porcentajeAsistencia = total > 0 ? Math.round((asistieron / total) * 100) : 0;
        const porcentajeFaltas = total > 0 ? Math.round((faltas / total) * 100) : 0;
        const porcentajeExcusas = total > 0 ? Math.round((excusas / total) * 100) : 0;

        return (
          <div className="flex flex-col gap-1 w-full min-w-[150px] max-w-[200px]">
            <div className="flex justify-between text-xs">
              <span className="text-success-600 font-medium">{asistieron} Asist.</span>
              <span className="text-danger-600 font-medium">{faltas} Faltas</span>
              <span className="text-warning-600 font-medium">{excusas} Exc.</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-success-500 h-full transition-all" style={{ width: `${porcentajeAsistencia}%` }} title={`Asistencias: ${asistieron}`} />
              <div className="bg-danger-500 h-full transition-all" style={{ width: `${porcentajeFaltas}%` }} title={`Faltas: ${faltas}`} />
              <div className="bg-warning-500 h-full transition-all" style={{ width: `${porcentajeExcusas}%` }} title={`Excusas: ${excusas}`} />
            </div>
          </div>
        );
      }
    },
    {
      key: "estado",
      header: "Estado",
      render: (a) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
          ${a.estado === 'FINALIZADA' ? 'bg-success-50 text-success-700' : 
            a.estado === 'EN_CURSO' ? 'bg-info-50 text-info-700' : 
            a.estado === 'PROGRAMADA' ? 'bg-warning-50 text-warning-700' :
            'bg-slate-100 text-slate-700'}`}
        >
          {a.estado ? a.estado.replace("_", " ").toLowerCase() : "pendiente"}
        </span>
      )
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (a) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(a)}>
            <Pencil size={16} className="text-text-secondary" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <Input 
              placeholder="Buscar por ficha o instructor..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-surface pl-9"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-surface" onClick={handleExport} disabled={exporting}>
            <Download size={16} className="mr-2" /> {exporting ? "Exportando..." : "Reporte"}
          </Button>
          <Button onClick={() => router.push("/asistencia/tomar")}>
            <Plus size={16} className="mr-2" /> Tomar Asistencia (Lista)
          </Button>
        </div>
      </div>

      <DataTable 
        data={asistencias} 
        columnas={columnas} 
        isLoading={loading} 
      />

      {dialogOpen && (
        <AsistenciaFormDialog 
          asistencia={selectedAsistencia}
          fichas={fichas}
          instructores={instructores}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
