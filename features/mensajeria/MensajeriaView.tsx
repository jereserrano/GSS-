"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  getContactosDisponiblesAction,
  getMensajesAction,
  enviarMensajeAction,
  eliminarMensajeAction,
  eliminarConversacionAction,
  marcarConversacionLeidaAction,
  marcarGlobalLeidoAction,
  getLecturasGlobalAction,
  enviarMensajeMasivoAction,
} from "@/actions/mensajes.actions";
import { toast } from "sonner";
import {
  Send,
  Search,
  Megaphone,
  User,
  Clock,
  AlertCircle,
  ChevronDown,
  Trash2,
  X,
  MessageCircle,
  Filter,
  Settings,
  Paperclip,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
interface Contacto {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  etiqueta?: string;
  fichaId?: string | null;
  fichaCodigo?: string | null;
  programaId?: string | null;
  programaNombre?: string | null;
}

interface Mensaje {
  id: string;
  emisorId: string;
  receptorId?: string | null;
  esGlobal: boolean;
  contenido: string;
  leido: boolean;
  creadoEn: string | Date;
  emisor?: { id?: string; nombre: string; email: string; rol: string };
  receptor?: { id?: string; nombre: string; email: string; rol: string } | null;
  lecturasGlobales?: { userId: string }[];
  replyToId?: string | null;
  replyTo?: { id: string; contenido: string; emisor: { nombre: string } } | null;
  adjuntoUrl?: string | null;
}

// ─────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────
export function MensajeriaView({
  userId,
  isCoordinador,
  userRole,
}: {
  userId: string;
  isCoordinador: boolean;
  userRole?: string;
}) {
  // ── Estado de datos
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [mensajesGlobales, setMensajesGlobales] = useState<Mensaje[]>([]);
  const [mensajesDirectos, setMensajesDirectos] = useState<Mensaje[]>([]);
  // MS-1: mapa emisorId → cantidad de mensajes no leídos
  const [noLeidosPor, setNoLeidosPor] = useState<Record<string, number>>({});

  // ── Estado de filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroProgramaId, setFiltroProgramaId] = useState<string>("");
  const [filtroFichaId, setFiltroFichaId] = useState<string>("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // ── Estado de chat
  const [activeTab, setActiveTab] = useState<"GLOBAL" | string>("GLOBAL");
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [nuevoAdjuntoUrl, setNuevoAdjuntoUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Menú contextual y citar mensaje
  const [menuMensajeId, setMenuMensajeId] = useState<string | null>(null);
  const [mensajeCitado, setMensajeCitado] = useState<Mensaje | null>(null);

  // ── MS-6: Conteos de lectura global (solo coordinadores)
  const [lecturasGlobalesCount, setLecturasGlobalesCount] = useState<Record<string, number>>({});
  const [totalUsuariosActivos, setTotalUsuariosActivos] = useState(0);

  // ── MS-7: Mensaje masivo
  const [modoMasivo, setModoMasivo] = useState(false);
  const [segmentoMasivo, setSegmentoMasivo] = useState<"TODOS" | "APRENDICES" | "INSTRUCTORES" | "FICHA" | "PROGRAMA">("TODOS");
  const [segmentoFichaId, setSegmentoFichaId] = useState("");
  const [segmentoProgramaId, setSegmentoProgramaId] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // ─────────────────────────────────────────────
  // CARGA DE DATOS
  // ─────────────────────────────────────────────
  const loadData = useCallback(async () => {
    const [resContactos, resMensajes] = await Promise.all([
      getContactosDisponiblesAction(),
      getMensajesAction(),
    ]);

    if (resContactos.success) setContactos(resContactos.data || []);
    if (resMensajes.success) {
      setMensajesGlobales(resMensajes.data?.globales || []);
      setMensajesDirectos(resMensajes.data?.directos || []);
      // MS-1: guardar conteos de no leídos
      setNoLeidosPor(resMensajes.data?.noLeidosPor || {});

      // MS-6: Si es coordinador, cargar conteos de lectura global
      if (isCoordinador && resMensajes.data?.globales?.length) {
        const ids = resMensajes.data.globales.map((m: Mensaje) => m.id);
        getLecturasGlobalAction(ids).then((resLecturas) => {
          if (resLecturas.success) {
            setLecturasGlobalesCount(resLecturas.data.lecturasPor || {});
            setTotalUsuariosActivos(resLecturas.data.totalUsuarios || 0);
          }
        });
      }
    }
    setLoading(false);
  }, [isCoordinador]);

  // Carga inicial + polling cada 30s
  useEffect(() => {
    loadData();
    pollingRef.current = setInterval(loadData, 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [loadData]);

  // Scroll al fondo al cambiar de chat o llegar nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeTab, mensajesDirectos, mensajesGlobales]);

  // MS-6: Marcar como leídos los comunicados globales no leídos
  useEffect(() => {
    if (activeTab === "GLOBAL") {
      mensajesGlobales.forEach((msg) => {
        if (!msg.lecturasGlobales || msg.lecturasGlobales.length === 0) {
          marcarGlobalLeidoAction(msg.id).then(() => {
            // Mutar localmente para evitar infinitos loops de re-render si no recargamos de inmediato
            msg.lecturasGlobales = [{ userId }];
          });
        }
      });
    }
  }, [activeTab, mensajesGlobales, userId]);

  // ─────────────────────────────────────────────
  // DERIVACIONES: programas, fichas y filtros
  // ─────────────────────────────────────────────
  const programasDisponibles = React.useMemo(() => {
    const map = new Map<string, string>();
    contactos.forEach((c) => {
      if (c.programaId && c.programaNombre) map.set(c.programaId, c.programaNombre);
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [contactos]);

  const fichasDePrograma = React.useMemo(() => {
    if (!filtroProgramaId) return [];
    const map = new Map<string, string>();
    contactos.forEach((c) => {
      if (c.programaId === filtroProgramaId && c.fichaId && c.fichaCodigo)
        map.set(c.fichaId, c.fichaCodigo);
    });
    return Array.from(map.entries()).map(([id, codigo]) => ({ id, codigo }));
  }, [contactos, filtroProgramaId]);

  const contactosFiltrados = React.useMemo(() => {
    return contactos.filter((c) => {
      const matchBusqueda =
        !busqueda ||
        c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.etiqueta?.toLowerCase().includes(busqueda.toLowerCase());

      const matchPrograma = !filtroProgramaId || c.programaId === filtroProgramaId;
      const matchFicha = !filtroFichaId || c.fichaId === filtroFichaId;

      return matchBusqueda && matchPrograma && matchFicha;
    });
  }, [contactos, busqueda, filtroProgramaId, filtroFichaId]);

  // ─────────────────────────────────────────────
  // CHATS RECIENTES: personas con quienes se ha hablado
  // ─────────────────────────────────────────────
  const chatsRecientes = React.useMemo(() => {
    const chatMap = new Map<
      string,
      { contacto: Contacto | null; ultimoMensaje: Mensaje }
    >();

    // Ordenados ascendente → el último de cada conversación queda al final del map
    mensajesDirectos.forEach((msg) => {
      const otroId = msg.emisorId === userId ? msg.receptorId : msg.emisorId;
      if (!otroId) return;
      chatMap.set(otroId, {
        contacto: contactos.find((c) => c.id === otroId) || null,
        ultimoMensaje: msg,
      });
    });

    // Ordenar por fecha descendente (más reciente primero)
    return Array.from(chatMap.values()).sort(
      (a, b) =>
        new Date(b.ultimoMensaje.creadoEn).getTime() -
        new Date(a.ultimoMensaje.creadoEn).getTime()
    );
  }, [mensajesDirectos, contactos, userId]);

  // ─────────────────────────────────────────────
  // MENSAJES DEL CHAT ACTIVO
  // ─────────────────────────────────────────────
  const mensajesDelChat =
    activeTab === "GLOBAL"
      ? [...mensajesGlobales].reverse() // global viene desc, mostrar asc
      : mensajesDirectos.filter(
        (m) => m.emisorId === activeTab || m.receptorId === activeTab
      );

  let contactoActivo =
    activeTab !== "GLOBAL" ? contactos.find((c) => c.id === activeTab) : null;

  if (!contactoActivo && activeTab !== "GLOBAL" && mensajesDelChat.length > 0) {
    const msg = mensajesDelChat[0];
    const userRef = msg.emisorId === activeTab ? msg.emisor : msg.receptor;
    if (userRef) {
      contactoActivo = {
        id: activeTab,
        nombre: userRef.nombre || "Usuario",
        email: userRef.email || "",
        rol: userRef.rol || "",
      } as Contacto;
    }
  }

  // ─────────────────────────────────────────────
  // ENVIAR MENSAJE
  // ─────────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() && !nuevoAdjuntoUrl) return;

    // MS-7: Lógica para enviar mensaje masivo
    if (modoMasivo && activeTab !== "GLOBAL" && isCoordinador) {
      setSending(true);
      const res = await enviarMensajeMasivoAction({
        contenido: nuevoMensaje,
        segmento: segmentoMasivo,
        fichaId: segmentoFichaId,
        programaId: segmentoProgramaId,
      });
      if (res.success) {
        toast.success(`Mensaje masivo enviado a ${res.data?.enviados} personas.`);
        setNuevoMensaje("");
        setModoMasivo(false);
        await loadData();
      } else {
        toast.error(res.error || "Error al enviar mensaje masivo");
      }
      setSending(false);
      return;
    }

    setSending(true);
    const isGlobal = activeTab === "GLOBAL";
    const payload: { contenido: string; esGlobal: boolean; receptorId?: string; replyToId?: string; adjuntoUrl?: string } = {
      contenido: nuevoMensaje,
      esGlobal: isGlobal,
    };
    if (mensajeCitado?.id) payload.replyToId = mensajeCitado.id;
    if (nuevoAdjuntoUrl) payload.adjuntoUrl = nuevoAdjuntoUrl;
    if (!isGlobal) payload.receptorId = activeTab;

    const res = await enviarMensajeAction(payload);
    if (res.success) {
      setNuevoMensaje("");
      setNuevoAdjuntoUrl("");
      setMensajeCitado(null);
      await loadData();
    } else {
      toast.error(res.error || "Error al enviar mensaje");
    }
    setSending(false);
  };

  // ─────────────────────────────────────────────
  // ELIMINAR MENSAJE
  // ─────────────────────────────────────────────
  const handleEliminarMensaje = async (mensajeId: string) => {
    setMenuMensajeId(null);
    const res = await eliminarMensajeAction(mensajeId);
    if (res.success) {
      toast.success("Mensaje eliminado");
      await loadData();
    } else {
      toast.error(res.error || "No se pudo eliminar el mensaje");
    }
  };

  // ─────────────────────────────────────────────
  // ELIMINAR CONVERSACIÓN
  // ─────────────────────────────────────────────
  const handleEliminarConversacion = async (contactoId: string) => {
    const res = await eliminarConversacionAction(contactoId);
    if (res.success) {
      toast.success("Conversación eliminada");
      if (activeTab === contactoId) setActiveTab("GLOBAL");
      await loadData();
    } else {
      toast.error(res.error || "No se pudo eliminar la conversación");
    }
  };

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  const formatHora = (fecha: string | Date) =>
    new Date(fecha).toLocaleString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });

  const mostrarFiltroFichas =
    (userRole === "ADMINISTRADOR" ||
      userRole === "ADMIN" ||
      userRole === "COORDINADOR" ||
      userRole === "APOYO_COORDINACION" ||
      userRole === "INSTRUCTOR") &&
    programasDisponibles.length > 0;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="flex h-full min-h-[500px]" onClick={() => setMenuMensajeId(null)}>
      {/* ══════════════════ SIDEBAR ══════════════════ */}
      <div className="w-80 border-r bg-slate-50 flex flex-col">
        {/* ── Buscador + botón filtros */}
        <div className="p-3 border-b bg-white space-y-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contactos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-md text-sm border-none focus:ring-2 focus:ring-[#39A900] outline-none"
            />
          </div>

          {/* ── Botón "Filtros" (solo roles que tienen fichas) */}
          {mostrarFiltroFichas && (
            <button
              onClick={() => setMostrarFiltros((v) => !v)}
              className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-[#39A900] px-1 transition-colors"
            >
              <span className="flex items-center gap-1">
                <Filter size={12} />
                Filtrar por programa / ficha
              </span>
              <ChevronDown
                size={12}
                className={`transition-transform ${mostrarFiltros ? "rotate-180" : ""}`}
              />
            </button>
          )}

          {/* ── Panel de filtros */}
          {mostrarFiltros && mostrarFiltroFichas && (
            <div className="space-y-2 pt-1 border-t">
              {/* Selector Programa */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                  Programa
                </label>
                <select
                  value={filtroProgramaId}
                  onChange={(e) => {
                    setFiltroProgramaId(e.target.value);
                    setFiltroFichaId(""); // resetear ficha al cambiar programa
                  }}
                  className="w-full text-xs py-1.5 px-2 rounded-md bg-slate-100 border-none outline-none focus:ring-2 focus:ring-[#39A900]"
                >
                  <option value="">Todos los programas</option>
                  {programasDisponibles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector Ficha (solo si hay programa seleccionado) */}
              {filtroProgramaId && fichasDePrograma.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                    Ficha
                  </label>
                  <select
                    value={filtroFichaId}
                    onChange={(e) => setFiltroFichaId(e.target.value)}
                    className="w-full text-xs py-1.5 px-2 rounded-md bg-slate-100 border-none outline-none focus:ring-2 focus:ring-[#39A900]"
                  >
                    <option value="">Todas las fichas</option>
                    {fichasDePrograma.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.codigo}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Botón limpiar filtros */}
              {(filtroProgramaId || filtroFichaId) && (
                <button
                  onClick={() => { setFiltroProgramaId(""); setFiltroFichaId(""); }}
                  className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <X size={10} /> Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Lista en sidebar */}
        <div className="flex-1 overflow-y-auto">
          {/* TAB: GLOBAL */}
          <button
            onClick={() => setActiveTab("GLOBAL")}
            className={`w-full flex items-center gap-3 p-4 text-left border-b transition-colors hover:bg-slate-100 ${activeTab === "GLOBAL"
                ? "bg-[#39A900]/10 border-l-4 border-l-[#39A900]"
                : "border-l-4 border-l-transparent"
              }`}
          >
            <div className="h-10 w-10 rounded-full bg-[#00304D] flex items-center justify-center shrink-0 text-white">
              <Megaphone size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-[#00304D] truncate">Comunicados Globales</p>
              <p className="text-xs text-gray-500 truncate">Canal institucional</p>
            </div>
          </button>

          {/* ── CHATS RECIENTES */}
          {chatsRecientes.length > 0 && (
            <div className="px-2 pt-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 tracking-wider flex items-center gap-1">
                <MessageCircle size={10} /> Chats recientes ({chatsRecientes.length})
              </p>
              {chatsRecientes.map(({ contacto, ultimoMensaje }) => {
                const id = contacto?.id || (ultimoMensaje.emisorId === userId ? ultimoMensaje.receptorId! : ultimoMensaje.emisorId);
                const esPropio = ultimoMensaje.emisorId === userId;
                const nombre = contacto?.nombre || (esPropio ? ultimoMensaje.receptor?.nombre : ultimoMensaje.emisor?.nombre) || "Usuario";
                const esActivo = activeTab === id;
                const preview = `${esPropio ? "Tú: " : ""}${ultimoMensaje.contenido.slice(0, 40)}${ultimoMensaje.contenido.length > 40 ? "…" : ""}`;

                return (
                  <div key={id} className="relative group">
                    <button
                      onClick={() => {
                        setActiveTab(id);
                        // MS-1: marcar como leído al abrir la conversación
                        if (noLeidosPor[id]) {
                          marcarConversacionLeidaAction(id).then(() =>
                            setNoLeidosPor((prev) => { const next = { ...prev }; delete next[id]; return next; })
                          );
                        }
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-slate-200/50 ${esActivo ? "bg-slate-200" : ""
                        }`}
                    >
                      <div className="h-9 w-9 rounded-full bg-[#39A900]/20 flex items-center justify-center shrink-0">
                        <User size={16} className="text-[#007832]" />
                      </div>
                      <div className="flex-1 overflow-hidden min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-sm truncate ${noLeidosPor[id] ? "font-bold text-gray-900" : "font-medium text-gray-800"
                            }`}>{nombre}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            {/* MS-1: Badge de no leídos */}
                            {noLeidosPor[id] ? (
                              <span className="bg-[#39A900] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                {noLeidosPor[id] > 99 ? "99+" : noLeidosPor[id]}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400">
                                {new Date(ultimoMensaje.creadoEn).toLocaleTimeString("es-CO", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className={`text-[11px] truncate ${noLeidosPor[id] ? "text-gray-700 font-medium" : "text-gray-500"
                          }`}>{preview}</p>
                      </div>
                    </button>
                    {/* Botón eliminar conversación */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar conversación con ${nombre}?`))
                          handleEliminarConversacion(id);
                      }}
                      title="Eliminar conversación"
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500 text-gray-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── LISTA DE CONTACTOS */}
          <div className="p-2 pt-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 tracking-wider">
              Contactos ({contactosFiltrados.length})
            </p>
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-4">Cargando...</p>
            ) : (
              <>
                {contactosFiltrados.map((contacto) => (
                  <button
                    key={contacto.id}
                    onClick={() => setActiveTab(contacto.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-slate-200/50 ${activeTab === contacto.id ? "bg-slate-200" : ""
                      }`}
                  >
                    <div className="h-9 w-9 rounded-full bg-[#39A900]/20 flex items-center justify-center shrink-0">
                      <User size={16} className="text-[#007832]" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium text-sm text-gray-800 truncate">{contacto.nombre}</p>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 truncate capitalize">
                          {contacto.rol?.toLowerCase().replace(/_/g, " ")}
                        </span>
                        {contacto.etiqueta && (
                          <span className="text-[10px] text-[#39A900] truncate font-medium mt-0.5">
                            {contacto.etiqueta}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                {contactosFiltrados.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No se encontraron contactos
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════ ÁREA DE CHAT ══════════════════ */}
      <div className="flex-1 flex flex-col bg-white">
        {/* ── Chat Header */}
        <div className="h-16 border-b px-6 flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            {activeTab === "GLOBAL" ? (
              <>
                <div className="h-10 w-10 rounded-full bg-[#00304D] flex items-center justify-center text-white">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-[#00304D]">Comunicados Globales</h2>
                  <p className="text-xs text-gray-500">Avisos oficiales para toda la comunidad</p>
                </div>
              </>
            ) : (
              <>
                <div className="h-10 w-10 rounded-full bg-[#39A900]/20 flex items-center justify-center">
                  <User size={20} className="text-[#007832]" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">{contactoActivo?.nombre || "Usuario"}</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 capitalize">
                      {contactoActivo?.rol?.toLowerCase().replace(/_/g, " ")}
                    </p>
                    {contactoActivo?.etiqueta && (
                      <>
                        <span className="text-gray-300">•</span>
                        <p className="text-xs text-[#39A900] font-medium truncate">
                          {contactoActivo.etiqueta}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "GLOBAL" && isCoordinador && (
              <span className="text-xs bg-[#39A900]/10 text-[#007832] px-3 py-1 rounded-full font-medium border border-[#39A900]/20 flex items-center gap-1">
                <AlertCircle size={14} /> Permiso de Difusión Activo
              </span>
            )}
            {/* Botón eliminar conversación desde header */}
            {activeTab !== "GLOBAL" && mensajesDelChat.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("¿Eliminar toda esta conversación?"))
                    handleEliminarConversacion(activeTab);
                }}
                title="Eliminar conversación"
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ── Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
          {mensajesDelChat.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Megaphone size={48} className="opacity-20 mb-4" />
              <p>No hay mensajes en esta conversación.</p>
              {activeTab !== "GLOBAL" && (
                <p className="text-sm mt-1">¡Sé el primero en escribir!</p>
              )}
            </div>
          ) : (
            mensajesDelChat.map((msg) => {
              const isMe = msg.emisorId === userId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative group max-w-[70%]">
                    <div
                      className={`rounded-2xl px-4 py-2.5 shadow-sm ${isMe
                          ? "bg-[#39A900] text-white rounded-tr-none"
                          : activeTab === "GLOBAL"
                            ? "bg-[#00304D] text-white rounded-tl-none"
                            : "bg-[#EBF7E5] text-gray-800 rounded-tl-none"
                        }`}
                    >
                      {activeTab === "GLOBAL" && !isMe && (
                        <div className="text-xs font-bold text-[#39A900] mb-1">
                          {msg.emisor?.nombre}{" "}
                          <span className="opacity-70 font-normal">({msg.emisor?.rol})</span>
                        </div>
                      )}
                      {/* MS-2: Mostrar mensaje citado dentro de la burbuja */}
                      {msg.replyTo && (
                        <div className="mb-2 p-2 rounded bg-black/5 border-l-2 border-current text-xs opacity-80">
                          <span className="font-semibold block mb-0.5">{msg.replyTo.emisor?.nombre}</span>
                          <span className="truncate block">{msg.replyTo.contenido}</span>
                        </div>
                      )}

                      {/* MS-3: Adjunto */}
                      {msg.adjuntoUrl && (
                        <a href={msg.adjuntoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 mb-2 p-2 rounded bg-black/10 hover:bg-black/20 transition-colors text-xs font-medium cursor-pointer">
                          <File size={14} />
                          <span className="truncate max-w-[200px]">Archivo adjunto</span>
                        </a>
                      )}

                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.contenido}</p>
                    </div>

                    {/* Menú de opciones del mensaje (Responder/Eliminar) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuMensajeId(menuMensajeId === msg.id ? null : msg.id);
                      }}
                      className="absolute -top-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white border rounded-full p-0.5 shadow-sm hover:bg-slate-50 text-gray-400"
                      title="Opciones del mensaje"
                    >
                      <Settings size={11} className="hover:text-gray-700" />
                    </button>

                    {menuMensajeId === msg.id && (
                      <div
                        className={`absolute z-20 top-5 ${isMe ? "right-0" : "left-0"} bg-white border rounded-lg shadow-lg py-1 min-w-[140px]`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Responder */}
                        <button
                          onClick={() => {
                            setMensajeCitado(msg);
                            setMenuMensajeId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                          Responder
                        </button>

                        {/* Eliminar (solo si es mío) */}
                        {isMe && (
                          <button
                            onClick={() => {
                              handleEliminarMensaje(msg.id);
                              setMenuMensajeId(null);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 size={13} /> Eliminar mensaje
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {formatHora(msg.creadoEn)}
                    {isMe && !msg.esGlobal && (
                      <span className={`ml-1 ${msg.leido ? "text-[#39A900]" : "text-gray-300"}`}>
                        {msg.leido ? "✓✓" : "✓"}
                      </span>
                    )}
                    {/* MS-6: Mostrar conteo de lecturas globales para coordinadores */}
                    {isMe && msg.esGlobal && isCoordinador && lecturasGlobalesCount[msg.id] !== undefined && (
                      <span className="ml-2 text-[9px] font-medium bg-slate-100 px-1.5 py-0.5 rounded text-gray-500" title={`Leído por ${lecturasGlobalesCount[msg.id]} de ${totalUsuariosActivos} usuarios activos`}>
                        👁 {lecturasGlobalesCount[msg.id]} vistas
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Chat Input */}
        {!isCoordinador && activeTab === "GLOBAL" ? (
          <div className="p-4 bg-slate-100 border-t text-center text-sm text-gray-500 italic">
            Solo los directivos pueden enviar comunicados globales.
          </div>
        ) : (
          <div className="border-t bg-white">
            {/* MS-7: Panel de Mensaje Masivo (solo si NO es la pestaña global y es coordinador) */}
            {isCoordinador && activeTab !== "GLOBAL" && (
              <div className="px-4 py-2 bg-slate-50 border-b flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-gray-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modoMasivo}
                    onChange={(e) => setModoMasivo(e.target.checked)}
                    className="rounded text-[#39A900] focus:ring-[#39A900]"
                  />
                  Activar modo Mensaje Masivo Segmentado
                </label>

                {modoMasivo && (
                  <div className="flex items-center gap-2">
                    <select
                      value={segmentoMasivo}
                      onChange={(e) => setSegmentoMasivo(e.target.value as any)}
                      className="border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#39A900]"
                    >
                      <option value="TODOS">Toda la comunidad</option>
                      <option value="APRENDICES">Todos los Aprendices</option>
                      <option value="INSTRUCTORES">Todos los Instructores</option>
                      {programasDisponibles.length > 0 && <option value="PROGRAMA">Por Programa</option>}
                      {programasDisponibles.length > 0 && <option value="FICHA">Por Ficha</option>}
                    </select>

                    {segmentoMasivo === "PROGRAMA" && (
                      <select
                        value={segmentoProgramaId}
                        onChange={(e) => setSegmentoProgramaId(e.target.value)}
                        className="border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#39A900]"
                      >
                        <option value="">Selecciona un programa...</option>
                        {programasDisponibles.map((p) => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    )}

                    {segmentoMasivo === "FICHA" && (
                      <>
                        <select
                          value={segmentoProgramaId}
                          onChange={(e) => setSegmentoProgramaId(e.target.value)}
                          className="border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#39A900]"
                        >
                          <option value="">Programa...</option>
                          {programasDisponibles.map((p) => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                          ))}
                        </select>
                        <select
                          value={segmentoFichaId}
                          onChange={(e) => setSegmentoFichaId(e.target.value)}
                          className="border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#39A900]"
                          disabled={!segmentoProgramaId}
                        >
                          <option value="">Ficha...</option>
                          {fichasDePrograma.map((f) => (
                            <option key={f.id} value={f.id}>{f.codigo}</option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* MS-2: UI de mensaje citado antes del input */}
            {mensajeCitado && (
              <div className="px-4 py-2 bg-slate-50 border-b flex justify-between items-start border-l-4 border-l-[#39A900]">
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-[#39A900] mb-0.5">
                    Respondiendo a {mensajeCitado.emisor?.nombre}
                  </div>
                  <div className="text-sm text-gray-600 truncate">{mensajeCitado.contenido}</div>
                </div>
                <button
                  onClick={() => setMensajeCitado(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* MS-3: Previsualización de adjunto antes de enviar */}
            {nuevoAdjuntoUrl && (
              <div className="px-4 py-2 bg-slate-50 border-b flex justify-between items-start border-l-4 border-l-blue-500">
                <div className="overflow-hidden flex items-center gap-2">
                  <File size={16} className="text-blue-500" />
                  <div className="text-sm text-gray-600 truncate">{nuevoAdjuntoUrl}</div>
                </div>
                <button onClick={() => setNuevoAdjuntoUrl("")} className="p-1 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="p-4 flex gap-2">
              <div className="relative">
                <input
                  type="file"
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
                        setNuevoAdjuntoUrl(data.url);
                      } else {
                        toast.error("Error al subir archivo");
                      }
                    } catch (err) {
                      toast.error("Fallo la subida del archivo");
                    }
                  }}
                  title="Adjuntar archivo"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="px-3 border-dashed pointer-events-none h-full"
                >
                  <Paperclip size={18} className="text-gray-500" />
                </Button>
              </div>
              <Input
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder={
                  activeTab === "GLOBAL"
                    ? "Escribe un comunicado global..."
                    : "Escribe un mensaje..."
                }
                className="flex-1 bg-slate-50 focus-visible:ring-[#39A900]"
                disabled={sending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e as any);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={sending || (!nuevoMensaje.trim() && !nuevoAdjuntoUrl)}
                className={`${activeTab === "GLOBAL"
                    ? "bg-[#00304D] hover:bg-[#00304D]/90"
                    : "bg-[#39A900] hover:bg-[#007832]"
                  }`}
              >
                <Send size={18} className={sending ? "opacity-50" : ""} />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
