"use client";

import React, { useEffect, useState } from "react";
import { MonitorX, ShieldAlert, Laptop } from "lucide-react";

interface SecurityGuardProps {
  children: React.ReactNode;
}

export function SecurityGuard({ children }: SecurityGuardProps) {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 1. Detección de dispositivos móviles (Android, iOS, iPad, etc.) y pantallas no aptas
    const checkMobile = () => {
      const userAgent =
        typeof window !== "undefined"
          ? navigator.userAgent || navigator.vendor || (window as any).opera || ""
          : "";

      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;

      const isMobileUA = mobileRegex.test(userAgent);
      const isTouchAndSmall =
        typeof window !== "undefined" &&
        (navigator.maxTouchPoints > 0 || "ontouchstart" in window) &&
        window.innerWidth < 1024;
      const isSmallScreen = typeof window !== "undefined" && window.innerWidth < 900;

      setIsMobileDevice(Boolean(isMobileUA || isTouchAndSmall || isSmallScreen));
      setIsChecking(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // 2. Desactivar menú contextual (Click Derecho / Inspeccionar)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 3. Desactivar teclas de inspección: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + I / J / C (DevTools e Inspeccionar elemento)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "I" ||
          e.key === "i" ||
          e.key === "J" ||
          e.key === "j" ||
          e.key === "C" ||
          e.key === "c")
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + U (Ver código fuente)
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + S (Guardar página)
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Pantalla de bloqueo institucional para celulares / tablets
  if (!isChecking && isMobileDevice) {
    return (
      <div className="min-h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center select-none fixed inset-0 z-[99999]">
        {/* Fondo decorativo institucional */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#003F8C]/40 via-slate-900 to-black pointer-events-none" />

        <div className="relative z-10 max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-md flex flex-col items-center">
          {/* Logo GSS */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[#00A650] font-black text-xl border border-[#00A650]/40 px-2 py-0.5 rounded-lg bg-emerald-950/40">
              GSS
            </span>
            <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
              SENA Magdalena
            </span>
          </div>

          {/* Icono de bloqueo */}
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-6 shadow-lg shadow-red-950/40 animate-pulse">
            <MonitorX size={42} strokeWidth={1.8} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-semibold mb-3">
            <ShieldAlert size={14} />
            <span>Acceso Restringido en Móviles</span>
          </div>

          <h1 className="text-xl font-bold text-white mb-2 leading-snug">
            Disponible Exclusivamente en Computador
          </h1>

          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            Por directriz de seguridad y gestión técnica del <strong>SENA Regional Magdalena</strong>, la plataforma <strong>Grade Submission System (GSS)</strong> no admite inicio de sesión ni navegación desde teléfonos celulares (Android / iOS) ni dispositivos móviles.
          </p>

          <div className="w-full p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-lg bg-blue-900/40 text-blue-400 shrink-0">
              <Laptop size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Ingresa desde un PC o Laptop</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Abre el navegador en tu equipo de cómputo para acceder a todas las funciones.
              </p>
            </div>
          </div>

          <div className="mt-6 text-[10px] text-slate-500">
            GSS Media Técnica &copy; {new Date().getFullYear()} — SENA
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
