"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

// Mapeo simple de rutas a nombres legibles
const routeNames: Record<string, string> = {
  dashboard: "Dashboard",
  instituciones: "Instituciones",
  sedes: "Sedes",
  programas: "Programas",
  fichas: "Fichas / Grupos",
  aprendices: "Aprendices",
  instructores: "Instructores",
  docentes: "Docentes",
  competencias: "Competencias",
  "resultados-aprendizaje": "Resultados de Aprendizaje",
  "plan-formacion": "Plan de Formación",
  actividades: "Actividades",
  entregas: "Entregas",
  asistencia: "Asistencia",
  evaluaciones: "Evaluaciones",
  resultados: "Resultados",
  seguimiento: "Seguimiento",
  riesgos: "Riesgos",
  reportes: "Reportes",
  documentos: "Documentos",
  notificaciones: "Notificaciones",
  usuarios: "Usuarios",
  roles: "Roles y Permisos",
  auditoria: "Auditoría",
  configuracion: "Configuración",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  
  if (pathname === "/" || pathname === "/dashboard") {
    return null; // No mostrar breadcrumbs en el inicio
  }

  const paths = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center text-sm text-text-secondary mb-6 overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
      <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center">
        <Home size={14} className="mr-1" />
        <span className="sr-only">Inicio</span>
      </Link>
      
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        const href = `/${paths.slice(0, index + 1).join("/")}`;
        
        // Si es un ID (asumimos que si tiene guiones o números es un ID)
        // En un caso real haríamos fetch del nombre de la entidad.
        const isId = path.includes("-") && /\d/.test(path);
        const label = isId ? "Detalle" : (routeNames[path] || path);

        return (
          <React.Fragment key={path}>
            <ChevronRight size={14} className="mx-2 text-slate-300 shrink-0" />
            {isLast ? (
              <span className="font-medium text-text-primary pointer-events-none">
                {label}
              </span>
            ) : (
              <Link href={href} className="hover:text-primary transition-colors capitalize">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
