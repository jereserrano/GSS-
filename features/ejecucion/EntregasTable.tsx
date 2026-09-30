"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { Search, Plus, Download, Pencil, Trash2, UploadCloud } from "lucide-react";
import type { ColumnaDef } from "@/types/common.types";
import { formatDateShort } from "@/lib/utils";
import { deleteEntrega, exportEntregasCSV } from "@/actions/entregas.actions";
import { EntregaFormDialog } from "./EntregaFormDialog";
import { EntregaDetalleDialog } from "./EntregaDetalleDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EntregasTableProps {
  initialData: any;
  actividades: { id: string; nombre: string }[];
  aprendices: { id: string; nombres: string; apellidos: string; numeroDocumento: string }[];
  fichaIdFijo?: string;
}

export function EntregasTable({ initialData, actividades, aprendices, fichaIdFijo }: EntregasTableProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = ((session?.user as any)?.role ?? "").toUpperCase();
  const isAprendiz = userRole.includes("APRENDIZ");
  const canManage = userRole === "ADMINISTRADOR" || userRole === "COORDINADOR" || userRole.includes("INSTRUCTOR");
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState<any>(null);
  
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [entregaParaDetalle, setEntregaParaDetalle] = useState<any>(null);
  
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const entregas = initialData?.data || [];

  const filteredEntregas = React.useMemo(() => {
    if (!busqueda.trim()) return entregas;
    const lower = busqueda.toLowerCase();
    return entregas.filter((e: any) => 
      e.aprendiz?.nombres?.toLowerCase().includes(lower) ||
      e.aprendiz?.apellidos?.toLowerCase().includes(lower) ||
      e.aprendiz?.numeroDocumento?.toLowerCase().includes(lower) ||
      e.actividad?.nombre?.toLowerCase().includes(lower)
    );
  }, [busqueda, entregas]);

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  const totalPages = Math.ceil(filteredEntregas.length / itemsPerPage) || 1;
  const currentEntregas = filteredEntregas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (entrega: any) => {
    setSelectedEntrega(entrega);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedEntrega(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta entrega?")) return;
    
    setLoading(true);
    try {
      const res = await deleteEntrega(id);
      if (res.error) throw new Error(res.error);
      toast.success("Entrega eliminada correctamente");
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
      const result = await exportEntregasCSV();
      if (!result.success || !result.csv) throw new Error(result.error || "Error exportando");
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "entregas_export.csv";
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
      key: "aprendiz",
      header: "Aprendiz",
      render: (e) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{e.aprendiz.nombres} {e.aprendiz.apellidos}</span>
          <span className="text-xs text-text-secondary">{e.aprendiz.numeroDocumento}</span>
        </div>
      )
    },
    {
      key: "actividad",
      header: "Actividad / Evidencia",
      render: (e) => (
        <div className="flex flex-col max-w-xs cursor-pointer group" onClick={() => { setEntregaParaDetalle(e); setDetalleOpen(true); }}>
          <span className="text-sm font-medium line-clamp-1 group-hover:text-primary group-hover:underline" title={e.actividad?.nombre}>{e.actividad?.nombre}</span>
          <div className="flex items-center gap-2 mt-0.5">
            {e.urlArchivo ? (
              <span className="text-xs text-[#003F8C] font-medium">
                Ver detalle y evidencia ↗
              </span>
            ) : (
              <span className="text-xs text-slate-400">Sin archivo adjunto</span>
            )}
          </div>
        </div>
      )
    },
    {
      key: "fechaEntrega",
      header: "Fecha de Entrega",
      render: (e) => <span className="text-sm">{e.fechaEntrega ? formatDateShort(e.fechaEntrega) : "No entregado"}</span>
    },
    {
      key: "estado",
      header: "Estado / Juicio",
      render: (e) => {
        const est = (e.estado || "").toUpperCase();
        let badgeClass = "badge-pendiente-aprobacion";
        let labelText = "ENTREGADO — PENDIENTE";

        if (est === "APROBADA" || est === "APROBADO" || est === "CALIFICADA") {
          badgeClass = "badge-aprobado";
          labelText = est === "CALIFICADA" ? "CALIFICADA" : "APROBADA";
        } else if (est === "NO_APROBADA" || est === "RECHAZADO") {
          badgeClass = "badge-no-aprobado";
          labelText = "NO APROBADO";
        }

        return (
          <div className="flex flex-col gap-0.5">
            <span className={badgeClass}>
              {labelText}
            </span>
            {e.retroalimentacion && (
              <span className="text-[11px] text-slate-500 line-clamp-1 italic" title={e.retroalimentacion}>
                &quot;{e.retroalimentacion}&quot;
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: "calificacion",
      header: "Calificación",
      align: "center",
      render: (e) => {
        const cal = e.calificacion ? Number(e.calificacion) : null;
        let colorClass = "text-slate-400";
        if (cal !== null) {
          colorClass = cal >= 3.5 ? "text-success-600" : "text-danger-600";
        }
        return (
          <span className={`font-bold ${colorClass}`}>
            {cal !== null ? cal.toFixed(1) : "—"}
          </span>
        );
      }
    },
    ...(canManage || isAprendiz ? [{
      key: "acciones",
      header: "Acciones",
      align: "right" as const,
      render: (e: any) =>
        isAprendiz ? (
          <div className="flex justify-end gap-2">
            {e.estado !== "APROBADA" && (
              <Button variant="outline" size="sm" onClick={() => handleEdit(e)}>
                <UploadCloud size={14} className="mr-1" /> Actualizar
              </Button>
            )}
          </div>
        ) : canManage ? (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(e)}>
              <Pencil size={16} className="text-text-secondary" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}>
              <Trash2 size={16} className="text-red-500" />
            </Button>
          </div>
        ) : null,
    }] : [])
  ];

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-2 py-3 bg-white border border-slate-200 rounded-lg shadow-sm">
        <span className="text-sm text-slate-500">
          Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredEntregas.length)} de {filteredEntregas.length} registros
        </span>
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-3 text-sm font-medium text-slate-700">
            Página {currentPage} de {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <Input 
              placeholder="Buscar por aprendiz o actividad..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-surface pl-9"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          {!isAprendiz && (
            <Button variant="outline" className="bg-surface" onClick={handleExport} disabled={exporting}>
              <Download size={16} className="mr-2" /> {exporting ? "Exportando..." : "Exportar"}
            </Button>
          )}
          {canManage && (
            <Button onClick={handleCreate}>
              <Plus size={16} className="mr-2" /> Registrar Entrega
            </Button>
          )}
        </div>
      </div>

      {renderPagination()}

      <DataTable 
        data={currentEntregas} 
        columnas={columnas} 
        isLoading={loading} 
      />

      {renderPagination()}

      {dialogOpen && (
        <EntregaFormDialog 
          entrega={selectedEntrega}
          actividades={actividades}
          aprendices={aprendices}
          fichaIdFijo={fichaIdFijo}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      {detalleOpen && entregaParaDetalle && (
        <EntregaDetalleDialog
          entrega={entregaParaDetalle}
          onClose={() => setDetalleOpen(false)}
          canEdit={canManage}
          onEdit={() => handleEdit(entregaParaDetalle)}
        />
      )}
    </div>
  );
}
