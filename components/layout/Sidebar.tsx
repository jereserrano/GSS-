"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Building2, MapPin, BookOpen, 
  Users, UserCheck, GraduationCap, UsersRound, 
  Target, FileText, ClipboardList, BookCheck, 
  CalendarCheck, FileSignature, TrendingUp, AlertTriangle, 
  PieChart, FolderOpen, Bell, Settings, Shield,
  Menu, ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

// Definición de las rutas del sistema basadas en el prompt
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { separator: true, label: "Gestión Institucional" },
  { icon: Building2, label: "Instituciones", href: "/instituciones" },
  { icon: MapPin, label: "Sedes", href: "/sedes" },
  { icon: BookOpen, label: "Programas", href: "/programas" },
  { icon: Users, label: "Fichas / Grupos", href: "/fichas" },
  { separator: true, label: "Actores" },
  { icon: GraduationCap, label: "Aprendices", href: "/aprendices" },
  { icon: UserCheck, label: "Instructores", href: "/instructores" },
  { icon: UsersRound, label: "Docentes", href: "/docentes" },
  { separator: true, label: "Académico" },
  { icon: Target, label: "Competencias", href: "/competencias" },
  { icon: FileText, label: "Resultados de Aprendizaje", href: "/resultados-aprendizaje" },
  { icon: ClipboardList, label: "Plan de Formación", href: "/plan-formacion" },
  { separator: true, label: "Ejecución" },
  { icon: BookCheck, label: "Actividades", href: "/actividades" },
  { icon: FileSignature, label: "Entregas", href: "/entregas" },
  { icon: CalendarCheck, label: "Asistencia", href: "/asistencia" },
  { icon: FileCheck, label: "Evaluaciones", href: "/evaluaciones" },
  { icon: TrendingUp, label: "Resultados", href: "/resultados" },
  { separator: true, label: "Seguimiento" },
  { icon: Activity, label: "Seguimiento", href: "/seguimiento" },
  { icon: AlertTriangle, label: "Riesgos", href: "/riesgos" },
  { separator: true, label: "Reportes" },
  { icon: PieChart, label: "Reportes", href: "/reportes" },
  { icon: FolderOpen, label: "Documentos", href: "/documentos" },
  { separator: true, label: "Administración" },
  { icon: Bell, label: "Notificaciones", href: "/notificaciones" },
  { icon: Users, label: "Usuarios", href: "/usuarios" },
  { icon: Shield, label: "Roles y Permisos", href: "/roles" },
  { icon: Search, label: "Auditoría", href: "/auditoria" },
  { icon: Settings, label: "Configuración", href: "/configuracion" },
];

// Fallback para iconos faltantes (FileCheck, Activity, Search no exportados arriba, los añado aquí para evitar error)
import { FileCheck, Activity, Search } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);
  const closeMobile = () => setMobileOpen(false);

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
              <span className="text-verde-500 text-xl">P</span> MAESTRO
            </div>
          )}
          {collapsed && (
            <div className="flex-1 font-bold text-lg text-center text-verde-500">PM</div>
          )}
          
          <button 
            onClick={toggleSidebar}
            className="hidden md:flex p-1 hover:bg-sena-800 rounded-md text-sena-200 hover:text-white"
          >
            <ChevronLeft size={20} className={cn("transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Scrollable Nav */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar">
          {navItems.map((item, idx) => {
            if (item.separator) {
              if (collapsed) {
                return <hr key={idx} className="my-2 border-sena-800 mx-2" />;
              }
              return (
                <div key={idx} className="px-3 pt-4 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {item.label}
                </div>
              );
            }

            const Icon = item.icon!;
            const isActive = pathname.startsWith(item.href!);

            return (
              <Link 
                key={idx} 
                href={item.href!}
                onClick={closeMobile}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-sena-800 text-white font-medium" 
                    : "text-slate-300 hover:bg-sena-800 hover:text-white"
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
        
        {/* Footer del sidebar */}
        <div className="p-4 border-t border-sena-800 text-xs text-slate-400">
          {!collapsed && (
            <div className="flex flex-col gap-1">
              <span>SENA Regional Magdalena</span>
              <span className="opacity-60">v0.1.0 (Mock Data)</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
