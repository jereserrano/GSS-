"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle } from "lucide-react";

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

    // Login exitoso → redirigir al dashboard
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo decorativo institucional */}
      <div className="absolute top-0 w-full h-[40vh] bg-sena-900 -skew-y-3 origin-top-left -z-10"></div>
      
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-white p-3 rounded-full shadow-md mb-2">
            <Shield size={40} className="text-verde-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">PROMPT MAESTRO</h1>
          <p className="text-sena-100 text-sm">
            Sistema de Seguimiento a la Integración con la Media Técnica
          </p>
        </div>

        <Card className="border-0 shadow-xl rounded-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Iniciar sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales institucionales para acceder al sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-danger-50 border border-danger-200 flex items-start gap-2">
                <AlertCircle size={18} className="text-danger-600 shrink-0 mt-0.5" />
                <p className="text-sm text-danger-700">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary" htmlFor="email">
                  Correo electrónico institucional
                </label>
                <Input 
                  id="email"
                  name="email"
                  placeholder="usuario@sena.edu.co" 
                  type="email" 
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary" htmlFor="password">
                  Contraseña
                </label>
                <Input 
                  id="password"
                  name="password"
                  type="password" 
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-11 text-base mt-2" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    Verificando credenciales...
                  </span>
                ) : (
                  "Ingresar al sistema"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col border-t px-6 py-4 bg-slate-50 rounded-b-xl mt-4">
            <p className="text-center text-xs text-text-secondary">
              SENA Regional Magdalena<br/>
              © {new Date().getFullYear()} Todos los derechos reservados
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
