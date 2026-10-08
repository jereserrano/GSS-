"use client";

import React, { useEffect, useState } from "react";
import { getDocumentosEmpleadoAction, getSolicitudesCartasAction, createDocumentoEmpleadoAction, createSolicitudCartaAction, deleteDocumentoEmpleadoAction, deleteSolicitudCartaAction, updateSolicitudCartaUserAction } from "@/actions/documentos.actions";
import { toast } from "sonner";
import { FileText, FileBadge, Trash2, Download, PlusCircle, CheckCircle, Clock, FileKey, XCircle, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";

export function DocumentosEmpleado({ userId }: { userId: string }) {
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const searchParams = useSearchParams();
  
  // Tabs State
  const initialTab = searchParams.get("tab") === "cartas" ? "cartas" : "documentos";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Modal Documentos
  const [openDoc, setOpenDoc] = useState(false);
  const [docNombre, setDocNombre] = useState("");
  const [docTipo, setDocTipo] = useState("HV");
  const [docUrl, setDocUrl] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [file, setFile] = useState<File | null>(null);

  // Modal Solicitudes
  const [openSol, setOpenSol] = useState(false);
  const [solTipo, setSolTipo] = useState("LABORAL");
  const [solMotivo, setSolMotivo] = useState("");
  const [solDirigido, setSolDirigido] = useState("");
  const [editingSolId, setEditingSolId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "cartas") {
      setActiveTab("cartas");
    } else if (tab === "documentos") {
      setActiveTab("documentos");
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [resDoc, resSol] = await Promise.all([
      getDocumentosEmpleadoAction(userId),
      getSolicitudesCartasAction(userId)
    ]);
    if (resDoc.success) setDocumentos(resDoc.data || []);
    if (resSol.success) setSolicitudes(resSol.data || []);
    setLoading(false);
  };

  const handleSubirDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    let finalUrl = docUrl;

    if (uploadMode === "file" && file) {
      try {
        const fileData = new FormData();
        fileData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fileData,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.error || "Error al subir archivo");
        finalUrl = uploadJson.url;
      } catch (err: any) {
        toast.error(err.message);
        setSubmitting(false);
        return;
      }
    } else if (uploadMode === "url" && !finalUrl) {
      toast.error("Debes ingresar un enlace");
      setSubmitting(false);
      return;
    }

    const res = await createDocumentoEmpleadoAction({
      userId,
      nombre: docNombre,
      tipoDocumento: docTipo,
      urlArchivo: finalUrl,
    });
    if (res.success) {
      toast.success("Documento guardado exitosamente");
      setOpenDoc(false);
      setDocNombre("");
      setDocUrl("");
      setFile(null);
      loadData();
    } else {
      toast.error(res.error || "Error al guardar documento");
    }
    setSubmitting(false);
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este documento?")) return;
    const res = await deleteDocumentoEmpleadoAction(id);
    if (res.success) {
      toast.success("Documento eliminado");
      loadData();
    } else {
      toast.error(res.error || "Error al eliminar");
    }
  };

  const handleSolicitarCarta = async (e: React.FormEvent) => {
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
      toast.success(editingSolId ? "Solicitud actualizada" : "Solicitud enviada");
      setOpenSol(false);
      setSolMotivo("");
      setSolDirigido("");
      setEditingSolId(null);
      loadData();
    } else {
      toast.error(res.error || "Error al solicitar carta");
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

  const renderIcon = (tipo: string) => {
    switch (tipo) {
      case "HV": return <FileBadge size={16} className="text-blue-500" />;
      case "CONTRATO": return <FileKey size={16} className="text-amber-500" />;
      default: return <FileText size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <Tabs className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger active={activeTab === "documentos"} onClick={() => setActiveTab("documentos")}>Archivos Personales</TabsTrigger>
          <TabsTrigger active={activeTab === "cartas"} onClick={() => setActiveTab("cartas")}>Solicitud de Cartas</TabsTrigger>
        </TabsList>

        <TabsContent active={activeTab === "documentos"} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">Sube aquí tu hoja de vida, certificados académicos o visualiza tu contrato.</p>
            <Button size="sm" onClick={() => setOpenDoc(true)}>
              <PlusCircle size={16} className="mr-2" /> Subir Archivo
            </Button>
          </div>

          {openDoc && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                <button onClick={() => setOpenDoc(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><XCircle size={20}/></button>
                <h2 className="text-lg font-bold mb-4">Subir Nuevo Documento</h2>
                <form onSubmit={handleSubirDoc} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Tipo</label>
                    <select className="w-full border rounded-md p-2 mt-1" value={docTipo} onChange={e => setDocTipo(e.target.value)}>
                      <option value="HV">Hoja de Vida (HV)</option>
                      <option value="CERTIFICADO_ACADEMICO">Certificado Académico</option>
                      <option value="DOCUMENTO_IDENTIDAD">Documento de Identidad</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nombre / Descripción</label>
                    <Input value={docNombre} onChange={e => setDocNombre(e.target.value)} required placeholder="Ej. Diploma Pregrado" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Archivo o Enlace</label>
                      <div className="flex bg-slate-100 p-1 rounded-md">
                        <button
                          type="button"
                          onClick={() => setUploadMode("file")}
                          className={`px-3 py-1 text-xs font-medium rounded ${uploadMode === "file" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"}`}
                        >
                          Subir Archivo
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadMode("url")}
                          className={`px-3 py-1 text-xs font-medium rounded ${uploadMode === "url" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"}`}
                        >
                          Pegar Enlace
                        </button>
                      </div>
                    </div>
                    {uploadMode === "file" ? (
                      <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required className="cursor-pointer file:text-indigo-700 file:bg-indigo-50 file:border-0 file:rounded-md file:px-4 file:py-1 hover:file:bg-indigo-100 transition-colors" />
                    ) : (
                      <Input value={docUrl} onChange={e => setDocUrl(e.target.value)} required placeholder="https://..." />
                    )}
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">Guardar Documento</Button>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <div className="p-4 text-sm text-gray-500">Cargando...</div> : documentos.length === 0 ? (
              <div className="col-span-full p-8 text-center border-2 border-dashed rounded-xl text-gray-400">
                Aún no has subido ningún documento.
              </div>
            ) : documentos.map(doc => (
              <div key={doc.id} className="border rounded-lg p-4 flex items-start justify-between hover:shadow-md transition-shadow bg-gray-50/50">
                <div className="flex gap-3">
                  <div className="bg-white p-2 border rounded-lg shadow-sm h-fit">
                    {renderIcon(doc.tipoDocumento)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm line-clamp-1" title={doc.nombre}>{doc.nombre}</h4>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{doc.tipoDocumento}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Subido el {new Date(doc.creadoEn).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <a href={doc.urlArchivo} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                    <Download size={16} />
                  </a>
                  {doc.tipoDocumento !== "CONTRATO" && (
                    <button onClick={() => handleDeleteDoc(doc.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent active={activeTab === "cartas"} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">Solicita cartas laborales o de salario para trámites personales.</p>
            <Button size="sm" onClick={() => { 
              setEditingSolId(null); 
              setSolMotivo(""); 
              setSolDirigido(""); 
              setOpenSol(true); 
            }}>
              <PlusCircle size={16} className="mr-2" /> Nueva Solicitud
            </Button>
          </div>

          {openSol && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                <button onClick={() => setOpenSol(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><XCircle size={20}/></button>
                <h2 className="text-lg font-bold mb-4">{editingSolId ? "Editar Solicitud" : "Solicitar Carta"}</h2>
                <form onSubmit={handleSolicitarCarta} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Tipo de Carta</label>
                    <select className="w-full border rounded-md p-2 mt-1" value={solTipo} onChange={e => setSolTipo(e.target.value)}>
                      <option value="LABORAL">Laboral / Certificación de Tiempo</option>
                      <option value="SALARIO">Desprendible / Certificado Salarial</option>
                      <option value="OTRA">Otra</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Dirigido a (Opcional)</label>
                    <Input value={solDirigido} onChange={e => setSolDirigido(e.target.value)} placeholder="Ej. A quien interese, Banco X..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Motivo / Observación</label>
                    <textarea className="w-full border rounded-md p-2 mt-1 text-sm" rows={3} value={solMotivo} onChange={e => setSolMotivo(e.target.value)} placeholder="Detalle adicional..." />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {editingSolId ? "Guardar Cambios" : "Enviar Solicitud"}
                  </Button>
                </form>
              </div>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Tipo de Carta</th>
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
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">No has realizado solicitudes.</td></tr>
                ) : (
                  solicitudes.map(sol => (
                    <tr key={sol.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{new Date(sol.creadoEn).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{sol.tipoCarta}</td>
                      <td className="px-4 py-3 text-gray-600">{sol.dirigidoA || "A quien interese"}</td>
                      <td className="px-4 py-3">
                        {sol.estado === "PENDIENTE" && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium"><Clock size={12}/> Pendiente</span>}
                        {sol.estado === "GENERADA" && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium"><CheckCircle size={12}/> Generada</span>}
                        {sol.estado === "RECHAZADA" && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium"><XCircle size={12}/> Rechazada</span>}
                      </td>
                      <td className="px-4 py-3">
                        {sol.urlCarta ? (
                          <a href={sol.urlCarta} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-semibold">
                            Descargar
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
