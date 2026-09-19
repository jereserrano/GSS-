"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Lock, Mail, ShieldCheck, GraduationCap, LayoutDashboard } from "lucide-react";

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1600"
];

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Credenciales no válidas. Verifique su correo institucional y contraseña.");
      setIsLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50 font-sans">
      {/* Lado Izquierdo - Branding Institucional (Oculto en móvil) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1d5400] text-white p-12 flex-col justify-between overflow-hidden shadow-[25px_0_60px_-15px_rgba(0,0,0,0.4)] z-20">
        
        {/* Slideshow de imágenes */}
        {BACKGROUND_IMAGES.map((src, idx) => (
          <div 
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentBg ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={src} alt="Background" className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1d5400]/50 via-[#267000]/30 to-[#39A900]/20"></div>
          </div>
        ))}

        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        {/* Decoración geométrica */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-white/20 mb-8 shadow-lg">
            <img src="/logo.png" alt="GSS Logo" className="h-5 object-contain" />
            <span className="font-bold text-sm tracking-wide text-slate-800 border-l border-slate-200 pl-3">Plataforma Académica</span>
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-[1.1] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Seguimiento Media Técnica
          </h1>
          <p className="text-lg text-white max-w-md font-medium leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            Impulsando el desarrollo y la integración de la formación técnica en las instituciones educativas.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
          <GraduationCap size={48} className="opacity-90" />
          <div>
            <p className="text-sm font-bold tracking-wider uppercase">SENA Regional Magdalena</p>
            <p className="text-xs font-semibold opacity-90">Formación profesional integral</p>
          </div>
        </div>
      </div>

      {/* Lado Derecho - Formulario de Login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 relative bg-slate-100">
        {/* Decorative element for mobile only */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1d5400] to-[#39A900] lg:hidden"></div>

        <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_15px_60px_-15px_rgba(0,0,0,0.2)] ring-1 ring-slate-200 p-8 sm:p-10 transition-all duration-300 hover:shadow-[0_25px_65px_-12px_rgba(57,169,0,0.2)] hover:ring-[#39A900]/30">
          
          {/* Logo / Cabecera (Mobile only logo visible if needed, but here we just show the shield) */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img src="/logo.png" alt="GSS SENA" className="h-20 object-contain drop-shadow-md hover:scale-105 transition-transform duration-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Bienvenido</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Ingrese sus credenciales para acceder a la plataforma GSS.
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2 group">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block transition-colors group-focus-within:text-[#39A900]" htmlFor="email">
                Correo institucional
              </label>
              <div className="relative transition-all duration-300 hover:shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#39A900] transition-colors">
                  <Mail size={18} />
                </div>
                <Input 
                  id="email"
                  name="email"
                  placeholder="usuario@misena.edu.co" 
                  type="email" 
                  autoComplete="email"
                  required
                  className="pl-10 h-12 text-sm rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus-visible:border-[#39A900] focus-visible:ring-4 focus-visible:ring-[#39A900]/10 transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block transition-colors group-focus-within:text-[#39A900]" htmlFor="password">
                  Contraseña
                </label>
                <a href="#" className="text-xs font-semibold text-[#39A900] hover:text-[#267000] transition-colors">
                  ¿Olvidó su contraseña?
                </a>
              </div>
              <div className="relative transition-all duration-300 hover:shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#39A900] transition-colors">
                  <Lock size={18} />
                </div>
                <Input 
                  id="password"
                  name="password"
                  type="password" 
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="pl-10 h-12 text-sm rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus-visible:border-[#39A900] focus-visible:ring-4 focus-visible:ring-[#39A900]/10 transition-all duration-300"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-sm font-bold mt-4 rounded-xl bg-gradient-to-r from-[#39A900] to-[#319200] hover:from-[#319200] hover:to-[#267000] text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
                  Validando credenciales...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Acceder a la plataforma
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </form>

        </div>
        
        {/* Footer simple para el lado derecho */}
        <p className="absolute bottom-6 text-center text-xs text-slate-400 font-medium w-full px-6">
          &copy; {new Date().getFullYear()} SENA - GSS. Proyecto académico.
        </p>
      </div>
    </div>
  );
}
