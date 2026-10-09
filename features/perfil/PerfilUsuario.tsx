"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { User, FileText, CheckCircle, Clock, XCircle, Save, UploadCloud, GraduationCap, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";

export function PerfilUsuario({ userId, role }: { userId: string; role: string }) {
  const { update } = useSession();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "datos";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [datos, setDatos] = useState<any>({});

  // Para las cartas de aprendices
  const [cartas, setCartas] = useState<any[]>([]);
  const [solicitandoCarta, setSolicitandoCarta] = useState(false);

  // Modal Solicitudes
  const [openSol, setOpenSol] = useState(false);
  const [solTipo, setSolTipo] = useState("CERTIFICADO_ESTUDIO");
  const [solMotivo, setSolMotivo] = useState("");
  const [solDirigido, setSolDirigido] = useState("");

  const TIPOS_CERTIFICADO = [
    { value: "CERTIFICADO_ESTUDIO", label: "Certificado de Estudio", descripcion: "Acredita que te encuentras activo en el proceso de formación." },
    { value: "CERTIFICADO_ESTUDIO_NOTAS", label: "Certificado de Estudio con Notas", descripcion: "Incluye el detalle de tus calificaciones y juicios evaluativos agrupados por competencia." },
  ];

  const isAprendiz = role.toUpperCase().includes("APRENDIZ");

  useEffect(() => {
    if (searchParams.get("success") === "zoom_linked") {
      toast.success("Cuenta de Zoom vinculada exitosamente.");
    } else if (searchParams.get("error")) {
      toast.error("Error al vincular cuenta de Zoom.");
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchDatos = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/perfil");
        const json = await res.json();
        if (json.success) setDatos(json.data);

        if (isAprendiz) {
          const resCartas = await fetch("/api/cartas");
          const jsonCartas = await resCartas.json();
          if (jsonCartas.success) setCartas(jsonCartas.data);
        }
      } catch (e) {
        toast.error("Error al cargar datos");
      }
      setLoading(false);
    };
    fetchDatos();
  }, [isAprendiz]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Datos guardados correctamente");
        if (datos.fotoPerfil !== undefined) {
          await update({ fotoPerfil: datos.fotoPerfil });
        }
      } else {
        toast.error(json.error);
      }
    } catch (e) {
      toast.error("Error al guardar");
    }
    setSaving(false);
  };

  const handleSolicitarCarta = async (e: React.FormEvent) => {
    e.preventDefault();
    setSolicitandoCarta(true);
    try {
      const res = await fetch("/api/cartas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoCarta: solTipo,
          motivo: solMotivo,
          dirigidoA: solDirigido,
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Solicitud enviada correctamente");
        setCartas([json.data, ...cartas]);
        setOpenSol(false);
        setSolMotivo("");
        setSolDirigido("");
        setSolTipo("CERTIFICADO_ESTUDIO");
      } else {
        toast.error(json.error || "Error al solicitar");
      }
    } catch (e) {
      toast.error("Error de conexión");
    }
    setSolicitandoCarta(false);
  };

  const tipoInfo = TIPOS_CERTIFICADO.find(t => t.value === solTipo);

  const handleEmojiSelect = (emoji: string) => {
    setDatos({ ...datos, fotoPerfil: emoji });
  };

  // Tabla de emojis populares
  const emojisList = ["👨‍🏫", "👩‍🏫", "👨‍💻", "👩‍💻", "🎓", "💼", "🧠", "💡", "🚀", "🌟", "📚", "🐱", "🐶", "🦁", "🦊", "🐼", "😎", "🤓", "😊", "🧐"];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#00304D]/10">
      <div className="flex space-x-4 mb-6 border-b pb-2">
        <button
          className={`flex items-center pb-2 px-1 border-b-2 font-medium transition-colors ${activeTab === 'datos' ? 'border-[#39A900] text-[#00304D]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab("datos")}
        >
          <User className="mr-2 h-4 w-4" /> Datos Personales
        </button>
        {isAprendiz && (
          <button
            className={`flex items-center pb-2 px-1 border-b-2 font-medium transition-colors ${activeTab === 'tramites' ? 'border-[#39A900] text-[#00304D]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab("tramites")}
          >
            <FileText className="mr-2 h-4 w-4" /> Solicitudes y Trámites
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500 animate-pulse">Cargando perfil...</div>
      ) : activeTab === "datos" ? (
        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in">
          {/* Avatar (Sólo editable para NO aprendices) */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b pb-6">
            <div className="h-24 w-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
              {datos.fotoPerfil ? (
                datos.fotoPerfil.startsWith("/") || datos.fotoPerfil.startsWith("http") || datos.fotoPerfil.startsWith("data:") ? (
                  <img src={datos.fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl leading-none">{datos.fotoPerfil}</span>
                )
              ) : (
                <User size={40} className="text-slate-400" />
              )}
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div>
                <h3 className="font-semibold text-lg">{datos.nombre || (datos.nombres + " " + datos.apellidos)}</h3>
                <p className="text-sm text-text-secondary">{datos.email}</p>
                <Badge variant="outline" className="mt-2 bg-slate-50">{role}</Badge>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-sm font-medium mb-3">Foto de Perfil o Emoticono</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {emojisList.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => handleEmojiSelect(e)}
                      className={`text-2xl p-2 rounded-lg hover:bg-slate-200 transition-colors ${datos.fotoPerfil === e ? 'bg-[#39A900]/20 ring-2 ring-[#39A900]' : 'bg-white border'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-slate-500 block mb-1">O escribe cualquier otro emoticon:</label>
                    <Input
                      value={!datos.fotoPerfil?.startsWith("http") && !datos.fotoPerfil?.startsWith("/") && !datos.fotoPerfil?.startsWith("data:") ? datos.fotoPerfil : ""}
                      onChange={(e) => setDatos({ ...datos, fotoPerfil: e.target.value })}
                      placeholder="Ej: 🚀"
                      className="w-32 bg-white"
                      maxLength={5}
                    />
                  </div>

                  <div className="flex-1">
                    <label className="text-xs font-medium text-slate-500 block mb-1">O sube una imagen desde tu dispositivo:</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // Validar tamaño (máximo 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error("La imagen es muy pesada. Máximo 5MB.");
                            return;
                          }

                          const formData = new FormData();
                          formData.append("file", file);
                          const toastId = toast.loading("Subiendo imagen...");
                          try {
                            const res = await fetch("/api/upload", { method: "POST", body: formData });

                            const textResponse = await res.text();

                            if (!res.ok) {
                              console.error("Upload error response:", textResponse);
                              toast.error(`Error del servidor (${res.status})`, { id: toastId });
                              return;
                            }

                            try {
                              const result = JSON.parse(textResponse);
                              if (result.success) {
                                setDatos({ ...datos, fotoPerfil: result.url });
                                toast.success("Imagen subida", { id: toastId });
                              } else {
                                toast.error(result.error || "Error al subir", { id: toastId });
                              }
                            } catch (e) {
                              toast.error("El servidor no respondió correctamente", { id: toastId });
                            }
                          } catch (error: any) {
                            toast.error(`Error de conexión: ${error.message}`, { id: toastId });
                          }
                        }}
                        className="max-w-[250px] bg-white text-xs file:bg-slate-100 file:text-slate-700 file:border-0 file:rounded-md file:px-3 file:py-1 hover:file:bg-slate-200 cursor-pointer"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => setDatos({ ...datos, fotoPerfil: "" })} className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                        <XCircle size={14} className="mr-1" /> Quitar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre Completo</label>
              <Input
                value={datos.nombre || (datos.nombres + " " + datos.apellidos) || ""}
                readOnly
                className="bg-slate-50 opacity-80 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Correo Electrónico</label>
              <Input
                value={datos.email || ""}
                readOnly
                className="bg-slate-50 opacity-80 cursor-not-allowed"
              />
            </div>
            {isAprendiz && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ficha / Grupo</label>
                  <Input value={datos.ficha || ""} readOnly className="bg-slate-50 opacity-80 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Programa de Formación</label>
                  <Input value={datos.programa || ""} readOnly className="bg-slate-50 opacity-80 cursor-not-allowed" />
                </div>
              </>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono</label>
              <Input
                value={datos.telefono || ""}
                onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
                placeholder="Ej: 300 123 4567"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={saving} className="bg-[#39A900] hover:bg-[#267000]">
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>

          {!isAprendiz && (
            <div className="pt-8 mt-8 border-t border-slate-200">
              <h3 className="font-semibold text-lg mb-2">Integraciones</h3>
              <p className="text-sm text-slate-500 mb-4">
                Conecta tus cuentas institucionales para habilitar funciones avanzadas como la creación de clases virtuales.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border rounded-lg gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-[#2D8CFF] p-2 rounded-md text-white shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 6H4V16H14V6Z" fill="currentColor" />
                      <path d="M21 7L16 10V12L21 15V7Z" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Zoom</h4>
                    <p className="text-xs text-slate-500">Permite agendar clases virtuales automáticamente.</p>
                  </div>
                </div>

                {datos.zoomVinculado ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 py-1.5 px-3">
                      <CheckCircle className="w-4 h-4 mr-2" /> Vinculado
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={async () => {
                        const toastId = toast.loading("Desvinculando...");
                        try {
                          const res = await fetch("/api/auth/zoom/unlink", { method: "POST" });
                          if (res.ok) {
                            setDatos({ ...datos, zoomVinculado: false });
                            toast.success("Cuenta desvinculada", { id: toastId });
                          } else {
                            toast.error("Error al desvincular", { id: toastId });
                          }
                        } catch (e) {
                          toast.error("Error de conexión", { id: toastId });
                        }
                      }}
                    >
                      Desvincular
                    </Button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" className="text-[#2D8CFF] border-[#2D8CFF] hover:bg-[#2D8CFF]/10" onClick={() => window.location.href = "/api/auth/zoom"}>
                    Vincular Cuenta
                  </Button>
                )}
              </div>
            </div>
          )}
        </form>
      ) : activeTab === "tramites" ? (
        <div className="animate-in fade-in space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                <GraduationCap size={18} />
                Certificados de Estudio
              </h3>
              <p className="text-sm text-blue-800 mt-1">
                Puedes solicitar un certificado de estudio activo. La coordinación lo aprobará en los próximos 2 días hábiles.
              </p>
            </div>
            <Button
              onClick={() => {
                setSolMotivo("");
                setSolDirigido("");
                setSolTipo("CERTIFICADO_ESTUDIO");
                setOpenSol(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            >
              Solicitar Certificado
            </Button>
          </div>

          {/* Modal Nueva Solicitud */}
          {openSol && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                <button onClick={() => setOpenSol(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
                <h2 className="text-lg font-bold mb-4">Solicitar Certificado</h2>
                <form onSubmit={handleSolicitarCarta} className="space-y-4">
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
                  <Button type="submit" disabled={solicitandoCarta} className="w-full">
                    {solicitandoCarta ? "Solicitando..." : "Enviar Solicitud"}
                  </Button>
                </form>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-slate-800 mb-4">Mis Solicitudes</h4>
            {cartas.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border rounded-lg border-dashed bg-slate-50">
                No has realizado ninguna solicitud todavía.
              </div>
            ) : (
              <div className="space-y-3">
                {cartas.map((c: any) => (
                  <div key={c.id} className="flex justify-between items-center p-4 border rounded-lg hover:shadow-sm transition-all bg-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900">
                          {c.tipoCarta.replace("_", " ")}
                        </p>
                        <p className="text-xs text-slate-500">
                          Solicitado el {new Date(c.creadoEn).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      {c.estado === "PENDIENTE" ? (
                        <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200">En Trámite</Badge>
                      ) : c.estado === "GENERADA" ? (
                        <a href={c.urlCarta} target="_blank" rel="noreferrer">
                          <Badge className="bg-[#39A900] hover:bg-[#267000] cursor-pointer text-white">Descargar PDF</Badge>
                        </a>
                      ) : (
                        <Badge variant="destructive">Rechazada</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
