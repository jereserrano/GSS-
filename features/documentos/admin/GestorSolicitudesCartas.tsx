"use client";

import React, { useEffect, useState } from "react";
import { getTodasSolicitudesCartasAction, actualizarSolicitudCartaAction } from "@/actions/documentos.actions";
import { toast } from "sonner";
import { FileText, UploadCloud, CheckCircle, Clock, Search, XCircle, Printer, Zap, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";

export function GestorSolicitudesCartas() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedSol, setSelectedSol] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [file, setFile] = useState<File | null>(null);
  const [docUrl, setDocUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data: session } = useSession();

  const [openFirmaModal, setOpenFirmaModal] = useState(false);
  const [firmaFile, setFirmaFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const res = await getTodasSolicitudesCartasAction();
    if (res.success) setSolicitudes(res.data || []);
    setLoading(false);
  };

  const handleCompletar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSol) return;
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

    const res = await actualizarSolicitudCartaAction(selectedSol.id, {
      estado: "GENERADA",
      urlCarta: finalUrl,
    });

    if (res.success) {
      toast.success("Carta enviada exitosamente al instructor");
      setOpenModal(false);
      setFile(null);
      setDocUrl("");
      loadData();
    } else {
      toast.error(res.error || "Error al completar solicitud");
    }
    setSubmitting(false);
  };

  const handleGenerarAuto = async (sol: any) => {
    if (!confirm("¿Deseas generar la carta automáticamente con tu firma digital y enviarla al portal del instructor?")) return;
    
    setSubmitting(true);
    const finalUrl = `/api/cartas/${sol.id}`;
    const res = await actualizarSolicitudCartaAction(sol.id, {
      estado: "GENERADA",
      urlCarta: finalUrl,
    });

    if (res.success) {
      toast.success("Carta generada y enviada automáticamente");
      loadData();
    } else {
      toast.error(res.error || "Error al generar carta");
    }
    setSubmitting(false);
  };

  const handleSubirFirma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firmaFile || !session?.user?.id) return;
    setSubmitting(true);
    try {
      const fileData = new FormData();
      fileData.append("file", firmaFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fileData });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error || "Error al subir firma");
      
      const res = await fetch("/api/auth/session"); // Refresh o action
      const { updateFirmaDigitalAction } = await import("@/actions/documentos.actions");
      const actionRes = await updateFirmaDigitalAction(session.user.id, uploadJson.url);
      
      if (actionRes.success) {
        toast.success("Firma digital actualizada correctamente");
        setOpenFirmaModal(false);
        setFirmaFile(null);
      } else {
        toast.error("Error al actualizar la firma");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  const handlePrint = (sol: any) => {
    // Generate a printable HTML view in a new window
    const win = window.open("", "_blank");
    if (!win) return;
    
    const fechaActual = new Date().toLocaleDateString("es-CO", { year: 'numeric', month: 'long', day: 'numeric' });
    
    win.document.write(`
      <html>
        <head>
          <title>Carta - ${sol.user.nombre}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #39A900; padding-bottom: 20px; }
            .logo { max-width: 150px; }
            .content { margin-top: 40px; text-align: justify; }
            .signature { margin-top: 80px; }
            .footer { margin-top: 50px; font-size: 10px; color: #777; text-align: center; border-top: 1px solid #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="color: #39A900;">SERVICIO NACIONAL DE APRENDIZAJE - SENA</h2>
            <h3>CARTA ${sol.tipoCarta === "SALARIO" ? "DE SALARIO" : "LABORAL"}</h3>
          </div>
          
          <div class="content">
            <p><strong>FECHA:</strong> ${fechaActual}</p>
            <p><strong>A QUIEN INTERESE: ${sol.dirigidoA ? sol.dirigidoA.toUpperCase() : "A QUIEN CORRESPONDA"}</strong></p>
            <br/>
            <p>El suscrito Coordinador Académico del Centro de Formación, hace constar que:</p>
            <p>El(la) señor(a) <strong>${(sol.user.nombre || "________________").toUpperCase()}</strong>, identificado(a) con documento número <strong>${sol.user.instructor?.numeroDocumento || "________________"}</strong>, se encuentra actualmente prestando servicios como Instructor(a) en los programas de Articulación con la Media Técnica.</p>
            
            ${sol.motivo ? `<p><strong>Motivo de la solicitud:</strong> ${sol.motivo}</p>` : ""}
            
            <p>La presente constancia se expide a solicitud del interesado.</p>
          </div>
          
          <div class="signature">
            <p>___________________________________</p>
            <p><strong>Firma Autorizada</strong></p>
            <p>Coordinación Académica</p>
          </div>
          
          <div class="footer">
            Generado automáticamente por GSS Media Técnica - Proyecto Académico SENA
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const filtered = solicitudes.filter(s => 
    s.user?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.user?.instructor?.numeroDocumento?.includes(searchTerm) ||
    s.tipoCarta.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Solicitudes de Cartas ({solicitudes.length})</h2>
          <p className="text-sm text-gray-500">Gestiona las cartas solicitadas por los instructores.</p>
        </div>
        <div className="flex gap-4 items-center">
          <Button variant="outline" size="sm" onClick={() => setOpenFirmaModal(true)}>
            <Settings size={14} className="mr-1" /> Configurar Mi Firma Digital
          </Button>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar solicitud..." 
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3">Instructor</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Dirigido a</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">No hay solicitudes encontradas</td>
              </tr>
            ) : filtered.map(sol => (
              <tr key={sol.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {sol.user?.nombre || "Sin nombre"}
                  <div className="text-xs text-gray-500">{sol.user?.instructor?.numeroDocumento || "Sin documento"}</div>
                </td>
                <td className="px-4 py-3">{sol.tipoCarta}</td>
                <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]">{sol.dirigidoA || "A quien interese"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1 ${
                    sol.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {sol.estado === 'PENDIENTE' ? <Clock size={12}/> : <CheckCircle size={12}/>}
                    {sol.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(sol.creadoEn).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => handlePrint(sol)}>
                      <Printer size={14} className="mr-1" /> Imprimir
                    </Button>
                    {sol.estado === "PENDIENTE" && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleGenerarAuto(sol)}>
                          <Zap size={14} className="mr-1" /> Generar
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => { setSelectedSol(sol); setOpenModal(true); }}>
                          <UploadCloud size={14} className="mr-1" /> Manual
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openModal && selectedSol && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setOpenModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><XCircle size={20}/></button>
            <h2 className="text-lg font-bold mb-1">Enviar Carta Firmada</h2>
            <p className="text-sm text-gray-500 mb-4">Sube el documento firmado para enviárselo a {selectedSol.user?.nombre}.</p>
            
            <form onSubmit={handleCompletar} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Archivo o Enlace</label>
                  <div className="flex bg-slate-100 p-1 rounded-md">
                    <button
                      type="button"
                      onClick={() => setUploadMode("file")}
                      className={`px-3 py-1 text-xs font-medium rounded ${uploadMode === "file" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"}`}
                    >
                      Subir PDF
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
              <Button type="submit" disabled={submitting} className="w-full">Completar Solicitud y Notificar</Button>
            </form>
          </div>
        </div>
      )}

      {openFirmaModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setOpenFirmaModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><XCircle size={20}/></button>
            <h2 className="text-lg font-bold mb-1">Configurar Firma Digital</h2>
            <p className="text-sm text-gray-500 mb-4">Sube una imagen de tu firma digital. Esta se inyectará automáticamente cuando uses la opción "Generar Automáticamente".</p>
            
            <form onSubmit={handleSubirFirma} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sube tu firma (PNG sin fondo recomendado)</label>
                <Input type="file" accept="image/*" onChange={(e) => setFirmaFile(e.target.files?.[0] || null)} required className="cursor-pointer file:text-indigo-700 file:bg-indigo-50 file:border-0 file:rounded-md file:px-4 file:py-1 hover:file:bg-indigo-100 transition-colors" />
              </div>
              <Button type="submit" disabled={submitting || !firmaFile} className="w-full bg-indigo-600 hover:bg-indigo-700">Guardar Firma</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
