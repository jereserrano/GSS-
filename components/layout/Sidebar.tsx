"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  LayoutDashboard, Building2, MapPin, BookOpen, 
  Users, UserCheck, GraduationCap, 
  Target, FileText, ClipboardList, BookCheck, 
  CalendarCheck, FileSignature, TrendingUp, AlertTriangle, 
  PieChart, FolderOpen, Bell, Settings, Shield,
  Menu, ChevronLeft, FileCheck, Activity, Search, User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccessRoute } from "@/lib/permissions";

interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

// Menú específico para APRENDIZ
const navAprendiz: NavSection[] = [
  {
    items: [
      { icon: LayoutDashboard, label: "Inicio", href: "/dashboard" },
    ],
  },
  {
    title: "Mi Aprendizaje",
    items: [
      { icon: BookOpen, label: "Mi formación", href: "/fichas" },
      { icon: BookCheck, label: "Mis actividades", href: "/actividades" },
      { icon: FileSignature, label: "Mis entregas", href: "/entregas" },
      { icon: TrendingUp, label: "Mis resultados", href: "/resultados" },
      { icon: ClipboardList, label: "Ruta de aprendizaje", href: "/plan-formacion" },
    ],
  },
  {
    title: "Recursos y Cuenta",
    items: [
      { icon: FolderOpen, label: "Documentos", href: "/documentos" },
      { icon: Bell, label: "Notificaciones", href: "/notificaciones" },
      { icon: User, label: "Perfil", href: "/usuarios" },
    ],
  },
];

// Menú específico para INSTRUCTOR
const navInstructor: NavSection[] = [
  {
    items: [
      { icon: LayoutDashboard, label: "Inicio", href: "/dashboard" },
    ],
  },
  {
    title: "Gestión Formativa",
    items: [
      { icon: Users, label: "Fichas / Grupos", href: "/fichas" },
      { icon: GraduationCap, label: "Aprendices", href: "/aprendices" },
      { icon: Target, label: "Competencias", href: "/competencias" },
      { icon: FileText, label: "Resultados de Aprendizaje", href: "/resultados-aprendizaje" },
      { icon: ClipboardList, label: "Plan de Formación", href: "/plan-formacion" },
    ],
  },
  {
    title: "Ejecución y Evaluación",
    items: [
      { icon: BookCheck, label: "Actividades", href: "/actividades" },
      { icon: FileSignature, label: "Entregas", href: "/entregas" },
      { icon: CalendarCheck, label: "Asistencia", href: "/asistencia" },
      { icon: FileCheck, label: "Evaluaciones", href: "/evaluaciones" },
      { icon: TrendingUp, label: "Resultados", href: "/resultados" },
    ],
  },
  {
    title: "Acompañamiento",
    items: [
      { icon: Activity, label: "Seguimiento", href: "/seguimiento" },
      { icon: AlertTriangle, label: "Riesgos", href: "/riesgos" },
      { icon: PieChart, label: "Reportes", href: "/reportes" },
      { icon: FolderOpen, label: "Documentos", href: "/documentos" },
      { icon: Bell, label: "Notificaciones", href: "/notificaciones" },
    ],
  },
];

// Menú para COORDINADORES (Académico, Regional, Sede) — Sin acceso a administración global
const navCoordinador: NavSection[] = [
  {
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Gestión Institucional",
    items: [
      { icon: Building2, label: "Instituciones", href: "/instituciones" },
      { icon: MapPin, label: "Sedes", href: "/sedes" },
      { icon: BookOpen, label: "Programas", href: "/programas" },
      { icon: Users, label: "Fichas / Grupos", href: "/fichas" },
    ],
  },
  {
    title: "Actores",
    items: [
      { icon: GraduationCap, label: "Aprendices", href: "/aprendices" },
      { icon: UserCheck, label: "Instructores", href: "/instructores" },
    ],
  },
  {
    title: "Académico",
    items: [
      { icon: Target, label: "Competencias", href: "/competencias" },
      { icon: FileText, label: "Resultados de Aprendizaje", href: "/resultados-aprendizaje" },
      { icon: ClipboardList, label: "Plan de Formación", href: "/plan-formacion" },
    ],
  },
  {
    title: "Ejecución",
    items: [
      { icon: BookCheck, label: "Actividades", href: "/actividades" },
      { icon: FileSignature, label: "Entregas", href: "/entregas" },
      { icon: CalendarCheck, label: "Asistencia", href: "/asistencia" },
      { icon: FileCheck, label: "Evaluaciones", href: "/evaluaciones" },
      { icon: TrendingUp, label: "Resultados", href: "/resultados" },
    ],
  },
  {
    title: "Seguimiento y Reportes",
    items: [
      { icon: Activity, label: "Seguimiento", href: "/seguimiento" },
      { icon: AlertTriangle, label: "Riesgos", href: "/riesgos" },
      { icon: PieChart, label: "Reportes", href: "/reportes" },
      { icon: FolderOpen, label: "Documentos", href: "/documentos" },
      { icon: Bell, label: "Notificaciones", href: "/notificaciones" },
    ],
  },
];

