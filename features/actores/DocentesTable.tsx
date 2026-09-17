"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { deleteDocenteAction } from "@/actions/docentes.actions";
import { DocenteFormDialog } from "./DocenteFormDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DocentesTableProps {
  initialData: any;
  instituciones: any[];
}

export function DocentesTable({ initialData, instituciones }: DocentesTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState<any>(null);

  // Filtro simple en frontend
  const docentes = (initialData?.data || []).filter((d: any) => 
    d.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.numeroDocumento.includes(busqueda)
  );

  const handleEdit = (docente: any) => {
    setSelectedDocente(docente);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedDocente(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este docente?")) return;
    
    setLoading(true);
    try {
      const res = await deleteDocenteAction(id);
      if (res.error) throw new Error(res.error);
      toast.success("Docente eliminado correctamente");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const columnas: ColumnaDef<any>[] = [
    {
      key: "nombres",
      header: "Docente",
      render: (i) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{i.nombres} {i.apellidos}</span>
          <span className="text-xs text-text-secondary">{i.tipoDocumento} {i.numeroDocumento}</span>
        </div>
      )
    },
    {
      key: "institucion",
      header: "Institución",
      render: (i) => <span className="text-sm font-medium">{i.institucion?.nombre || "-"}</span>
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
              placeholder="Buscar por nombre o documento..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-surface pl-9"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
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
          instituciones={instituciones}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => {
            setDialogOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
