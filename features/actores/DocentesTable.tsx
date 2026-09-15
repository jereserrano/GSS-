"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Download, Pencil, Trash2 } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { deleteDocente, exportDocentesCSV } from "@/actions/docentes.actions";
import { DocenteFormDialog } from "./DocenteFormDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DocentesTableProps {
  initialData: any;
}

export function DocentesTable({ initialData }: DocentesTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const docentes = initialData?.data || [];

  const handleEdit = (docente: any) => {
    setSelectedDocente(docente);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedDocente(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este docente par?")) return;
    
    setLoading(true);
    try {
      const res = await deleteDocente(id);
      if (res.error) throw new Error(res.error);
      toast.success("Docente eliminado correctamente");
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
      const result = await exportDocentesCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "docentes_export.csv";
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
      header: "Docente Par",
      render: (d) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{d.nombres} {d.apellidos}</span>
          <span className="text-xs text-text-secondary">{d.email}</span>
        </div>
      )
    },
    {
      key: "institucion",
      header: "Institución / Sede",
      render: (d) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{d.institucionNombre || "-"}</span>
          <span className="text-xs text-text-secondary">{d.sedeNombre || "-"}</span>
        </div>
      )
    },
    {
      key: "asignatura",
      header: "Asignatura",
      render: (d) => <span className="text-sm">{d.asignatura || "-"}</span>
    },
    {
      key: "telefono",
      header: "Teléfono",
      render: (d) => <span className="text-sm">{d.telefono || "-"}</span>
    },
    {
      key: "estado",
      header: "Estado",
      render: (d) => <StatusBadge estado={d.estado} />
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (d) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(d)}>
            <Pencil size={16} className="text-text-secondary" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}>
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
              placeholder="Buscar por nombre o institución..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-surface pl-9"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-surface" onClick={handleExport} disabled={exporting}>
            <Download size={16} className="mr-2" /> {exporting ? "Exportando..." : "Exportar"}
          </Button>
          <Button onClick={handleCreate}>
            <Plus size={16} className="mr-2" /> Nuevo Docente
          </Button>
        </div>
      </div>

      <DataTable 
        data={docentes} 
        columnas={columnas} 
        isLoading={loading} 
      />

      {dialogOpen && (
        <DocenteFormDialog 
          docente={selectedDocente}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
