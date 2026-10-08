"use client";

import React, { useEffect, useState } from "react";
import { getSolicitudesCartasAction, createSolicitudCartaAction, deleteSolicitudCartaAction, updateSolicitudCartaUserAction } from "@/actions/documentos.actions";
import { toast } from "sonner";
import { Trash2, PlusCircle, CheckCircle, Clock, XCircle, Edit2, GraduationCap, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TIPOS_CERTIFICADO = [
  { value: "CERTIFICADO_ESTUDIO", label: "Certificado de Estudio", descripcion: "Acredita que te encuentras activo en el proceso de formación." },
  { value: "CERTIFICADO_ESTUDIO_NOTAS", label: "Certificado de Estudio con Notas", descripcion: "Incluye el detalle de tus calificaciones y juicios evaluativos agrupados por competencia." },
];

export function DocumentosAprendiz({ userId }: { userId: string }) {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Solicitudes
  const [openSol, setOpenSol] = useState(false);
  const [solTipo, setSolTipo] = useState("CERTIFICADO_ESTUDIO");
  const [solMotivo, setSolMotivo] = useState("");
  const [solDirigido, setSolDirigido] = useState("");
  const [editingSolId, setEditingSolId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const res = await getSolicitudesCartasAction(userId);
    if (res.success) setSolicitudes(res.data || []);
    setLoading(false);
  };

  const handleSolicitarCertificado = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    let res;
    if (editingSolId) {
      res = await updateSolicitudCartaUserAction(editingSolId, {
        tipoCarta: solTipo,
        motivo: solMotivo,
        dirigidoA: solDirigido,
      });
    } else {
      res = await createSolicitudCartaAction({
        userId,
        tipoCarta: solTipo,
        motivo: solMotivo,
        dirigidoA: solDirigido,
      });
    }

    if (res.success) {
      toast.success(editingSolId ? "Solicitud actualizada" : "Solicitud de certificado enviada");
      setOpenSol(false);
      setSolMotivo("");
      setSolDirigido("");
      setSolTipo("CERTIFICADO_ESTUDIO");
      setEditingSolId(null);
      loadData();
    } else {
      toast.error(res.error || "Error al solicitar certificado");
    }
    setSubmitting(false);
  };

  const handleDeleteSol = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta solicitud?")) return;
    const res = await deleteSolicitudCartaAction(id);
    if (res.success) {
      toast.success("Solicitud eliminada");
      loadData();
    } else {
      toast.error(res.error || "Error al eliminar");
    }
  };

  const openEditSol = (sol: any) => {
    setEditingSolId(sol.id);
    setSolTipo(sol.tipoCarta);
    setSolDirigido(sol.dirigidoA || "");
    setSolMotivo(sol.motivo || "");
    setOpenSol(true);
  };

  const tipoInfo = TIPOS_CERTIFICADO.find(t => t.value === solTipo);

  const getLabelTipo = (tipo: string) => {
    const found = TIPOS_CERTIFICADO.find(t => t.value === tipo);
    return found?.label || tipo;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-green-50 p-2.5 rounded-lg">
            <GraduationCap size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Mis Certificados de Estudio</h3>
            <p className="text-sm text-gray-500">Solicita certificados de estudio para tus trámites personales.</p>
          </div>
        </div>
        <Button size="sm" onClick={() => {
          setEditingSolId(null);
          setSolMotivo("");
          setSolDirigido("");
          setSolTipo("CERTIFICADO_ESTUDIO");
          setOpenSol(true);
        }}>
          <PlusCircle size={16} className="mr-2" /> Solicitar Certificado
        </Button>
      </div>

      {/* Modal Nueva Solicitud */}
      {openSol && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setOpenSol(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><XCircle size={20}/></button>
            <h2 className="text-lg font-bold mb-4">{editingSolId ? "Editar Solicitud" : "Solicitar Certificado"}</h2>
            <form onSubmit={handleSolicitarCertificado} className="space-y-4">
              {/* Tipo de Certificado */}
              <div>
                <label className="text-sm font-medium">Tipo de Certificado</label>
                <select 
                  className="w-full border rounded-md p-2 mt-1" 
                  value={solTipo} 
                  onChange={e => setSolTipo(e.target.value)}
                >
                  {TIPOS_CERTIFICADO.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Info del tipo seleccionado */}
              {tipoInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                    {solTipo === "CERTIFICADO_ESTUDIO_NOTAS" ? <FileText size={16} /> : <GraduationCap size={16} />}
                    {tipoInfo.label}
                  </p>
                  <p className="text-xs text-green-600 mt-1">{tipoInfo.descripcion}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Dirigido a (Opcional)</label>
                <Input value={solDirigido} onChange={e => setSolDirigido(e.target.value)} placeholder="Ej. A quien interese, Universidad X..." />
              </div>
              <div>
                <label className="text-sm font-medium">Motivo / Observación (Opcional)</label>
                <textarea className="w-full border rounded-md p-2 mt-1 text-sm" rows={3} value={solMotivo} onChange={e => setSolMotivo(e.target.value)} placeholder="Ej. Necesito el certificado para trámite de matrícula..." />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {editingSolId ? "Guardar Cambios" : "Enviar Solicitud"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de solicitudes */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Fecha</th>
              <th className="px-4 py-3 font-medium text-gray-600">Tipo de Certificado</th>
              <th className="px-4 py-3 font-medium text-gray-600">Dirigido a</th>
              <th className="px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3 font-medium text-gray-600">Archivo</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Cargando...</td></tr>
            ) : solicitudes.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">No has realizado solicitudes de certificados.</td></tr>
            ) : (
              solicitudes.map(sol => (
                <tr key={sol.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{new Date(sol.creadoEn).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <span className="inline-flex items-center gap-1.5">
                      {sol.tipoCarta === "CERTIFICADO_ESTUDIO_NOTAS" 
                        ? <FileText size={14} className="text-blue-600" />
                        : <GraduationCap size={14} className="text-green-600" />
                      }
                      {getLabelTipo(sol.tipoCarta)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{sol.dirigidoA || "A quien interese"}</td>
                  <td className="px-4 py-3">
                    {sol.estado === "PENDIENTE" && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium"><Clock size={12}/> Pendiente</span>}
                    {sol.estado === "GENERADA" && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium"><CheckCircle size={12}/> Generada</span>}
                    {sol.estado === "RECHAZADA" && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium"><XCircle size={12}/> Rechazada</span>}
                  </td>
                  <td className="px-4 py-3">
                    {sol.urlCarta ? (
                      <a href={sol.urlCarta} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-semibold">
                        <Download size={14} /> Descargar
                      </a>
                    ) : <span className="text-gray-400 text-xs">-</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {sol.estado === "PENDIENTE" && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditSol(sol)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteSol(sol.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
