import { z } from "zod";

// Comunes
const estadoEnum = z.enum(["ACTIVO", "INACTIVO"]);
const tipoDocumentoEnum = z.enum(["CC", "TI", "CE", "PP"]);

// Institucion
export const institucionSchema = z.object({
  nit: z.string().min(1, "El NIT es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  municipio: z.string().min(1, "El municipio es obligatorio"),
  departamento: z.string().optional(),
  direccion: z.string().min(1, "La dirección es obligatoria"),
  telefono: z.string().optional(),
  email: z.string().email("Debe ser un email válido").optional().or(z.literal("")),
  rector: z.string().optional(),
  estado: estadoEnum.optional(),
});

// Sede
export const sedeSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  institucionId: z.string().min(1, "Institución es obligatoria"),
  direccion: z.string().optional(),
  barrio: z.string().optional(),
  municipio: z.string().optional(),
  esPrincipal: z.boolean().optional().or(z.string().transform(val => val === "true")),
  coordinador: z.string().optional(),
  telefono: z.string().optional(),
  estado: estadoEnum.optional(),
});

// Programa
export const programaSchema = z.object({
  codigo: z.string().min(1, "El código es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  nivelFormacion: z.enum(["TECNICO", "TECNOLOGO", "OPERARIO"]).optional(),
  estado: estadoEnum.optional(),
});

// Ficha
export const fichaSchema = z.object({
  codigo: z.string().min(1, "El código es obligatorio"),
  programaId: z.string().min(1, "El programa es obligatorio"),
  institucionId: z.string().min(1, "La institución es obligatoria"),
  sedeId: z.string().min(1, "La sede es obligatoria"),
  fechaInicio: z.string().or(z.date()),
  fechaFin: z.string().or(z.date()),
  jornada: z.string().optional(),
  estado: estadoEnum.optional(),
});

// Aprendiz
export const aprendizSchema = z.object({
  tipoDocumento: tipoDocumentoEnum.optional(),
  numeroDocumento: z.string().min(1, "El número de documento es obligatorio"),
  nombres: z.string().min(1, "Los nombres son obligatorios"),
  apellidos: z.string().min(1, "Los apellidos son obligatorios"),
  fechaNacimiento: z.string().optional().or(z.date().optional()),
  genero: z.string().optional(),
  telefono: z.string().optional(),
  emailPersonal: z.string().email("Email inválido").optional().or(z.literal("")),
  emailSena: z.string().email("Email inválido").optional().or(z.literal("")),
  direccion: z.string().optional(),
  fichaId: z.string().min(1, "La ficha es obligatoria"),
  estado: z.enum(["EN_FORMACION", "EGRESADO", "RETIRADO", "APLAZADO", "CANCELADO"]).optional(),
  nivelRiesgo: z.enum(["BAJO", "MEDIO", "ALTO"]).optional(),
});

// Instructor
export const instructorSchema = z.object({
  tipoDocumento: tipoDocumentoEnum.optional(),
  numeroDocumento: z.string().min(1, "Documento obligatorio"),
  nombres: z.string().min(1, "Nombres obligatorios"),
  apellidos: z.string().min(1, "Apellidos obligatorios"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  profesion: z.string().optional(),
  estado: estadoEnum.optional(),
});

// Competencia
export const competenciaSchema = z.object({
  codigo: z.string().min(1, "Código obligatorio"),
  nombre: z.string().min(1, "Nombre obligatorio"),
  programaId: z.string().min(1, "Programa obligatorio"),
  tipo: z.enum(["TECNICA", "TRANSVERSAL", "BASICA"]).optional(),
  duracionHoras: z.number().or(z.string().transform(v => Number(v))),
  estado: estadoEnum.optional(),
});

// Resultado Aprendizaje
export const resultadoAprendizajeSchema = z.object({
  codigo: z.string().min(1, "Código obligatorio"),
  nombre: z.string().min(1, "Nombre obligatorio"),
  competenciaId: z.string().min(1, "Competencia obligatoria"),
  fase: z.enum(["ANALISIS", "PLANEACION", "EJECUCION", "EVALUACION"]).optional(),
});

// Actividad
export const actividadSchema = z.object({
  nombre: z.string().min(1, "Nombre obligatorio"),
  descripcion: z.string().optional(),
  tipo: z.enum(["TALLER", "PROYECTO", "FORO", "QUIZ"]).optional(),
  fichaId: z.string().min(1, "Ficha obligatoria"),
  fechaVencimiento: z.string().or(z.date()).optional(),
  fechaFin: z.string().or(z.date()).optional(), // Compatibilidad con el frontend actual
  estado: z.enum(["ACTIVA", "PUBLICADA", "CERRADA", "BORRADOR"]).optional(),
  instructorId: z.string().optional(),
  resultadoAprendizajeId: z.string().optional(),
  instrucciones: z.string().optional(),
});

// Entrega
export const entregaSchema = z.object({
  actividadId: z.string().min(1, "Actividad obligatoria"),
  aprendizId: z.string().min(1, "Aprendiz obligatorio"),
  urlArchivo: z.string().optional(),
  comentario: z.string().optional(),
  estado: z.enum(["PENDIENTE", "CALIFICADA", "TARDIA", "APROBADA", "NO_APROBADA"]).optional(),
  calificacion: z.string().optional(),
  retroalimentacion: z.string().optional(),
});

// Asistencia
export const asistenciaSchema = z.object({
  fichaId: z.string().min(1, "Ficha obligatoria"),
  instructorId: z.string().min(1, "Instructor obligatorio"),
  fecha: z.string().or(z.date()),
  tema: z.string().optional(),
  observaciones: z.string().optional(),
  registros: z.array(
    z.object({
      aprendizId: z.string(),
      estado: z.enum(["PRESENTE", "ASISTIO", "FALLA", "EXCUSA"])
    })
  ).optional(),
});

// Evaluacion
export const evaluacionSchema = z.object({
  aprendizId: z.string().min(1, "Aprendiz obligatorio"),
  resultadoAprendizajeId: z.string().min(1, "RAP obligatorio"),
  juicio: z.enum(["APROBADO", "DEFICIENTE", "PENDIENTE", "POR_EVALUAR", "NO_APROBADO"]).optional(),
  fechaEvaluacion: z.string().or(z.date()).optional(),
  observaciones: z.string().optional(),
});

// Alerta / Riesgo
export const alertaSchema = z.object({
  aprendizId: z.string().min(1, "Aprendiz obligatorio"),
  motivo: z.string().min(1, "Motivo obligatorio"),
  nivel: z.enum(["BAJO", "MEDIO", "ALTO"]).optional(),
  observaciones: z.string().optional(),
  gestionada: z.boolean().optional(),
});

// Visita
export const visitaSchema = z.object({
  institucionNombre: z.string().min(1, "Institución obligatoria"),
  fecha: z.string().or(z.date()),
  responsable: z.string().min(1, "Responsable obligatorio"),
  novedades: z.number().optional().or(z.string().transform(v => Number(v))),
  observaciones: z.string().optional(),
  estado: z.enum(["PROGRAMADA", "REALIZADA", "APLAZADA"]).optional(),
});

// Documento
export const documentoSchema = z.object({
  nombre: z.string().min(1, "Nombre obligatorio"),
  tipo: z.string().optional(),
  institucionId: z.string().optional(),
  url: z.string().min(1, "URL obligatoria"),
});

// Asistencia Detallada
export const detalleAsistenciaSchema = z.object({
  aprendizId: z.string(),
  estado: z.enum(["PRESENTE", "FALLA", "EXCUSA"]),
  observaciones: z.string().optional(),
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
  codigoPrograma: z.coerce.string().min(1),
  tipo: z.coerce.string().optional(),
  duracionHoras: z.coerce.number().or(z.coerce.string().transform(v => Number(v))).optional(),
}));

export const importResultadosSchema = z.array(z.object({
  codigo: z.coerce.string().min(1),
  nombre: z.coerce.string().min(1),
  codigoCompetencia: z.coerce.string().min(1),
  fase: z.coerce.string().optional(),
}));
