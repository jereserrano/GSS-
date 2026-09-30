"use client";

import React, { useState } from "react";
import { Cloud, Check, Loader2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface GoogleDriveConfigProps {
  isLinked: boolean;
}

export function GoogleDriveConfig({ isLinked }: GoogleDriveConfigProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLink = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/google/auth-url");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error obteniendo URL de vinculación.");
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      alert("Fallo al conectar con el servidor.");
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm("¿Seguro que deseas desvincular tu cuenta de Google Drive? Dejarán de subirse tus evidencias automáticamente.")) return;
    setLoading(true);
    try {
      await fetch("/api/google/unlink", { method: "POST" });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncOld = async () => {
    if (!confirm("¿Sincronizar las evidencias antiguas a Google Drive? Esto puede tardar un poco dependiendo de cuántas tengas.")) return;
    setLoading(true);
    try {
      const { syncAllEvidenciasToDrive } = await import("@/actions/portafolio.actions");
      const res = await syncAllEvidenciasToDrive();
      if (res.success) {
        alert(`¡Sincronización iniciada/completada! Se enviaron ${res.count} archivos.`);
      } else {
        alert("Hubo un problema sincronizando: " + res.error);
      }
    } catch (e) {
      console.error(e);
      alert("Error al intentar sincronizar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${isLinked ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
          <Cloud size={28} />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Copias de Seguridad (Google Drive)</h3>
          <p className="text-sm text-text-secondary mt-1">
            {isLinked 
              ? "Tus entregas se están respaldando automáticamente en la carpeta 'Mi Portafolio SENA - GSS'."
              : "Vincula tu Google Drive para respaldar automáticamente tus evidencias y entregas."}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        {isLinked ? (
          <>
            <Button variant="secondary" onClick={handleSyncOld} disabled={loading} className="text-slate-700">
              {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Cloud size={16} className="mr-2" />}
              Sincronizar Todo
            </Button>
            <Button variant="outline" onClick={handleUnlink} disabled={loading} className="text-slate-600">
              {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Unlink size={16} className="mr-2" />}
              Desvincular
            </Button>
          </>
        ) : (
          <Button onClick={handleLink} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Cloud size={16} className="mr-2" />}
            Vincular Drive
          </Button>
        )}
      </div>
    </div>
  );
}
