"use client";

import React, { useState, useEffect } from "react";
import { generate2FASecretAction, verifyAndEnable2FAAction } from "@/actions/2fa.actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, KeyRound, Loader2 } from "lucide-react";

export function Setup2FA({ onSuccess }: { onSuccess?: () => void }) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [loadingQr, setLoadingQr] = useState(true);
  const [loadingVerify, setLoadingVerify] = useState(false);

  // Genera el secreto y QR automáticamente al montar el componente
  useEffect(() => {
    const init = async () => {
      try {
        const res = await generate2FASecretAction();
        if (res.success && res.qrCodeUrl) {
          setQrCodeUrl(res.qrCodeUrl);
          setSecret(res.secret || null);
        } else {
          toast.error(res.error || "No se pudo generar el código QR.");
        }
      } catch (error: any) {
        toast.error(`Error al generar el código QR: ${error.message || error}`);
        console.error(error);
      } finally {
        setLoadingQr(false);
      }
    };
    init();
  }, []);

  const verifySetup = async () => {
    if (!token || token.length < 6) {
      toast.error("Ingrese un código de 6 dígitos válido.");
      return;
    }
    setLoadingVerify(true);
    try {
      const res = await verifyAndEnable2FAAction(token);
      if (res.success) {
        toast.success("Autenticación en dos pasos habilitada con éxito.");
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "El código ingresado es incorrecto.");
      }
    } catch (error: any) {
      toast.error(`Error al verificar: ${error.message || error}`);
      console.error(error);
    } finally {
      setLoadingVerify(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4">
        <div className="p-2 bg-green-50 rounded-lg text-green-600">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Seguridad en Dos Pasos (2FA)</h2>
          <p className="text-sm text-gray-500">Protege tu cuenta con Google Authenticator</p>
        </div>
      </div>

      {/* Cuerpo: loading o contenido */}
      {loadingQr ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-400">
          <Loader2 size={32} className="animate-spin text-[#39A900]" />
          <p className="text-sm">Generando tu código QR...</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Columna Izquierda: QR */}
          <div className="flex flex-col items-center flex-1 space-y-3">
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-gray-800 text-sm">1. Escanea este código QR</h3>
              <p className="text-xs text-gray-500">Abre Google Authenticator o Authy.</p>
            </div>

            {qrCodeUrl && (
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-32 h-32 mix-blend-multiply" />
              </div>
            )}

            {secret && (
              <div className="text-center">
                <p className="text-[10px] text-gray-400 mb-1">¿No puedes escanearlo? Usa este código manual:</p>
                <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700 tracking-widest">
                  {secret}
                </code>
              </div>
            )}
          </div>

          {/* Separador */}
          <div className="hidden md:block w-px bg-gray-100 h-32 self-center"></div>
          <div className="block md:hidden h-px bg-gray-100 w-full"></div>

          {/* Columna Derecha: Verificación */}
          <div className="flex-1 w-full space-y-4">
            <div className="text-center md:text-left space-y-1">
              <h3 className="font-semibold text-gray-800 text-sm">2. Ingresa el código generado</h3>
              <p className="text-xs text-gray-500">Para confirmar que todo funciona correctamente.</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <KeyRound size={16} />
                </div>
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && verifySetup()}
                  placeholder="000000"
                  maxLength={6}
                  inputMode="numeric"
                  className="pl-10 text-center font-mono tracking-widest text-lg h-11"
                />
              </div>
              <Button
                onClick={verifySetup}
                disabled={loadingVerify || loadingQr}
                className="h-11 w-full bg-[#39A900] hover:bg-[#319200]"
              >
                {loadingVerify ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Verificando...
                  </span>
                ) : (
                  "Verificar Código"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