// Menú EXCLUSIVO para ADMINISTRADOR DEL SISTEMA
const navAdmin: NavSection[] = [
  {
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Gestión Institucional",
    items: [
      { icon: Building2, label: "Instituciones", href: "/instituciones" },
      { icon: MapPin, label: "Sedes", href: "/sedes" },
      { icon: BookOpen, label: "Programas", href: "/programas" },
      { icon: Users, label: "Fichas / Grupos", href: "/fichas" },
    ],
  },
  {
    title: "Actores",
    items: [
      { icon: GraduationCap, label: "Aprendices", href: "/aprendices" },
      { icon: UserCheck, label: "Instructores", href: "/instructores" },
    ],
  },
  {
    title: "Académico",
    items: [
      { icon: Target, label: "Competencias", href: "/competencias" },
      { icon: FileText, label: "Resultados de Aprendizaje", href: "/resultados-aprendizaje" },
      { icon: ClipboardList, label: "Plan de Formación", href: "/plan-formacion" },
    ],
  },
  {
    title: "Ejecución",
    items: [
      { icon: BookCheck, label: "Actividades", href: "/actividades" },
      { icon: FileSignature, label: "Entregas", href: "/entregas" },
      { icon: CalendarCheck, label: "Asistencia", href: "/asistencia" },
      { icon: FileCheck, label: "Evaluaciones", href: "/evaluaciones" },
      { icon: TrendingUp, label: "Resultados", href: "/resultados" },
    ],
  },
  {
    title: "Seguimiento y Reportes",
    items: [
      { icon: Activity, label: "Seguimiento", href: "/seguimiento" },
      { icon: AlertTriangle, label: "Riesgos", href: "/riesgos" },
      { icon: PieChart, label: "Reportes", href: "/reportes" },
      { icon: FolderOpen, label: "Documentos", href: "/documentos" },
    ],
  },
  {
    title: "Administración del Sistema",
    items: [
      { icon: Bell, label: "Notificaciones", href: "/notificaciones" },
      { icon: Users, label: "Usuarios", href: "/usuarios" },
      { icon: Shield, label: "Roles y Permisos", href: "/roles" },
      { icon: Search, label: "Auditoría", href: "/auditoria" },
      { icon: Settings, label: "Configuración", href: "/configuracion" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const rawRole = (session?.user?.role ?? "").toUpperCase();

  const isAprendiz = rawRole === "APRENDIZ" || rawRole.includes("APRENDIZ");
  const isInstructor = rawRole === "INSTRUCTOR" || rawRole.includes("INSTRUCT");
  const isAdmin = rawRole === "ADMINISTRADOR" || rawRole.includes("ADMIN");
  const isCoordinador = !isAdmin && (rawRole.includes("COORD") || rawRole.includes("SEDE") || rawRole.includes("APOYO"));

  const toggleSidebar = () => setCollapsed(!collapsed);
  const closeMobile = () => setMobileOpen(false);

  // Seleccionar la lista base según rol estrictamente verificado
  const baseSections = status === "loading"
    ? []
    : isAdmin
    ? navAdmin
    : isCoordinador
    ? navCoordinador
    : isInstructor
    ? navInstructor
    : isAprendiz
    ? navAprendiz
    : [];

  // Filtrar según permisos de ruta para no exponer opciones no autorizadas
  const visibleSections = baseSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessRoute(rawRole, item.href)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      {/* Botón flotante para abrir en mobile */}
      <button 
        className="md:hidden fixed top-3.5 left-3.5 z-50 p-2 bg-[#39A900] hover:bg-[#319200] text-white rounded-lg shadow-md transition-colors"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú de navegación"
      >
        <Menu size={20} />
      </button>

      {/* Overlay para mobile */}
      <div 
        className={cn("sidebar-overlay md:hidden", mobileOpen && "visible")} 
        onClick={closeMobile}
      />

      {/* Sidebar contenedor: fondo blanco, borde suave institucional */}
      <aside className={cn(
        "sidebar bg-white border-r border-slate-200 text-slate-700 flex flex-col transition-all duration-300 z-40",
        collapsed && "md:w-[68px]",
        !collapsed && "md:w-[260px]",
        mobileOpen ? "translate-x-0 w-[260px]" : "-translate-x-full md:translate-x-0"
      )}>
        
        {/* Header del Sidebar */}
        <div className="h-16 flex items-center px-4 shrink-0 border-b border-slate-100 bg-white sticky top-0 z-10 justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="bg-[#39A900] text-white font-bold text-sm px-2 py-0.5 rounded-md tracking-wider">
                GSS
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs text-slate-900 tracking-tight truncate leading-tight">
                  Media Técnica
                </span>
                <span className="text-[10px] text-slate-500 font-medium truncate leading-tight">
                  Seguimiento Formativo
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <span className="bg-[#39A900] text-white font-bold text-xs px-1.5 py-0.5 rounded-md">
                GSS
              </span>
            </div>
          )}
          
          <button 
            onClick={toggleSidebar}
            className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title={collapsed ? "Expandir navegación" : "Colapsar navegación"}
          >
            <ChevronLeft size={18} className={cn("transition-transform duration-200", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Navegación Filtrada por Rol */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-3 custom-scrollbar">
          {visibleSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              {section.title && (
                collapsed ? (
                  <hr className="my-2 border-slate-100 mx-2" />
                ) : (
                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </div>
                )
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === "/dashboard" 
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={closeMobile}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-150 group",
                      isActive 
                        ? "bg-[#f0fdf4] text-[#267000] font-semibold border-l-[3px] border-[#39A900] shadow-2xs" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                    )}
                  >
                    <Icon 
                      size={17} 
                      className={cn(
                        "shrink-0 transition-colors", 
                        isActive ? "text-[#39A900]" : "text-slate-400 group-hover:text-slate-600"
                      )} 
                    />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Footer del sidebar con rol activo */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 text-xs">
          {!collapsed ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Rol Activo</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#267000] bg-[#f0fdf4] px-1.5 py-0.5 rounded border border-[#bbf7d0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39A900]"></span>
                  {rawRole || (status === "loading" ? "Cargando..." : "Invitado")}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                Contexto académico SENA
              </p>
            </div>
          ) : (
            <div className="flex justify-center" title={`Modo: ${rawRole}`}>
              <span className="w-2 h-2 rounded-full bg-[#39A900]"></span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
