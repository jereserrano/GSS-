/**
 * data/aprendices.mock.ts
 * ─────────────────────────────────────────────────────────────────
 * Mock data para Aprendices.
 * ─────────────────────────────────────────────────────────────────
 */
import type { Aprendiz } from "@/types/aprendiz.types";

export const mockAprendices: Aprendiz[] = [
  {
    id: "APR-0001",
    tipoDocumento: "TI",
    numeroDocumento: "1082123456",
    nombres: "Juan Carlos",
    apellidos: "Pérez Gómez",
    emailSena: "jperezg@soy.sena.edu.co",
    emailPersonal: "juan.perez@gmail.com",
    telefono: "300 987 6543",
    sexo: "masculino",
    fechaNacimiento: "2009-05-14T00:00:00Z",
    
    // Ubicación
    fichaId: "FICHA-001", // Técnico en Sistemas
    institucionId: "INST-0001", // I.E.D. Simón Bolívar
    sedeId: "SEDE-001",
    
    // Seguimiento
    estado: "en_formacion",
    nivelRiesgo: "bajo",
    promedioAcumulado: 4.2,
    porcentajeAsistencia: 95.0,
    
    // Audit Metadata
    creadoEn: new Date("2025-02-05T08:00:00Z"),
    creadoPor: "SISTEMA",
    actualizadoEn: new Date("2026-05-20T10:30:00Z"),
    actualizadoPor: "INSTR-01",
    eliminado: false,
    eliminadoEn: null
  },
  {
    id: "APR-0002",
    tipoDocumento: "TI",
    numeroDocumento: "1082987654",
    nombres: "María Alejandra",
    apellidos: "López Rojas",
    emailSena: "mlopezr@soy.sena.edu.co",
    emailPersonal: "aleja.lopez@hotmail.com",
    telefono: "315 123 4567",
    sexo: "femenino",
    fechaNacimiento: "2008-11-20T00:00:00Z",
    
    // Ubicación
    fichaId: "FICHA-001", // Técnico en Sistemas
    institucionId: "INST-0001",
    sedeId: "SEDE-001",
    
    // Seguimiento
    estado: "en_formacion",
    nivelRiesgo: "alto", // En riesgo alto
    promedioAcumulado: 2.8, // Promedio bajo
    porcentajeAsistencia: 65.5, // Inasistencias
    
    // Audit Metadata
    creadoEn: new Date("2025-02-05T08:05:00Z"),
    creadoPor: "SISTEMA",
    actualizadoEn: new Date("2026-05-25T14:15:00Z"),
    actualizadoPor: "INSTR-01",
    eliminado: false,
    eliminadoEn: null
  },
  {
    id: "APR-0003",
    tipoDocumento: "CC", // Ya cumplió 18
    numeroDocumento: "1001234567",
    nombres: "Andrés Felipe",
    apellidos: "Martínez Silva",
    emailSena: "amartinezs@soy.sena.edu.co",
    emailPersonal: "andres.martinez@outlook.com",
    telefono: "320 456 7890",
    sexo: "masculino",
    fechaNacimiento: "2007-02-28T00:00:00Z",
    
    // Ubicación
    fichaId: "FICHA-003", // Contabilización
    institucionId: "INST-0002", // Normal Superior
    sedeId: "SEDE-003",
    
    // Seguimiento
    estado: "en_formacion",
    nivelRiesgo: "medio",
    promedioAcumulado: 3.5,
    porcentajeAsistencia: 82.0,
    
    // Audit Metadata
    creadoEn: new Date("2026-02-05T09:10:00Z"),
    creadoPor: "SISTEMA",
    actualizadoEn: new Date("2026-06-01T11:20:00Z"),
    actualizadoPor: "INSTR-02",
    eliminado: false,
    eliminadoEn: null
  },
  {
    id: "APR-0004",
    tipoDocumento: "TI",
    numeroDocumento: "1083444555",
    nombres: "Laura Camila",
    apellidos: "Díaz Vargas",
    emailSena: "ldiazv@soy.sena.edu.co",
    emailPersonal: "lau.diaz@gmail.com",
    telefono: "301 777 8899",
    sexo: "femenino",
    fechaNacimiento: "2009-08-10T00:00:00Z",
    
    // Ubicación
    fichaId: "FICHA-002", // Asistencia Administrativa
    institucionId: "INST-0001",
    sedeId: "SEDE-001",
    
    // Seguimiento
    estado: "retirado", // Estudiante retirada
    nivelRiesgo: "alto", // No aplica, pero se deja alto por el retiro
    promedioAcumulado: 0.0,
    porcentajeAsistencia: 10.0,
    
    // Audit Metadata
    creadoEn: new Date("2025-02-05T08:10:00Z"),
    creadoPor: "SISTEMA",
    actualizadoEn: new Date("2025-04-10T16:00:00Z"),
    actualizadoPor: "COORD-01",
    eliminado: false,
    eliminadoEn: null
  }
];
