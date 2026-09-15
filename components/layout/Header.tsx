"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { Bell, Search, LogOut, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Header() {
  const { data: session, status } = useSession();

  const userName = session?.user?.name ?? "Usuario";
  const userEmail = session?.user?.email ?? "";
  const userRole = (session?.user as { role?: string })?.role ?? "Sin rol";

  // Iniciales para el avatar
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 bg-surface border-b flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm md:px-6">
      
      {/* Izquierda: Buscador Global */}
      <div className="flex-1 flex items-center">
        {/* Espaciador para el botón hamburguesa en mobile */}
        <div className="w-10 md:hidden" />
        
        <div className="hidden md:flex w-full max-w-md relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input 
            type="search" 
            placeholder="Buscar estudiantes, fichas o instituciones..." 
            className="pl-10 bg-slate-50 border-slate-200"
          />
        </div>
      </div>

      {/* Derecha: Notificaciones y Perfil */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-slate-100">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full border border-surface"></span>
        </button>

        <div className="h-8 w-px bg-border hidden sm:block" />

        {/* Perfil de Usuario */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-text-primary leading-none mb-0.5">
              {status === "loading" ? "..." : userName}
            </span>
            <span className="text-xs text-text-secondary leading-none">
              {status === "loading" ? "" : userRole}
            </span>
          </div>

          <div className="h-9 w-9 bg-sena-100 text-sena-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0 select-none">
            {status === "loading" ? <User size={16} /> : initials}
          </div>

          {/* Botón Cerrar Sesión */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Cerrar sesión"
            className="p-2 text-slate-400 hover:text-danger-600 transition-colors rounded-full hover:bg-danger-50"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
