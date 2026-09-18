"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Bell, Search, LogOut, User, CheckCheck, 
  AlertTriangle, Calendar, Info, ArrowRight, X 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { getMisNotificacionesAction, marcarComoLeidaAction, marcarTodasComoLeidasAction } from "@/actions/notificaciones.actions";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface NotificacionItem {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  creadoEn: string | Date;
  leida: boolean;
}

export function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const userName = session?.user?.name ?? "Usuario";
  const userRole = session?.user?.rolName ?? session?.user?.role ?? "Sin rol";

  const cargarNotificaciones = async () => {
    try {
      const res = await getMisNotificacionesAction();
      if (res.success && res.data) {
        setNotificaciones(res.data);
      }
    } catch (e) {
      console.error("Error cargando notificaciones:", e);
    }
  };

  useEffect(() => {
    if (session?.user) {
      cargarNotificaciones();
      // Refrescar cada 30 segundos
      const interval = setInterval(cargarNotificaciones, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const unreadCount = notificaciones.filter((n) => !n.leida).length;

  // Cerrar el popover al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotifOpen]);

  const marcarTodasLeidas = async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    await marcarTodasComoLeidasAction();
  };

  const marcarComoLeida = async (id: string) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
    await marcarComoLeidaAction(id);
  };

  // Iniciales para el avatar
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30 shadow-xs md:px-6">
      
      {/* Izquierda: Identidad Contextual y Buscador Global */}
      <div className="flex-1 flex items-center gap-4">
        {/* Espaciador para el botón hamburguesa en mobile */}
        <div className="w-10 md:hidden" />
        
        <div className="hidden lg:flex items-center gap-2 pr-3 border-r border-slate-200 text-xs text-slate-500">
          <span className="font-bold text-[#39A900] text-sm tracking-wide">GSS</span>
          <span className="text-slate-300">|</span>
          <span className="font-medium text-slate-600 truncate max-w-[280px]">
            Seguimiento Media Técnica
          </span>
        </div>

        <div className="hidden md:flex w-full max-w-sm relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input 
            type="search" 
            placeholder="Buscar por aprendiz, ficha o actividad..." 
            className="pl-9 bg-slate-50 border-slate-200 text-xs h-8.5 rounded-lg placeholder:text-slate-400 focus:bg-white focus:border-[#39A900] focus:ring-[#39A900] transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                router.push(`/dashboard?busqueda=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
          />
        </div>
      </div>

      {/* Derecha: Notificaciones y Perfil */}
      <div className="flex items-center gap-3">
        
        {/* Contenedor del Botón y Menú de Notificaciones */}
        <div className="relative" ref={notifRef}>
          <button 
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2 transition-all rounded-xl cursor-pointer ${
              isNotifOpen 
                ? "bg-[#f0fdf4] text-[#39A900]" 
                : "text-slate-600 hover:text-[#39A900] hover:bg-slate-100"
            }`}
            title="Centro de Notificaciones"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-bold text-white bg-red-600 rounded-full border-2 border-white shadow-xs animate-in zoom-in-50">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Menú Desplegable / Popover de Notificaciones */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Encabezado del Popover */}
              <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">Notificaciones</span>
                  {unreadCount > 0 ? (
                    <span className="text-[11px] font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      {unreadCount} nuevas
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded-full">
                      Al día
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={marcarTodasLeidas}
                    className="text-[11px] font-semibold text-[#39A900] hover:text-[#267000] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <CheckCheck size={13} />
                    <span>Marcar leídas</span>
                  </button>
                )}
              </div>

              {/* Lista de Notificaciones */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                {notificaciones.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No tienes notificaciones pendientes.
                  </div>
                ) : (
                  notificaciones.map((notif) => {
                    const tipoKey = (notif.tipo || "info").toLowerCase();
                    const iconConfig = tipoKey.includes("alerta") || tipoKey.includes("error")
                      ? { icon: AlertTriangle, color: "text-red-600 bg-red-50 border-red-100" }
                      : tipoKey.includes("exito") || tipoKey.includes("aprob")
                      ? { icon: CheckCheck, color: "text-[#267000] bg-[#f0fdf4] border-[#bbf7d0]" }
                      : { icon: Calendar, color: "text-emerald-700 bg-emerald-50 border-emerald-100" };
                    
                    const Icon = iconConfig.icon;
                    const fechaRelativa = notif.creadoEn 
                      ? formatDistanceToNow(new Date(notif.creadoEn), { addSuffix: true, locale: es })
                      : "";

                    return (
                      <div
                        key={notif.id}
                        onClick={() => marcarComoLeida(notif.id)}
                        className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                          !notif.leida ? "bg-emerald-50/30 hover:bg-emerald-50/50" : "hover:bg-slate-50/80 opacity-80"
                        }`}
                      >
                        <div className={`p-2 rounded-xl border shrink-0 ${iconConfig.color}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className={`text-xs font-semibold truncate ${!notif.leida ? "text-slate-900" : "text-slate-600"}`}>
                              {notif.titulo}
                            </h4>
                            {!notif.leida && (
                              <span className="w-2 h-2 rounded-full bg-[#39A900] shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.mensaje}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                            {fechaRelativa}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pie con enlace al historial completo */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  href="/notificaciones"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-semibold text-[#39A900] hover:text-[#267000] inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Ver todas las notificaciones</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

            </div>
          )}
        </div>

        <div className="h-7 w-px bg-slate-200 hidden sm:block" />

        {/* Perfil de Usuario */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {status === "loading" ? "..." : userName}
            </span>
            <span className="text-[11px] font-medium text-slate-500 leading-tight">
              {status === "loading" ? "" : userRole}
            </span>
          </div>

          <div className="h-9 w-9 bg-[#f0fdf4] text-[#267000] border border-[#bbf7d0] rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs">
            {status === "loading" ? <User size={16} /> : initials}
          </div>

          {/* Botón Cerrar Sesión con purga de Router Cache */}
          <button
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.href = "/login";
            }}
            title="Cerrar sesión"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl cursor-pointer"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
