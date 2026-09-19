"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { Search, Plus, Download, Pencil, Trash2, UploadCloud, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { formatDateShort } from "@/lib/utils";
import { deleteActividad, exportActividadesCSV } from "@/actions/actividades.actions";
import { ActividadFormDialog } from "./ActividadFormDialog";
import { EntregaFormDialog } from "./EntregaFormDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ActividadesTableProps {
  initialData: any;
  fichas: { id: string; codigo: string; programa: { nombre: string } }[];
}

export function ActividadesTable({ initialData, fichas }: ActividadesTableProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = ((session?.user as any)?.role ?? "").toUpperCase();
  const isAprendiz = userRole.includes("APRENDIZ");

  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActividad, setSelectedActividad] = useState<any>(null);
  const [entregaDialogOpen, setEntregaDialogOpen] = useState(false);
  const [actividadParaEntregar, setActividadParaEntregar] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const actividades = initialData?.data || [];

  const handleEdit = (actividad: any) => {
    setSelectedActividad(actividad);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedActividad(null);
    setDialogOpen(true);
  };

  const handleEntregar = (actividad: any) => {
    setActividadParaEntregar(actividad);
    setEntregaDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta actividad? Se eliminarán todas las entregas asociadas.")) return;
    
    setLoading(true);
    try {
      const res = await deleteActividad(id);
      if (res.error) throw new Error(res.error);
      toast.success("Actividad eliminada correctamente");
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
      const result = await exportActividadesCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "actividades_export.csv";
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

  const getEstado = (fechaFin: string) => {
    if (new Date(fechaFin) < new Date()) return "CERRADA";
    return "ACTIVA";
  };

  const columnas: ColumnaDef<any>[] = isAprendiz ? [
    {
      key: "nombre",
      header: "Actividad",
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary line-clamp-1" title={a.nombre}>{a.nombre}</span>
          <span className="text-xs text-text-secondary capitalize">{a.tipo?.toLowerCase()}</span>
        </div>
      )
    },
    {
      key: "ficha",
      header: "Ficha",
      render: (a) => (
        <span className="text-sm font-medium">{a.ficha?.codigo}</span>
      )
    },
    {
      key: "fechaInicio",
      header: "Inicio",
      render: (a) => (
        <span className="text-sm text-text-secondary">
          {a.fechaInicio ? formatDateShort(a.fechaInicio) : "—"}
        </span>
      )
    },
    {
      key: "fechaVencimiento",
      header: "Vencimiento",
      render: (a) => {
        const vencida = a.fechaVencimiento && new Date(a.fechaVencimiento) < new Date();
        return (
          <span className={`text-sm ${vencida ? 'text-danger-600 font-medium' : ''}`}>
            {a.fechaVencimiento ? formatDateShort(a.fechaVencimiento) : "—"}
          </span>
        );
      }
    },
    {
      key: "miEntrega",
      header: "Mi Entrega / Estado",
      render: (a) => {
        const entrega = a.entregas?.[0];
        if (!entrega) {
          return <span className="badge-sin-entregar">SIN ENTREGAR</span>;
        }

        const est = (entrega.estado || "").toUpperCase();
        if (est === "APROBADO" || est === "APROBADA" || est === "CALIFICADA") {
          return (
            <div className="flex flex-col items-start gap-1">
              <span className="badge-aprobado">{est === "CALIFICADA" ? "CALIFICADA" : "APROBADA"}</span>
              {entrega.calificacion && <span className="text-[10px] font-bold text-slate-500">Nota: {entrega.calificacion}</span>}
            </div>
          );
        }
        if (est === "NO_APROBADA" || est === "RECHAZADO") {
          return <span className="badge-no-aprobado">NO APROBADO</span>;
        }
        return <span className="badge-pendiente-aprobacion">ENTREGADO — PENDIENTE POR APROBACIÓN</span>;
      }
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (a) => {
        const entrega = a.entregas?.[0];
        const cerrada = new Date(a.fechaFin) < new Date();
        return (
          <div className="flex justify-end gap-2">
            {!cerrada && (
              <Button size="sm" variant="outline" onClick={() => handleEntregar(a)}>
                <UploadCloud size={14} className="mr-1" /> {entrega ? "Actualizar" : "Entregar"}
              </Button>
            )}
          </div>
        );
      }
    }
  ] : [
    {
      key: "nombre",
      header: "Actividad",
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary line-clamp-1" title={a.nombre}>{a.nombre}</span>
          <span className="text-xs text-text-secondary capitalize">{a.tipo.toLowerCase()}</span>
        </div>
      )
    },
    {
      key: "ficha",
      header: "Ficha",
      render: (a) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{a.ficha.codigo}</span>
          <span className="text-xs text-text-secondary line-clamp-1">{a.ficha.programa.nombre}</span>
        </div>
      )
    },
    {
      key: "fechaInicio",
      header: "Inicio",
      render: (a) => (
        <span className="text-sm text-text-secondary">
          {a.fechaInicio ? formatDateShort(a.fechaInicio) : "—"}
        </span>
      )
    },
    {
      key: "fechaVencimiento",
      header: "Vencimiento",
      render: (a) => {
        const vencida = a.fechaVencimiento && new Date(a.fechaVencimiento) < new Date();
        return (
          <span className={`text-sm ${vencida ? 'text-danger-600 font-medium' : ''}`}>
            {a.fechaVencimiento ? formatDateShort(a.fechaVencimiento) : "—"}
          </span>
        );
      }
    },
    {
      key: "entregas",
      header: "Progreso Entregas",
      align: "center",
      render: (a) => {
        const entregasCount = a._count?.entregas || 0;
        const totalAprendices = a.ficha._count?.aprendices || 1; // Evitar division por 0
        const porcentaje = Math.round((entregasCount / totalAprendices) * 100);
        
        return (
          <div className="flex flex-col items-center min-w-[100px]">
            <span className="text-sm font-medium">{entregasCount} / {a.ficha._count?.aprendices || 0}</span>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
              <div 
                className={`h-full ${porcentaje >= 80 ? 'bg-success-500' : porcentaje >= 50 ? 'bg-warning-500' : 'bg-danger-500'}`} 
                style={{ width: `${Math.min(porcentaje, 100)}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      key: "estado",
      header: "Estado",
      render: (a) => {
        const estado = getEstado(a.fechaFin);
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
            ${estado === 'ACTIVA' ? 'bg-info-50 text-info-700' : 'bg-slate-100 text-slate-700'}`}
          >
            {estado.toLowerCase()}
          </span>
        );
      }
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
              placeholder="Buscar por código o nombre..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-surface pl-9"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          {!isAprendiz && (
            <>
              <Button variant="outline" className="bg-surface" onClick={handleExport} disabled={exporting}>
                <Download size={16} className="mr-2" /> {exporting ? "Exportando..." : "Exportar"}
              </Button>
              <Button onClick={handleCreate}>
                <Plus size={16} className="mr-2" /> Nueva Actividad
              </Button>
            </>
          )}
        </div>
      </div>

      <DataTable 
        data={actividades} 
        columnas={columnas} 
        isLoading={loading} 
      />

      {/* Dialog de creación/edición para Instructor/Admin */}
      {dialogOpen && !isAprendiz && (
        <ActividadFormDialog 
          actividad={selectedActividad}
          fichas={fichas}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      {/* Dialog de entrega de evidencia para Aprendiz */}
      {entregaDialogOpen && isAprendiz && actividadParaEntregar && (
        <EntregaFormDialog
          entrega={actividadParaEntregar.entregas?.[0] ? {
            ...actividadParaEntregar.entregas[0],
            actividadId: actividadParaEntregar.id,
            actividad: { nombre: actividadParaEntregar.nombre }
          } : null}
          actividades={[{ id: actividadParaEntregar.id, nombre: actividadParaEntregar.nombre }]}
          aprendices={[]}
          onClose={() => setEntregaDialogOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
