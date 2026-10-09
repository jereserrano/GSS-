"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordAction, resetPasswordAction } from "@/actions/auth.actions";

export function OlvidoClaveClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Ingresa tu correo"); return; }
    
    setLoading(true);
    const res = await forgotPasswordAction(email);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      toast.error(res.error || "Ocurrió un error.");
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Mínimo 6 caracteres"); return; }
    if (password !== confirmPassword) { toast.error("Las contraseñas no coinciden"); return; }
    if (!token) { toast.error("Token inválido"); return; }

    setLoading(true);
    const res = await resetPasswordAction(token, password);
    setLoading(false);

    if (res.success) {
      toast.success("Contraseña actualizada con éxito.");
      router.push("/login");
    } else {
      toast.error(res.error || "Error al restablecer la contraseña.");
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#00304D]">Correo Enviado</h2>
        <p className="text-slate-500">
          Revisa la bandeja de entrada o spam de <strong>{email}</strong>.
        </p>
        <Button onClick={() => router.push("/login")} variant="outline" className="w-full mt-4">
          Volver al Inicio
        </Button>
      </div>
    );
  }

  if (token) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#00304D]">Nueva Contraseña</h2>
          <p className="text-slate-500 mt-2 text-sm">Ingresa tu nueva clave para GSS.</p>
        </div>
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="password"
                required
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Confirmar Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="password"
                required
                className="pl-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#39A900] hover:bg-[#2b8200]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Restablecer Contraseña
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#00304D]">Recuperar Contraseña</h2>
        <p className="text-slate-500 mt-2 text-sm">Ingresa tu correo y te enviaremos un enlace.</p>
      </div>
      <form onSubmit={handleForgotSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="email"
              required
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.sena.edu.co"
            />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-[#39A900] hover:bg-[#2b8200]">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Enviar Enlace
        </Button>
      </form>
      <div className="text-center mt-6">
        <button 
          onClick={() => router.push("/login")}
          className="text-sm text-[#39A900] font-semibold hover:underline inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver
        </button>
      </div>
    </div>
  );
}
