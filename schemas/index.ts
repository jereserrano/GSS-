import { z } from "zod";

// Comunes
const estadoEnum = z.enum(["ACTIVO", "INACTIVO"]);
const tipoDocumentoEnum = z.enum(["CC", "TI", "CE", "PP"]);

// Institucion
export const institucionSchema = z.object({
  nit: z.string().min(1, "El NIT es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  municipio: z.string().min(1, "El municipio es obligatorio"),
  departamento: z.string().optional().nullable().or(z.literal("")),
  direccion: z.string().min(1, "La dirección es obligatoria"),
  telefono: z.string().optional().nullable().or(z.literal("")),
  email: z.string().email("Debe ser un email válido").optional().nullable().or(z.literal("")),
  rector: z.string().optional().nullable().or(z.literal("")),
  estado: estadoEnum.optional().nullable().or(z.literal("")),
});

// Sede
export const sedeSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  institucionId: z.string().min(1, "Institución es obligatoria"),
  direccion: z.string().optional().nullable().or(z.literal('')),
  barrio: z.string().optional().nullable().or(z.literal('')),
  municipio: z.string().optional().nullable().or(z.literal('')),
  esPrincipal: z.boolean().optional().or(z.string().transform(val => val === "true")),
  coordinador: z.string().optional().nullable().or(z.literal('')),
  telefono: z.string().optional().nullable().or(z.literal('')),
  estado: estadoEnum.optional().nullable().or(z.literal('')),
});

