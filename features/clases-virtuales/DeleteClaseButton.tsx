"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { eliminarClaseVirtualAction } from "@/actions/clases-virtuales.actions";
import { toast } from "sonner";

export function DeleteClaseButton({ claseId }: { claseId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("¿Estás seguro de que deseas eliminar esta clase virtual?")) {
      startTransition(async () => {
        const result = await eliminarClaseVirtualAction(claseId);
        if (result.success) {
          toast.success("Clase eliminada correctamente.");
        } else {
          toast.error(result.error || "No se pudo eliminar la clase");
        }
      });
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="icon" 
      onClick={handleDelete} 
      disabled={isPending}
      title="Eliminar clase"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
