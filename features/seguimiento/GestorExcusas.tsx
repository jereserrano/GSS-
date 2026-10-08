"use client";

import React, { useEffect, useState } from "react";
import { getExcusasPorRolAction, responderExcusaAction, responderApelacionAction } from "@/actions/excusas.actions";
import { getFichasSelectAction } from "@/actions/fichas.actions";
import { toast } from "sonner";
import { FileText, CheckCircle, XCircle, Clock, Check, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
export function GestorExcusas({ canEdit }: { canEdit: boolean }) {
  const [excusas, setExcusas] = useState<any[]>([]);
  const [filteredExcusas, setFilteredExcusas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de revisión
  const [selectedExcusa, setSelectedExcusa] = useState<any>(null);
  const [decision, setDecision] = useState<"APROBADA" | "RECHAZADA">("APROBADA");
  const [observacion, setObservacion] = useState("");
  const [saving, setSaving] = useState(false);
  const [isApelacion, setIsApelacion] = useState(false);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [filtroFicha, setFiltroFicha] = useState("TODAS");
  const [fichasActivas, setFichasActivas] = useState<string[]>([]);

  useEffect(() => {
    loadExcusas();
    getFichasSelectAction().then(res => {
      if (res.success && res.data) {
        setFichasActivas(res.data.map(f => f.codigo));
      }
    });
  }, []);

  useEffect(() => {
    let result = excusas;
    if (filtroEstado !== "TODOS") {
      result = result.filter(ex => ex.estado === filtroEstado);
    }
    if (filtroFicha !== "TODAS") {
      result = result.filter(ex => ex.aprendiz?.ficha?.codigo === filtroFicha);
    }
    setFilteredExcusas(result);
  }, [excusas, filtroEstado, filtroFicha]);

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

  const handleActionClick = (excusa: any, isAprobada: boolean, apelacion: boolean = false) => {
    setSelectedExcusa(excusa);
    setDecision(isAprobada ? "APROBADA" : "RECHAZADA");
    setIsApelacion(apelacion);
    setObservacion("");
  };

  const handleUpdateEstado = async () => {
    if (!selectedExcusa) return;
    setSaving(true);
    let res;
    if (isApelacion) {
      res = await responderApelacionAction(selectedExcusa.id, decision, observacion);
    } else {
      res = await responderExcusaAction(selectedExcusa.id, decision, observacion);
    }
    if (res.success) {
      toast.success("Respuesta enviada y notificada al aprendiz.");
      setSelectedExcusa(null);
      loadExcusas();
    } else {
      toast.error(res.error || "Error al actualizar estado.");
    }
    setSaving(false);
  };

  // Obtener fichas únicas para el filtro
  const fichasExcusas = Array.from(new Set(excusas.map(ex => ex.aprendiz?.ficha?.codigo).filter(Boolean)));
  const fichasUnicas = fichasActivas.length > 0 ? Array.from(new Set([...fichasActivas, ...fichasExcusas])) : fichasExcusas;

  return (
    <div className="space-y-6">

      {/* EX-6: Dashboard de Métricas de Excusas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Excusas</p>
          <p className="text-3xl font-bold text-gray-800">{excusas.length}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 shadow-sm">
          <p className="text-sm text-orange-600 font-medium">Pendientes</p>
          <p className="text-3xl font-bold text-orange-700">
            {excusas.filter(e => e.estado === "PENDIENTE").length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
          <p className="text-sm text-green-600 font-medium">Aprobadas</p>
          <p className="text-3xl font-bold text-green-700">
            {excusas.filter(e => e.estado === "APROBADA").length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
          <p className="text-sm text-red-600 font-medium">Rechazadas</p>
          <p className="text-3xl font-bold text-red-700">
            {excusas.filter(e => e.estado === "RECHAZADA").length}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm border items-center">
        <h3 className="font-semibold text-gray-700 mr-4">Filtros:</h3>
        <div className="w-48">
          <select
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="APROBADA">Aprobadas</option>
            <option value="RECHAZADA">Rechazadas</option>
          </select>
        </div>
        <div className="w-48">
          <select
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={filtroFicha}
            onChange={(e) => setFiltroFicha(e.target.value)}
          >
            <option value="TODAS">Todas las Fichas</option>
            {fichasUnicas.map(ficha => (
              <option key={ficha} value={ficha}>{ficha}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Aprendiz</th>
              <th className="px-4 py-3 font-medium text-gray-600">Ficha</th>
              <th className="px-4 py-3 font-medium text-gray-600">Fecha radicación</th>
              <th className="px-4 py-3 font-medium text-gray-600">Fechas Incapacidad</th>
              <th className="px-4 py-3 font-medium text-gray-600">Motivo / Descripción</th>
              <th className="px-4 py-3 font-medium text-gray-600">Soporte</th>
              <th className="px-4 py-3 font-medium text-gray-600">Estado</th>
              {canEdit && <th className="px-4 py-3 font-medium text-gray-600 text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8">Cargando...</td></tr>
            ) : filteredExcusas.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-500">No hay excusas para mostrar.</td></tr>
            ) : (
              filteredExcusas.map((ex) => (
                <tr key={ex.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{ex.aprendiz?.nombres} {ex.aprendiz?.apellidos}</div>
                    <div className="text-xs text-gray-500">{ex.aprendiz?.numeroDocumento}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{ex.aprendiz?.ficha?.codigo}</td>
                  <td className="px-4 py-3 text-gray-700">{new Date(ex.fecha).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-xs">
                    {ex.fechaInicio && new Date(ex.fechaInicio).toLocaleDateString()} <br />
                    al <br />
                    {ex.fechaFin && new Date(ex.fechaFin).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{ex.motivo}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[150px]" title={ex.descripcion}>{ex.descripcion}</div>
                  </td>
                  <td className="px-4 py-3">
                    {ex.archivoUrl ? (
                      <a href={ex.archivoUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                        <FileText size={14} /> Ver
                      </a>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {ex.estado === "PENDIENTE" && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium"><Clock size={12} /> Pendiente</span>}
                    {ex.estado === "APROBADA" && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium"><CheckCircle size={12} /> Aprobada</span>}
                    {ex.estado === "RECHAZADA" && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium"><XCircle size={12} /> Rechazada</span>}
                    {ex.estado === "APELADA" && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium"><AlertTriangle size={12} /> Apelada</span>}
                  </td>

                  {canEdit && (
                    <td className="px-4 py-3 text-right">
                      {ex.estado === "PENDIENTE" ? (
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" className="h-8 border-green-200 text-green-700 hover:bg-green-50" onClick={() => handleActionClick(ex, true)}>
                            <Check size={14} className="mr-1" /> Aprobar
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 border-red-200 text-red-700 hover:bg-red-50" onClick={() => handleActionClick(ex, false)}>
                            <X size={14} className="mr-1" /> Rechazar
                          </Button>
                        </div>
                      ) : ex.estado === "APELADA" ? (
                        <div className="flex flex-col gap-2 justify-end">
                          <span className="text-xs text-purple-600 font-bold">Apelada: {ex.apelacion}</span>
                          <div className="flex gap-2 justify-end mt-1">
                            <Button variant="outline" size="sm" className="h-7 text-xs border-green-200 text-green-700 hover:bg-green-50" onClick={() => handleActionClick(ex, true, true)}>Aprobar</Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs border-red-200 text-red-700 hover:bg-red-50" onClick={() => handleActionClick(ex, false, true)}>Rechazar</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs flex flex-col items-end">
                          <span className="text-gray-500 font-medium">Respondida</span>
                          <span className="text-gray-400 truncate max-w-[120px]" title={ex.observacionInstructor}>{ex.observacionInstructor}</span>
                          {ex.apelacionRespuesta && <span className="text-purple-400 truncate max-w-[120px]" title={ex.apelacionRespuesta}>Apelación: {ex.apelacionRespuesta}</span>}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal Revisor */}
      {selectedExcusa && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setSelectedExcusa(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
            <h2 className="text-lg font-bold mb-1">
              {decision === "APROBADA" ? "Aprobar" : "Rechazar"} {isApelacion ? "Apelación" : "Excusa"}
            </h2>
            <p className="text-sm text-gray-500 mb-4">Aprendiz: {selectedExcusa.aprendiz?.nombres}</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Observaciones para el Aprendiz</label>
                <textarea
                  className="w-full mt-1 border rounded-md p-2 text-sm"
                  rows={4}
                  value={observacion}
                  onChange={e => setObservacion(e.target.value)}
                  placeholder="Detalla el motivo de la decisión (Esto le llegará como mensaje)..."
                  required
                />
              </div>

              <Button
                onClick={handleUpdateEstado}
                disabled={saving || !observacion.trim()}
                className={`w-full ${decision === "APROBADA" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {saving ? "Procesando..." : "Confirmar y Enviar Respuesta"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
