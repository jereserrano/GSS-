import { z } from "zod";

export const notificacionSchema = z.object({
  userId: z.string().min(1, "El usuario es requerido"),
  titulo: z.string().min(3, "El título es requerido"),
  mensaje: z.string().min(5, "El mensaje es requerido"),
  leida: z.boolean().default(false),
  tipo: z.enum(["INFO", "ALERTA", "EXITO", "ERROR"]).default("INFO"),
  enlace: z.string().optional().nullable(),
});

export type NotificacionFormValues = z.infer<typeof notificacionSchema>;
