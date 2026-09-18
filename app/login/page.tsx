"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Lock, Mail, ShieldCheck, GraduationCap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      
      {/* Barra superior institucional */}
      <header className="w-full bg-white border-b border-slate-200 py-3 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-[#39A900] text-white font-bold text-sm px-2.5 py-1 rounded-md tracking-wider">
              GSS
            </span>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold text-slate-800 tracking-tight">
                Integración con la Media Técnica
              </span>
              <span className="text-[11px] text-slate-500">
                Proyecto académico en contexto SENA
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <GraduationCap size={15} className="text-[#39A900]" />
            <span className="font-medium">Plataforma Académica</span>
          </div>
        </div>
      </header>

      {/* Contenedor central del formulario */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-[440px] bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs">
          
          {/* Cabecera del formulario */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#f0fdf4] text-[#39A900] border border-[#bbf7d0] mb-4">
              <ShieldCheck size={26} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Ingreso a la Plataforma
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Sistema de Información para el Seguimiento del Proceso de Integración con la Media Técnica
            </p>
          </div>

          {/* Mensaje de error si falla la autenticación */}
          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5">
              <AlertCircle size={17} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-medium leading-normal">{error}</p>
            </div>
          )}

          {/* Formulario accesible */}
          <form onSubmit={handleLogin} className="space-y-4.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block" htmlFor="email">
                Correo institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <Input 
                  id="email"
                  name="email"
                  placeholder="usuario@misena.edu.co" 
                  type="email" 
                  autoComplete="email"
                  required
                  className="pl-9 h-10 text-xs rounded-lg bg-white border-slate-200 focus-visible:border-[#39A900] focus-visible:ring-[#39A900]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 block" htmlFor="password">
                  Contraseña
                </label>
                <a href="#" className="text-[11px] font-medium text-[#267000] hover:text-[#1d5400] hover:underline transition-colors">
                  ¿Olvidó su contraseña?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <Input 
                  id="password"
                  name="password"
                  type="password" 
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="pl-9 h-10 text-xs rounded-lg bg-white border-slate-200 focus-visible:border-[#39A900] focus-visible:ring-[#39A900]"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-10.5 text-xs font-semibold mt-2 rounded-lg bg-[#39A900] hover:bg-[#319200] text-white shadow-xs transition-colors" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
                  Validando credenciales...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Acceder a la formación
                  <ArrowRight size={15} />
                </span>
              )}
            </Button>
          </form>

          {/* Nota de seguridad y privacidad */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 leading-normal">
              Acceso restringido para instructores, aprendices y personal autorizado en el marco de la integración media técnica.
            </p>
          </div>

        </div>
      </main>

      {/* Footer del Login */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <p className="text-[11px]">
          GSS es un proyecto académico desarrollado en el contexto de la formación del SENA.
        </p>
      </footer>

    </div>
  );
}
