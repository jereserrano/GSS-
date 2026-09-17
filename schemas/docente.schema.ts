import { z } from "zod";
import { TipoDocumento, Estado } from "@prisma/client";

export const docenteSchema = z.object({
  tipoDocumento: z.nativeEnum(TipoDocumento),
  numeroDocumento: z.string().min(5, "El documento debe tener al menos 5 caracteres"),
  nombres: z.string().min(2, "Los nombres son requeridos"),
  apellidos: z.string().min(2, "Los apellidos son requeridos"),
  email: z.string().email("Debe ser un correo válido"),
  telefono: z.string().optional().nullable(),
  profesion: z.string().optional().nullable(),
  institucionId: z.string().min(1, "La institución es requerida"),
  estado: z.nativeEnum(Estado).default("ACTIVO"),
});

export type DocenteFormValues = z.infer<typeof docenteSchema>;
