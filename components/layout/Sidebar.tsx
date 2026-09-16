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
  Menu, ChevronLeft, FileCheck, Activity, Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccessRoute } from "@/lib/permissions";

interface NavSection {
  title?: string;
  items: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    href: string;
  }[];
}

// Estructura modular de navegación institucional SENA (sin Docentes)
const navSections: NavSection[] = [
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
    title: "Seguimiento",
    items: [
      { icon: Activity, label: "Seguimiento", href: "/seguimiento" },
      { icon: AlertTriangle, label: "Riesgos", href: "/riesgos" },
    ],
  },
  {
    title: "Reportes",
    items: [
      { icon: PieChart, label: "Reportes", href: "/reportes" },
      { icon: FolderOpen, label: "Documentos", href: "/documentos" },
    ],
  },
  {
    title: "Administración",
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
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = (session?.user as any)?.role ?? "INSTRUCTOR";

  const toggleSidebar = () => setCollapsed(!collapsed);
  const closeMobile = () => setMobileOpen(false);

  // Filtrar secciones y enlaces según permisos del rol autenticado
  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessRoute(userRole, item.href)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      {/* Botón flotante para abrir en mobile */}
      <button 
        className="md:hidden fixed top-3 left-4 z-50 p-2 bg-sena-900 text-white rounded-md"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Overlay para mobile */}
      <div 
        className={cn("sidebar-overlay md:hidden", mobileOpen && "visible")} 
        onClick={closeMobile}
      />

      {/* Sidebar contenedor */}
      <aside className={cn(
        "sidebar text-text-inverse flex flex-col transition-all duration-300",
        collapsed && "md:w-[64px]",
        !collapsed && "md:w-[260px]",
        mobileOpen ? "translate-x-0 w-[260px]" : "-translate-x-full md:translate-x-0"
      )}>
        
        {/* Header del Sidebar */}
        <div className="h-16 flex items-center px-4 shrink-0 border-b border-sena-800 bg-sena-950 sticky top-0 z-10">
          {!collapsed && (
            <div className="flex-1 font-bold text-lg flex items-center gap-2 overflow-hidden whitespace-nowrap text-white">
              <span className="text-[#00A650] font-black tracking-widest text-base border border-[#00A650]/40 px-1.5 py-0.5 rounded-md">GSS</span>
              <span className="text-sm font-semibold truncate">Grade Submission System</span>
            </div>
          )}
          {collapsed && (
            <div className="flex-1 font-black text-base text-center text-[#00A650] tracking-widest">GSS</div>
          )}
          
          <button 
            onClick={toggleSidebar}
            className="hidden md:flex p-1 hover:bg-sena-800 rounded-md text-sena-200 hover:text-white cursor-pointer"
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <ChevronLeft size={20} className={cn("transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Navegación Filtrada por Rol */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-3 custom-scrollbar">
          {visibleSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title && (
                collapsed ? (
                  <hr className="my-2 border-sena-800 mx-2" />
                ) : (
                  <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </div>
                )
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={closeMobile}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                      isActive 
                        ? "bg-sena-800 text-white font-medium shadow-2xs" 
                        : "text-slate-300 hover:bg-sena-800/70 hover:text-white"
                    )}
                  >
                    <Icon size={18} className={cn("shrink-0", isActive ? "text-verde-400" : "text-slate-400")} />
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
        <div className="p-3.5 border-t border-sena-800 text-xs text-slate-400 bg-sena-950/50">
          {!collapsed && (
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-slate-300 truncate">SENA Regional Magdalena</span>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Modo: {userRole}</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