// Programa
export const programaSchema = z.object({
  codigo: z.string().min(1, "El código es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  nivelFormacion: z.enum(["TECNICO", "TECNOLOGO", "OPERARIO"]).optional().nullable().or(z.literal('')),
  estado: estadoEnum.optional().nullable().or(z.literal('')),
  version: z.string().optional().nullable().or(z.literal('')),
  duracion: z.union([z.coerce.number().int().positive(), z.literal(""), z.null()]).optional(),
  modalidad: z.enum(["PRESENCIAL", "VIRTUAL", "DISTANCIA", "COMBINADO"]).optional().nullable().or(z.literal('')),
  area: z.string().optional().nullable().or(z.literal('')),
  areaDesempeno: z.string().optional().nullable().or(z.literal('')),
  titulacion: z.string().optional().nullable().or(z.literal('')),
  descripcion: z.string().optional().nullable().or(z.literal('')),
  perfilIngreso: z.string().optional().nullable().or(z.literal('')),
  perfilEgresado: z.string().optional().nullable().or(z.literal('')),
});

// Ficha
export const fichaSchema = z.object({
  codigo: z.string().min(1, "El código es obligatorio"),
  programaId: z.string().min(1, "El programa es obligatorio"),
  institucionId: z.string().min(1, "La institución es obligatoria"),
  sedeId: z.string().min(1, "La sede es obligatoria"),
  fechaInicio: z.string().or(z.date()),
  fechaFin: z.string().or(z.date()),
  jornada: z.string().optional().nullable(),
  estado: estadoEnum.optional().nullable(),
});

// Aprendiz
export const aprendizSchema = z.object({
  tipoDocumento: tipoDocumentoEnum.optional().nullable().or(z.literal('')),
  numeroDocumento: z.string().min(1, "El número de documento es obligatorio"),
  nombres: z.string().min(1, "Los nombres son obligatorios"),
  apellidos: z.string().min(1, "Los apellidos son obligatorios"),
  fechaNacimiento: z.string().optional().nullable().or(z.literal('')).or(z.date().optional()),
  genero: z.string().optional().nullable().or(z.literal('')),
  telefono: z.string().optional().nullable().or(z.literal('')),
  emailPersonal: z.string().email("Email inválido").optional().or(z.literal("")),
  emailSena: z.string().email("Email inválido").optional().or(z.literal("")),
  direccion: z.string().optional().nullable().or(z.literal('')),
  fichaId: z.string().min(1, "La ficha es obligatoria"),
  estado: z.string().optional().nullable().or(z.literal('')),
  nivelRiesgo: z.string().optional().nullable().or(z.literal('')),
});

// Instructor
export const instructorSchema = z.object({
  tipoDocumento: tipoDocumentoEnum.optional().nullable().or(z.literal('')),
  numeroDocumento: z.string().min(1, "Documento obligatorio"),
  nombres: z.string().min(1, "Nombres obligatorios"),
  apellidos: z.string().min(1, "Apellidos obligatorios"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional().nullable().or(z.literal('')),
  profesion: z.string().optional().nullable().or(z.literal('')),
  estado: estadoEnum.optional().nullable().or(z.literal('')),
});

// Competencia
export const competenciaSchema = z.object({
  codigo: z.string().min(1, "Código obligatorio"),
  nombre: z.string().min(1, "Nombre obligatorio"),
  programasIds: z.array(z.string()).min(1, "Debe seleccionar al menos un programa"),
  tipo: z.string().optional().nullable().or(z.literal('')),
  duracionHoras: z.number().or(z.string().transform(v => Number(v))),
  estado: estadoEnum.optional().nullable().or(z.literal('')),
});

// Resultado Aprendizaje
export const resultadoAprendizajeSchema = z.object({
  codigo: z.string().min(1, "Código obligatorio"),
  nombre: z.string().min(1, "Nombre obligatorio"),
  competenciaId: z.string().min(1, "Competencia obligatoria"),
  fase: z.string().optional().nullable().or(z.literal('')),
});

// Actividad
export const actividadSchema = z.object({
  nombre: z.string().min(1, "Nombre obligatorio"),
  descripcion: z.string().optional().nullable().or(z.literal('')),
  instrucciones: z.string().optional().nullable().or(z.literal('')),
  tipo: z.string().optional().nullable().or(z.literal('')),
  fichaId: z.string().min(1, "Ficha obligatoria"),
  fechaInicio: z.string().or(z.date()).optional(),
  fechaVencimiento: z.string().or(z.date()).optional(),
  fechaFin: z.string().or(z.date()).optional(), // Compatibilidad con el frontend actual
  estado: z.string().optional().nullable().or(z.literal('')),
  instructorId: z.string().optional().nullable().or(z.literal('')),
  resultadoAprendizajeId: z.string().optional().nullable().or(z.literal('')),
  instrumentoEvaluacionId: z.string().optional().nullable().or(z.literal('')),
});

// Entrega
export const entregaSchema = z.object({
  actividadId: z.string().min(1, "Actividad obligatoria"),
  aprendizId: z.string().min(1, "Aprendiz obligatorio"),
  urlArchivo: z.string().optional().nullable().or(z.literal('')),
  comentario: z.string().optional().nullable().or(z.literal('')),
  estado: z.string().optional().nullable().or(z.literal('')),
  calificacion: z.string().optional().nullable().or(z.literal('')),
  retroalimentacion: z.string().optional().nullable().or(z.literal('')),
});

// Asistencia
export const asistenciaSchema = z.object({
  fichaId: z.string().min(1, "Ficha obligatoria"),
  instructorId: z.string().min(1, "Instructor obligatorio"),
  fecha: z.string().or(z.date()),
  tema: z.string().optional().nullable().or(z.literal('')),
  observaciones: z.string().optional().nullable().or(z.literal('')),
  registros: z.array(
    z.object({
      aprendizId: z.string(),
      estado: z.enum(["PRESENTE", "FALLA", "EXCUSA"])
    })
  ).optional(),
});

// Evaluacion
export const evaluacionSchema = z.object({
  aprendizId: z.string().min(1, "Aprendiz obligatorio"),
  resultadoAprendizajeId: z.string().min(1, "RAP obligatorio"),
  criterioEvaluacionId: z.string().optional().nullable().or(z.literal('')),
  juicio: z.string().optional().nullable().or(z.literal('')),
  fechaEvaluacion: z.string().or(z.date()).optional(),
  observaciones: z.string().optional().nullable(),
});

// Alerta / Riesgo
export const alertaSchema = z.object({
  aprendizId: z.string().min(1, "Aprendiz obligatorio"),
  motivo: z.string().min(1, "Motivo obligatorio"),
  nivel: z.string().optional().nullable().or(z.literal('')),
  observaciones: z.string().optional().nullable().or(z.literal('')),
  gestionada: z.boolean().optional(),
});

// Visita
export const visitaSchema = z.object({
  aprendizId: z.string().min(1, "Aprendiz obligatorio"),
  fichaId: z.string().min(1, "Ficha obligatoria"),
  institucionId: z.string().optional().nullable().or(z.literal('')),
  institucionNombre: z.string().optional().nullable().or(z.literal('')),
  fecha: z.string().or(z.date()),
  responsable: z.string().min(1, "Responsable obligatorio"),
  novedades: z.number().optional().or(z.string().transform(v => Number(v) || 0)),
  observaciones: z.string().optional().nullable(),
  estado: z.string().optional().nullable().or(z.literal('')),
});

// Documento
export const documentoSchema = z.object({
  nombre: z.string().min(1, "Nombre obligatorio"),
  tipo: z.string().optional().nullable().or(z.literal('')),
  institucionId: z.string().optional().nullable().or(z.literal('')),
  url: z.string().min(1, "URL obligatoria"),
});

// Asistencia Detallada
export const detalleAsistenciaSchema = z.object({
  aprendizId: z.string(),
  estado: z.enum(["PRESENTE", "FALLA", "EXCUSA"]),
  observaciones: z.string().optional().nullable().or(z.literal('')),
});

export const asistenciaMasivaSchema = z.object({
  fichaId: z.string(),
  fecha: z.string().or(z.date()),
  instructorId: z.string(),
  detalles: z.array(detalleAsistenciaSchema),
});

// Importación
export const importAprendicesSchema = z.array(z.object({
  tipoDocumento: z.coerce.string().optional(),
  numeroDocumento: z.coerce.string().min(1),
  nombres: z.coerce.string().min(1),
  apellidos: z.coerce.string().min(1),
  emailSena: z.coerce.string().email().optional().or(z.literal("")),
  emailPersonal: z.coerce.string().email().optional().or(z.literal("")),
  telefono: z.coerce.string().optional(),
  codigoFicha: z.coerce.string().min(1),
}));

export const importInstructoresSchema = z.array(z.object({
  tipoDocumento: z.coerce.string().optional(),
  numeroDocumento: z.coerce.string().min(1),
  nombres: z.coerce.string().min(1),
  apellidos: z.coerce.string().min(1),
  email: z.coerce.string().email(),
  telefono: z.coerce.string().optional(),
  profesion: z.coerce.string().optional(),
}));

export const importCompetenciasSchema = z.array(z.object({
  codigo: z.coerce.string().min(1),
  nombre: z.coerce.string().min(1),
  codigosProgramas: z.coerce.string().min(1),
  tipo: z.coerce.string().optional(),
  duracionHoras: z.coerce.number().or(z.coerce.string().transform(v => Number(v))).optional(),
}));

export const importResultadosSchema = z.array(z.object({
  codigo: z.coerce.string().min(1),
  nombre: z.coerce.string().min(1),
  codigoCompetencia: z.coerce.string().min(1),
  fase: z.coerce.string().optional(),
}));
