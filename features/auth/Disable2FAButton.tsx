"use client";

import { useState } from "react";
import { disable2FAAction } from "@/actions/2fa.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

export function Disable2FAButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDisable = async () => {
    if (!confirm("¿Estás seguro de que deseas desactivar el 2FA? Deberás volver a configurarlo en tu nuevo dispositivo.")) return;
    
    setLoading(true);
    const res = await disable2FAAction();
    if (res.success) {
      toast.success("Autenticación en dos pasos (2FA) desactivada.");
      router.refresh();
    } else {
      toast.error(res.error || "Hubo un error al desactivar 2FA.");
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleDisable} 
      disabled={loading}
      className="mt-4"
    >
      {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
      Desvincular Dispositivo (Desactivar 2FA)
    </Button>
  );
}
