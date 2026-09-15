"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Download, Pencil, Trash2 } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { deleteInstructor, exportInstructoresCSV } from "@/actions/instructores.actions";
import { InstructorFormDialog } from "./InstructorFormDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface InstructoresTableProps {
  initialData: any;
}

export function InstructoresTable({ initialData }: InstructoresTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const instructores = initialData?.data || [];

  const handleEdit = (instructor: any) => {
    setSelectedInstructor(instructor);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedInstructor(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este instructor?")) return;
    
    setLoading(true);
    try {
      const res = await deleteInstructor(id);
      if (res.error) throw new Error(res.error);
      toast.success("Instructor eliminado correctamente");
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
      const result = await exportInstructoresCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "instructores_export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Listado exportado correctamente");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setExporting(false);
    }
  };

  const columnas: ColumnaDef<any>[] = [
    {
      key: "nombres",
      header: "Instructor",
      render: (i) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{i.nombres} {i.apellidos}</span>
          <span className="text-xs text-text-secondary">{i.tipoDocumento} {i.numeroDocumento}</span>
        </div>
      )
    },
    {
      key: "contacto",
      header: "Contacto",
      render: (i) => (
        <div className="flex flex-col">
          <span className="text-sm">{i.email}</span>
          <span className="text-xs text-text-secondary">{i.telefono || "Sin teléfono"}</span>
        </div>
      )
    },
    {
      key: "profesion",
      header: "Perfil Profesional",
      render: (i) => <span className="text-sm">{i.profesion || "-"}</span>
    },
    {
      key: "asistenciasRegistradas",
      header: "Asistencias",
      align: "center",
      render: (i) => (
        <div className="flex flex-col items-center">
          <span className="font-medium">{i._count?.asistencias || 0}</span>
          <span className="text-[10px] text-text-secondary">Registros</span>
        </div>
      )
    },
    {
      key: "estado",
      header: "Estado",
      render: (i) => <StatusBadge estado={i.estado} />
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (i) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(i)}>
            <Pencil size={16} className="text-text-secondary" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(i.id)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <Input 
              placeholder="Buscar por nombre, documento o correo..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-surface pl-9"
            />
          </div>
          {/* Botón Filtros removido temporalmente hasta que se implementen filtros avanzados */}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-surface" onClick={handleExport} disabled={exporting}>
            <Download size={16} className="mr-2" /> {exporting ? "Exportando..." : "Exportar"}
          </Button>
          <Button onClick={handleCreate}>
            <Plus size={16} className="mr-2" /> Nuevo Instructor
          </Button>
        </div>
      </div>

      <DataTable 
        data={instructores} 
        columnas={columnas} 
        isLoading={loading} 
      />

      {dialogOpen && (
        <InstructorFormDialog 
          instructor={selectedInstructor}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
