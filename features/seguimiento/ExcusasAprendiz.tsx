"use client";

import React, { useEffect, useState } from "react";
import { getExcusasPorRolAction, crearExcusaAction, apelarExcusaAction, getDestinatariosExcusaAction } from "@/actions/excusas.actions";
import { toast } from "sonner";
import { PlusCircle, FileText, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ExcusasAprendiz() {
  const [excusas, setExcusas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [motivo, setMotivo] = useState("Médica");
  const [descripcion, setDescripcion] = useState("");
  const [archivoUrl, setArchivoUrl] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Estado para la apelación
  const [apelarExcusaId, setApelarExcusaId] = useState<string | null>(null);
  const [apelacionTexto, setApelacionTexto] = useState("");
  const [submittingApelacion, setSubmittingApelacion] = useState(false);

  // Destinatarios
  const [destinatarios, setDestinatarios] = useState<any[]>([]);
  const [destinatarioId, setDestinatarioId] = useState("TODOS");

  useEffect(() => {
    loadExcusas();
    loadDestinatarios();
  }, []);

  const loadDestinatarios = async () => {
    const res = await getDestinatariosExcusaAction();
    if (res.success) setDestinatarios(res.data || []);
  };

  const loadExcusas = async () => {
    setLoading(true);
    const res = await getExcusasPorRolAction();
    if (res.success) {
      setExcusas(res.data || []);
    } else {
      toast.error("Error al cargar excusas.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await crearExcusaAction({
      motivo,
      descripcion,
      archivoUrl,
      fechaInicio,
      fechaFin,
      destinatarioId,
    });

    if (res.success) {
      toast.success("Excusa enviada exitosamente.");
      setOpen(false);
      loadExcusas();
      // Limpiar
      setDescripcion("");
      setArchivoUrl("");
      setFechaInicio("");
      setFechaFin("");
    } else {
      toast.error(res.error || "Error al enviar la excusa.");
    }
    setSubmitting(false);
  };

  const handleApelar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apelarExcusaId) return;
    setSubmittingApelacion(true);
    const res = await apelarExcusaAction(apelarExcusaId, apelacionTexto);
    if (res.success) {
      toast.success("Apelación enviada correctamente.");
      setApelarExcusaId(null);
      setApelacionTexto("");
      loadExcusas();
    } else {
      toast.error(res.error || "Error al apelar.");
    }
    setSubmittingApelacion(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800">Historial de Excusas</h2>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <PlusCircle size={18} />
          Radicar Excusa
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><XCircle size={20}/></button>
            <h2 className="text-lg font-bold mb-4">Radicar Nueva Excusa</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Motivo</label>
                <select 
                  className="w-full mt-1 border rounded-md p-2 text-sm"
                  value={motivo} 
                  onChange={e => setMotivo(e.target.value)}
                >
                  <option value="Médica">Médica</option>
                  <option value="Calamidad Doméstica">Calamidad Doméstica</option>
                  <option value="Laboral">Laboral</option>
                  <option value="Fuerza Mayor">Fuerza Mayor</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <textarea 
                  className="w-full mt-1 border rounded-md p-2 text-sm"
                  rows={3}
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Detalle brevemente el motivo..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Desde (Fecha y Hora)</label>
                  <Input 
                    type="datetime-local"
                    className="mt-1"
                    value={fechaInicio}
                    onChange={e => setFechaInicio(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Hasta (Fecha y Hora)</label>
                  <Input 
                    type="datetime-local"
                    className="mt-1"
                    value={fechaFin}
                    onChange={e => setFechaFin(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Destinatario / Quien recibe</label>
                <select
                  className="w-full mt-1 border-gray-200 rounded-md shadow-sm text-sm p-2 bg-white"
                  value={destinatarioId}
                  onChange={e => setDestinatarioId(e.target.value)}
                >
                  <option value="TODOS">Todos (Coordinación e Instructores)</option>
                  {destinatarios.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Soporte (PDF, Imagen)
                  <span className="ml-1 text-xs text-gray-400 font-normal">(Opcional)</span>
                </label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        const formData = new FormData();
                        formData.append("file", file);
                        
                        try {
                          const res = await fetch("/api/upload", { method: "POST", body: formData });
                          const data = await res.json();
                          if (data.success) {
                            setArchivoUrl(data.url);
                          } else {
                            toast.error("Error al subir archivo");
                          }
                        } catch (err) {
                          toast.error("Fallo la subida");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-dashed justify-start text-gray-500 pointer-events-none"
                    >
                      <FileText size={16} className="mr-2" />
                      {archivoUrl ? "Archivo Adjunto Cargado" : "Seleccionar o arrastrar archivo..."}
                    </Button>
                  </div>
                  {archivoUrl && (
                    <Button type="button" variant="ghost" onClick={() => setArchivoUrl("")}>
                      <XCircle size={16} className="text-red-500" />
                    </Button>
                  )}
                </div>
                {archivoUrl && <p className="text-xs text-blue-500 mt-1 truncate">{archivoUrl}</p>}
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Enviando..." : "Enviar Excusa"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Apelación */}
      {apelarExcusaId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setApelarExcusaId(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><XCircle size={20}/></button>
            <h2 className="text-lg font-bold mb-4">Apelar Excusa Rechazada</h2>
            <form onSubmit={handleApelar} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Argumento de la Apelación</label>
                <textarea 
                  className="w-full mt-1 border rounded-md p-2 text-sm"
                  rows={4}
                  value={apelacionTexto}
                  onChange={e => setApelacionTexto(e.target.value)}
                  placeholder="Explica por qué consideras que la excusa debe ser reevaluada..."
                  required
                />
              </div>
              <Button type="submit" disabled={submittingApelacion} className="w-full bg-amber-600 hover:bg-amber-700">
                {submittingApelacion ? "Enviando..." : "Enviar Apelación"}
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Fecha Radicación</th>
              <th className="px-4 py-3 font-medium text-gray-600">Motivo</th>
              <th className="px-4 py-3 font-medium text-gray-600">Descripción</th>
              <th className="px-4 py-3 font-medium text-gray-600">Fechas</th>
              <th className="px-4 py-3 font-medium text-gray-600">Soporte</th>
              <th className="px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3 font-medium text-gray-600">Respuesta Instructor</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Cargando...</td></tr>
            ) : excusas.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No tienes excusas radicadas.</td></tr>
            ) : (
              excusas.map((ex) => (
                <tr key={ex.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">{new Date(ex.fecha).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium">{ex.motivo}</td>
                  <td className="px-4 py-3 truncate max-w-[150px]" title={ex.descripcion}>{ex.descripcion}</td>
                  <td className="px-4 py-3 text-xs">
                    {ex.fechaInicio && new Date(ex.fechaInicio).toLocaleDateString()} <br/>
                    al <br/>
                    {ex.fechaFin && new Date(ex.fechaFin).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {ex.archivoUrl ? (
                      <a href={ex.archivoUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        <FileText size={14} /> Abrir
                      </a>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {ex.estado === "PENDIENTE" && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium"><Clock size={12}/> Pendiente</span>}
                    {ex.estado === "APROBADA" && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium"><CheckCircle size={12}/> Aprobada</span>}
                    {ex.estado === "RECHAZADA" && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium"><XCircle size={12}/> Rechazada</span>}
                    {ex.estado === "APELADA" && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium"><AlertTriangle size={12}/> Apelada</span>}
                  </td>
                  <td className="px-4 py-3">
                    {ex.observacionInstructor ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-gray-500">{ex.instructorRevisor?.user?.nombre} respondió:</span>
                          <span className="text-sm truncate max-w-[150px]" title={ex.observacionInstructor}>{ex.observacionInstructor}</span>
                        </div>
                        {ex.estado === "RECHAZADA" && (
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setApelarExcusaId(ex.id)}>
                            Apelar
                          </Button>
                        )}
                        {ex.apelacionRespuesta && (
                          <div className="flex flex-col gap-1 mt-1 border-t pt-1">
                            <span className="text-[11px] font-bold text-purple-500">Respuesta a Apelación:</span>
                            <span className="text-sm truncate max-w-[150px]" title={ex.apelacionRespuesta}>{ex.apelacionRespuesta}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Sin respuesta aún</span>
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
