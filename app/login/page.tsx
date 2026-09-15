"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Lock, Mail } from "lucide-react";

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
      setError("Credenciales incorrectas. Verifique su correo y contraseña.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50">
      {/* Sección Izquierda - Decorativa (Azul SENA oscuro) */}
      <div className="hidden lg:flex w-1/2 bg-[#003F8C] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}>
        </div>
        
        {/* Círculos decorativos desenfocados (Verde SENA) */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#00A650]/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[100px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md border border-white/20 font-black text-xl text-[#00A650] tracking-widest">
              GSS
            </div>
            <span className="font-bold text-2xl tracking-tight">GRADE SUBMISSION SYSTEM</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Gestión Inteligente para la Media Técnica
          </h1>
          <p className="text-lg text-[#c5d8f5] leading-relaxed">
            Plataforma centralizada para el seguimiento, control y administración de los procesos de integración con instituciones educativas.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-[#c5d8f5] font-medium">
          <p>SENA Regional Magdalena</p>
          <div className="w-1.5 h-1.5 rounded-full bg-[#00A650]" />
          <p>Centro de Logística y Promoción Ecoturística</p>
        </div>
      </div>

      {/* Sección Derecha - Formulario */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative bg-white">
        
        {/* Decoración sutil en móvil */}
        <div className="absolute top-0 w-full h-[30vh] bg-[#003F8C] lg:hidden -z-10" />
        
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Header móvil */}
          <div className="lg:hidden flex flex-col items-center mb-10 text-white">
            <div className="bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-md mb-4 shadow-lg border border-white/20 font-black text-3xl text-[#00A650] tracking-widest">
              GSS
            </div>
            <h1 className="text-3xl font-bold tracking-tight">GRADE SUBMISSION SYSTEM</h1>
            <p className="text-[#c5d8f5] text-sm mt-1">SENA Regional Magdalena</p>
          </div>

          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Bienvenido de nuevo</h2>
              <p className="text-slate-500 text-sm">
                Ingresa tus credenciales institucionales para acceder al panel de administración.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
                <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="email">
                  Correo institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input 
                    id="email"
                    name="email"
                    placeholder="usuario@sena.edu.co" 
                    type="email" 
                    autoComplete="email"
                    required
                    className="pl-11 h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#00A650]"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                    Contraseña
                  </label>
                  <a href="#" className="text-xs font-medium text-[#00823e] hover:text-[#004f26] hover:underline transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input 
                    id="password"
                    name="password"
                    type="password" 
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="pl-11 h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#00A650]"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold mt-4 rounded-xl bg-[#003F8C] hover:bg-[#002660] text-white shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 group" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                    Iniciando sesión...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Ingresar al sistema
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </div>
          
          <p className="text-center text-sm text-slate-400 mt-8 font-medium">
            © {new Date().getFullYear()} SENA Regional Magdalena. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
