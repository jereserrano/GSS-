import * as z from "zod";

export const claseVirtualSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  fechaInicio: z.string().or(z.date()),
  duracionMin: z.coerce.number().min(15, "La duración mínima es de 15 minutos").max(300, "La duración máxima es de 5 horas"),
  fichaId: z.string().min(1, "Debes seleccionar una ficha"),
});

export type ClaseVirtualFormValues = z.infer<typeof claseVirtualSchema>;
