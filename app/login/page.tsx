"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Lock, Mail, Eye, EyeOff, ShieldCheck, MonitorSmartphone } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");
  const [savedPassword, setSavedPassword] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 4000);
    
    // Generar deviceId si no existe
    if (!localStorage.getItem("gss_device_id")) {
      localStorage.setItem("gss_device_id", crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15));
    }
    
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string || savedEmail;
    const password = formData.get("password") as string || savedPassword;
    
    setSavedEmail(email);
    setSavedPassword(password);
    
    const deviceId = localStorage.getItem("gss_device_id");

    const result = await signIn("credentials", {
      email,
      password,
      totpCode: needs2FA ? totpCode : "",
      deviceId: deviceId || "",
      trustDevice: needs2FA ? String(trustDevice) : "false",
      redirect: false,
    });

    if (result?.error) {
      const errorStr = String(result.error).toUpperCase();
      console.log("Login error from NextAuth:", result.error);

      if (errorStr.includes("REQUIRED") || errorStr.includes("2FA_REQUIRED")) {
        setNeeds2FA(true);
        setError(null);
      } else if (errorStr.includes("INVALID") || errorStr.includes("2FA")) {
        setError(`El código de verificación (2FA) es incorrecto. (Detalle: ${result.error})`);
      } else {
        setError(`Credenciales no válidas. (Detalle: ${result.error})`);
      }
      setIsLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center font-sans overflow-hidden bg-slate-900">
      
      {/* Carrusel de Fondos a Pantalla Completa */}
      {BACKGROUND_IMAGES.map((src, idx) => (
        <div 
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentBg ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={src} alt="Background" className="w-full h-full object-cover object-center" />
        </div>
      ))}

      {/* Capas de Filtro / Overlays */}
      <div className="absolute inset-0 bg-black/40 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#1d5400]/40 via-[#267000]/20 to-transparent pointer-events-none"></div>
      
      {/* Decoración ambiental brillante */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#39A900]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Tarjeta Glassmorphism Principal */}
      <div className="relative z-10 w-full max-w-[900px] mx-4 p-1 rounded-[2rem] bg-white/5 border border-white/20 shadow-2xl backdrop-blur-lg transform-gpu animate-in fade-in zoom-in-95 duration-700">
        
        {/* Contenedor Interno de la Tarjeta */}
        <div className="flex flex-col lg:flex-row h-full rounded-[1.9rem] overflow-hidden bg-gradient-to-br from-white/0 to-transparent">
          
          {/* LADO IZQUIERDO - Branding */}
          <div className="flex-1 p-10 lg:p-14 flex flex-col justify-center items-center text-center lg:border-r lg:border-white/10 border-b lg:border-b-0 border-white/10">
            <div className="mb-8 p-4 bg-white/10 rounded-full backdrop-blur-md transform-gpu border border-white/20 shadow-inner">
              <img src="/logo.png" alt="GSS Logo" className="h-16 object-contain drop-shadow-md" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-lg mb-4 uppercase">
              Seguimiento Media Técnica
            </h1>
            <p className="text-white/80 text-sm font-medium drop-shadow max-w-xs">
              Plataforma de gestión académica e institucional
            </p>
          </div>

          {/* LADO DERECHO - Formulario */}
          <div className="flex-[0.8] p-10 lg:p-14 flex flex-col justify-center">
            
            <h2 className="text-center text-white/90 text-sm lg:text-base font-bold tracking-widest uppercase mb-10 drop-shadow-sm">
              Plataforma Institucional
            </h2>

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/50 backdrop-blur-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="text-red-200 shrink-0 mt-0.5" />
                <p className="text-xs text-white font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              
              {needs2FA ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  {/* Banner de 2FA */}
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#39A900]/20 border border-[#39A900]/40 backdrop-blur-md">
                    <ShieldCheck size={18} className="text-green-300 shrink-0" />
                    <p className="text-xs text-white/90 font-medium leading-relaxed">
                      Ingresa el código de tu app autenticadora
                    </p>
                  </div>

                  {/* Input código TOTP */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/60 group-focus-within:text-white transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      id="totpCode"
                      name="totpCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="000000"
                      required
                      autoFocus
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-12 pr-4 h-14 text-sm text-white placeholder:text-white/60 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md focus:bg-white/20 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 text-center tracking-[0.5em] font-mono text-xl"
                    />
                  </div>

                  {/* Checkbox: Confiar en este equipo */}
                  <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
                    <div className="relative mt-0.5 shrink-0">
                      <input
                        id="trustDevice"
                        type="checkbox"
                        checked={trustDevice}
                        onChange={(e) => setTrustDevice(e.target.checked)}
                        className="peer sr-only"
                      />
                      {/* Caja personalizada del checkbox */}
                      <div className="w-5 h-5 rounded-md border-2 border-white/30 bg-white/5 peer-checked:bg-[#39A900] peer-checked:border-[#39A900] transition-all duration-200 flex items-center justify-center">
                        <svg
                          className={`w-3 h-3 text-white transition-all duration-200 ${trustDevice ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <MonitorSmartphone size={14} className="text-white/70" />
                        <span className="text-sm text-white/90 font-medium">Confiar en este equipo</span>
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                        No se pedirá el código 2FA en este dispositivo durante <strong className="text-white/70">30 días</strong>.
                        Solo marca esto en equipos de tu confianza.
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <>
                  {/* Input Usuario */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/60 group-focus-within:text-white transition-colors">
                      <Mail size={18} />
                    </div>
                    <input 
                      id="email"
                      name="email"
                      placeholder="Usuario" 
                      type="email" 
                      autoComplete="email"
                      required
                      className="w-full pl-12 pr-4 h-14 text-sm text-white placeholder:text-white/60 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md focus:bg-white/20 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300"
                    />
                  </div>

                  {/* Input Contraseña */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/60 group-focus-within:text-white transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="Contraseña"
                      autoComplete="current-password"
                      required
                      className="w-full pl-12 pr-12 h-14 text-sm text-white placeholder:text-white/60 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md focus:bg-white/20 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </>
              )}

              {/* Botón Iniciar Sesión (Glow Effect) */}
              <div className="pt-4 pb-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="relative w-full h-14 text-sm font-extrabold uppercase tracking-wide rounded-full bg-white text-[#1d5400] overflow-hidden transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 shadow-[0_0_20px_rgba(57,169,0,0.5)] hover:shadow-[0_0_35px_rgba(57,169,0,0.8)]"
                >
                  {/* Capa de brillo interno suave */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-100/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700"></div>
                  
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <span className="h-4 w-4 rounded-full border-2 border-[#1d5400]/40 border-t-[#1d5400] animate-spin"></span>
                      Validando...
                    </span>
                  ) : (
                    <span className="relative z-10">{needs2FA ? "Verificar y Entrar" : "Iniciar Sesión"}</span>
                  )}
                </button>
              </div>
              
              <div className="text-center mt-4">
                <Link href="/olvido-clave" className="text-xs font-medium text-white/70 tracking-wide hover:text-white hover:underline transition-colors block mb-2">
                  ¿Olvidaste tu contraseña?
                </Link>
                <p className="text-[10px] font-medium text-white/40 tracking-wide">
                  Acceso al Sistema
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>
      
      {/* Footer inferior */}
      <div className="absolute bottom-6 w-full text-center z-10 pointer-events-none">
        <p className="text-xs text-white/50 font-medium tracking-wider">
          &copy; {new Date().getFullYear()} SENA - GSS
        </p>
      </div>

    </div>
  );
}
