import { z } from "zod";

// ============================================================
// ESQUEMAS ZOD DE VALIDACIÓN (usados en todas las API routes)
// ============================================================

export const PaginacionSchema = z.object({
  pagina: z.coerce.number().min(1).default(1),
  tamano: z.coerce.number().min(1).max(100).default(10),
  busqueda: z.string().optional(),
  estado: z.string().optional(),
  nivelRiesgo: z.string().optional(),
  fichaId: z.string().optional(),
});

export const InstitucionCreateSchema = z.object({
  nit: z.string().min(5),
  nombre: z.string().min(3).max(200),
  municipio: z.string(),
  departamento: z.string().optional(),
  direccion: z.string(),
  telefono: z.string().optional(),
  email: z.string().email().optional(),
  rector: z.string().optional(),
});

export const AprendizCreateSchema = z.object({
  tipoDocumento: z.enum(["CC", "TI", "CE", "PP"]),
  numeroDocumento: z.string().min(5).max(20),
  nombres: z.string().min(2).max(100),
  apellidos: z.string().min(2).max(100),
  fechaNacimiento: z.string().optional(),
  genero: z.string().optional(),
  telefono: z.string().optional(),
  emailPersonal: z.string().email().optional(),
  emailSena: z.string().email().optional(),
  fichaId: z.string().cuid(),
  nivelRiesgo: z.enum(["BAJO", "MEDIO", "ALTO"]).optional(),
});

export const UserLoginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const UserCreateSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  rolId: z.string().cuid(),
});

export type PaginacionInput = z.infer<typeof PaginacionSchema>;
export type AprendizCreateInput = z.infer<typeof AprendizCreateSchema>;
export type InstitucionCreateInput = z.infer<typeof InstitucionCreateSchema>;
export type UserLoginInput = z.infer<typeof UserLoginSchema>;
