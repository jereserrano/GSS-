"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText, Download, Pencil, Trash2 } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { formatDateShort } from "@/lib/utils";
import { deleteDocumento, exportDocumentosCSV } from "@/actions/documentos.actions";
import { DocumentoFormDialog } from "./DocumentoFormDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DocumentosTableProps {
  initialData: any;
  instituciones: { id: string; nombre: string }[];
}

export function DocumentosTable({ initialData, instituciones }: DocumentosTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const documentos = initialData?.data || [];

  const handleEdit = (d: any) => { setSelectedDocumento(d); setDialogOpen(true); };
  const handleCreate = () => { setSelectedDocumento(null); setDialogOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este documento?")) return;
    setLoading(true);
    try {
      const res = await deleteDocumento(id);
      if (res.error) throw new Error(res.error);
      toast.success("Documento eliminado correctamente");
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
      const result = await exportDocumentosCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "documentos_export.csv";
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

  const formatBytes = (bytes?: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const columnas: ColumnaDef<any>[] = [
    {
      key: "nombre",
      header: "Documento",
      render: (d) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sena-50 text-sena-600 rounded-lg shrink-0">
            <FileText size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-text-primary">{d.nombre}</span>
            <span className="text-xs text-text-secondary">{formatBytes(d.tamanoBytes)}</span>
          </div>
        </div>
      )
    },
    {
      key: "tipo",
      header: "Tipo",
      render: (d) => <span className="text-sm font-medium capitalize">{d.tipo.toLowerCase()}</span>
    },
    {
      key: "institucion",
      header: "Institución Asociada",
      render: (d) => <span className="text-sm">{d.institucion?.nombre || "General"}</span>
    },
    {
      key: "fechaSubida",
      header: "Fecha de Registro",
      render: (d) => <span className="text-sm">{formatDateShort(d.creadoEn)}</span>
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (d) => (
        <div className="flex justify-end gap-2">
          {d.url && d.url !== "#" && (
            <Button variant="ghost" size="icon" asChild>
              <a href={d.url} target="_blank" rel="noopener noreferrer">
                <Download size={16} className="text-text-secondary" />
              </a>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => handleEdit(d)}>
            <Pencil size={16} className="text-text-secondary" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}>
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
            <Input placeholder="Buscar documento o institución..." value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)} className="bg-surface pl-9" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-surface" onClick={handleExport} disabled={exporting}>
            <Download size={16} className="mr-2" /> {exporting ? "Exportando..." : "Exportar"}
          </Button>
          <Button onClick={handleCreate}>
            <Plus size={16} className="mr-2" /> Registrar Documento
          </Button>
        </div>
      </div>

      <DataTable data={documentos} columnas={columnas} isLoading={loading} />

      {dialogOpen && (
        <DocumentoFormDialog
          documento={selectedDocumento}
          instituciones={instituciones}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
