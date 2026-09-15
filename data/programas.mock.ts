/**
 * data/programas.mock.ts
 * ─────────────────────────────────────────────────────────────────
 * Mock data para Programas de Formación (Media Técnica).
 * ─────────────────────────────────────────────────────────────────
 */
import type { Programa } from "@/types/programa.types";

export const mockProgramas: Programa[] = [
  {
    id: "PROG-001",
    codigo: "228106",
    version: "2",
    nombre: "Técnico en Sistemas",
    nivel: "tecnico",
    duracionMeses: 24,
    estado: "activo",
    
    // Audit Metadata
    creadoEn: new Date("2024-06-15T08:00:00Z"),
    creadoPor: "SISTEMA",
    actualizadoEn: new Date("2024-06-15T08:00:00Z"),
    actualizadoPor: "SISTEMA",
    eliminado: false,
    eliminadoEn: null
  },
  {
    id: "PROG-002",
    codigo: "122115",
    version: "1",
    nombre: "Técnico en Asistencia Administrativa",
    nivel: "tecnico",
    duracionMeses: 24,
    estado: "activo",
    
    // Audit Metadata
    creadoEn: new Date("2024-06-15T08:05:00Z"),
    creadoPor: "SISTEMA",
    actualizadoEn: new Date("2024-06-15T08:05:00Z"),
    actualizadoPor: "SISTEMA",
    eliminado: false,
    eliminadoEn: null
  },
  {
    id: "PROG-003",
    codigo: "331301",
    version: "3",
    nombre: "Técnico en Contabilización de Operaciones Comerciales y Financieras",
    nivel: "tecnico",
    duracionMeses: 24,
    estado: "activo",
    
    // Audit Metadata
    creadoEn: new Date("2024-06-15T08:10:00Z"),
    creadoPor: "SISTEMA",
    actualizadoEn: new Date("2024-06-15T08:10:00Z"),
    actualizadoPor: "SISTEMA",
    eliminado: false,
    eliminadoEn: null
  }
];
