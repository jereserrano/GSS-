"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { claseVirtualSchema, ClaseVirtualFormValues } from "@/schemas/clase-virtual.schema";
import { crearClaseVirtualAction } from "@/actions/clases-virtuales.actions";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, VideoIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ClaseVirtualFormDialog({ fichas }: { fichas: { id: string; codigo: string; programa: string }[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  const form = useForm<ClaseVirtualFormValues>({
    resolver: zodResolver(claseVirtualSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      duracionMin: 60,
    },
  });

  const onSubmit = async (data: ClaseVirtualFormValues) => {
    try {
      const result = await crearClaseVirtualAction(data);
      if (result.success) {
        toast.success("Clase virtual programada con éxito en Zoom.");
        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error || "No se pudo crear la sesión.");
      }
    } catch (e) {
      toast.error("Ocurrió un error inesperado.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#2D8CFF] hover:bg-[#1C69D4]">
          <VideoIcon className="mr-2 h-4 w-4" />
          Programar Clase en Zoom
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Programar Clase en Zoom</DialogTitle>
          <DialogDescription>
            Genera un enlace de Zoom y notifica a los aprendices automáticamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fichaId">Ficha *</Label>
            <Select onValueChange={(v) => form.setValue("fichaId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una ficha..." />
              </SelectTrigger>
              <SelectContent>
                {fichas.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.codigo} - {f.programa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.fichaId && <p className="text-xs text-red-500">{form.formState.errors.fichaId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título de la Sesión *</Label>
            <Input id="titulo" placeholder="Ej. Inducción al Diseño" {...form.register("titulo")} />
            {form.formState.errors.titulo && <p className="text-xs text-red-500">{form.formState.errors.titulo.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha y Hora *</Label>
              <Input id="fechaInicio" type="datetime-local" {...form.register("fechaInicio")} />
              {form.formState.errors.fechaInicio && <p className="text-xs text-red-500">{form.formState.errors.fechaInicio.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="duracionMin">Duración (min) *</Label>
              <Input id="duracionMin" type="number" {...form.register("duracionMin")} />
              {form.formState.errors.duracionMin && <p className="text-xs text-red-500">{form.formState.errors.duracionMin.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción / Temario</Label>
            <Textarea id="descripcion" placeholder="Temas a tratar..." {...form.register("descripcion")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={form.formState.isSubmitting} className="bg-[#2D8CFF] hover:bg-[#1C69D4]">
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Crear Reunión
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
