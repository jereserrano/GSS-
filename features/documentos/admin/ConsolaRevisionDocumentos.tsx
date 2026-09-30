"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Filter, ChevronRight, FileText, Download, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ConsolaRevisionDocumentos() {
  const [instructores, setInstructores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("TODOS");
  
  // Sheet State
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  const [instructorDetails, setInstructorDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchInstructores();
  }, []);

  const fetchInstructores = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documentos/admin");
      const json = await res.json();
      if (json.success) setInstructores(json.data);
    } catch (e) {
      toast.error("Error al cargar instructores");
    }
    setLoading(false);
  };

  const handleSelectInstructor = async (id: string) => {
    setSelectedInstructorId(id);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/documentos/admin/${id}`);
      const json = await res.json();
      if (json.success) setInstructorDetails(json.data);
    } catch (e) {
      toast.error("Error al cargar detalles");
    }
    setLoadingDetails(false);
  };

  const filtered = instructores.filter(i => {
    const nombre = i.nombre || "";
    const cedula = i.cedula || "";
    const matchesSearch = nombre.toLowerCase().includes(searchTerm.toLowerCase()) || cedula.includes(searchTerm);
    const matchesEstado = filterEstado === "TODOS" || i.estadoDocumentacion === filterEstado;
    return matchesSearch && matchesEstado;
  });

  return (
    <div className="flex gap-6 relative h-[600px] overflow-hidden">
      {/* Left Side: Data Table */}
      <div className={`flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-[#00304D]/10 overflow-hidden transition-all duration-300 ${selectedInstructorId ? 'w-1/2' : 'w-full'}`}>
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar por cédula o nombre..." 
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="flex items-center px-4 py-2 bg-slate-100 rounded-md text-sm text-[#00304D] font-medium hover:bg-slate-200 transition-colors focus:outline-none cursor-pointer"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="Completo">Completos</option>
            <option value="Incompleto">Incompletos</option>
            <option value="Sin Iniciar">Sin Iniciar</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 animate-pulse">Cargando datos...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3">Instructor</th>
                  <th className="px-6 py-3 text-center">Progreso</th>
                  <th className="px-6 py-3 text-center">Estado</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inst => (
                  <tr 
                    key={inst.id} 
                    className={`border-b hover:bg-slate-50 cursor-pointer transition-colors ${selectedInstructorId === inst.id ? 'bg-slate-50 border-l-4 border-l-[#39A900]' : 'border-l-4 border-l-transparent'}`}
                    onClick={() => handleSelectInstructor(inst.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#00304D]">{inst.nombre}</div>
                      <div className="text-gray-500 text-xs">CC: {inst.cedula}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-semibold mb-1">{inst.documentosSubidos} / {inst.documentosRequeridos}</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#39A900]" style={{ width: `${(inst.documentosSubidos/inst.documentosRequeridos)*100}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        inst.estadoDocumentacion === 'Completo' ? 'bg-green-100 text-green-700' :
                        inst.estadoDocumentacion === 'Sin Iniciar' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {inst.estadoDocumentacion}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="h-4 w-4 text-gray-400 inline" />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-500">No se encontraron instructores</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right Side: Detail Sheet / Panel */}
      {selectedInstructorId && (
        <div className="w-1/2 bg-white rounded-xl shadow-sm border border-[#00304D]/10 overflow-hidden flex flex-col animate-in slide-in-from-right-4 duration-300">
          {loadingDetails || !instructorDetails ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 animate-pulse">
              Cargando portafolio...
            </div>
          ) : (
            <>
              <div className="p-6 border-b bg-slate-50 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-[#00304D]">{instructorDetails.nombres} {instructorDetails.apellidos}</h2>
                  <p className="text-sm text-gray-500 mt-1">CC: {instructorDetails.cedula} | {instructorDetails.email}</p>
                </div>
                <button onClick={() => setSelectedInstructorId(null)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                {/* Datos Personales */}
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Datos Personales</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-gray-500 text-xs">Dirección</span>
                      <span className="font-medium text-[#00304D]">{instructorDetails.direccionResidencia || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs">Municipio</span>
                      <span className="font-medium text-[#00304D]">{instructorDetails.municipioResidencia || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs">Teléfono</span>
                      <span className="font-medium text-[#00304D]">{instructorDetails.telefono || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs">EPS</span>
                      <span className="font-medium text-[#00304D]">{instructorDetails.eps || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Documentos */}
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Documentos Subidos</h3>
                  <div className="space-y-3">
                    {instructorDetails.documentos.length > 0 ? instructorDetails.documentos.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-[#39A900] mr-3" />
                          <div>
                            <p className="text-sm font-medium text-[#00304D]">{doc.tipoDocumento.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-gray-500">{new Date(doc.creadoEn).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <a href={doc.urlArchivo} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-[#00304D] bg-slate-100 rounded-md">
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500 italic">No ha subido documentos.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Dummy icon for close
function XCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
    </svg>
  )
}
