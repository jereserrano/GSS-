/**
 * data/fichas.mock.ts
 * ─────────────────────────────────────────────────────────────────
 * Mock data para Fichas (Grupos de formación).
 * ─────────────────────────────────────────────────────────────────
 */
import type { Ficha } from "@/types/ficha.types";

export const mockFichas: Ficha[] = [
  {
    id: "FICHA-001",
    codigo: "2987654",
    programaId: "PROG-001", // Técnico en Sistemas
    institucionId: "INST-0001", // I.E.D. Simón Bolívar
    sedeId: "SEDE-001",
    fechaInicio: "2025-02-01T00:00:00Z",
    fechaFin: "2026-11-30T23:59:59Z",
    estado: "activo",
    
    // KPIs precalculados (para la vista rápida del dashboard)
    totalAprendices: 35,
    aprendicesRiesgoAlto: 3,
    promedioAsistencia: 88.5,
    nivelRiesgoGeneral: "medio",
    
    // Audit Metadata
    creadoEn: new Date("2025-01-20T10:00:00Z"),
    creadoPor: "COORD-01",
    actualizadoEn: new Date("2026-04-15T16:20:00Z"),
    actualizadoPor: "SISTEMA",
    eliminado: false,
    eliminadoEn: null
  },
  {
    id: "FICHA-002",
    codigo: "2987655",
    programaId: "PROG-002", // Asistencia Administrativa
    institucionId: "INST-0001", // I.E.D. Simón Bolívar
    sedeId: "SEDE-001",
    fechaInicio: "2025-02-01T00:00:00Z",
    fechaFin: "2026-11-30T23:59:59Z",
    estado: "activo",
    
    // KPIs precalculados
    totalAprendices: 40,
    aprendicesRiesgoAlto: 1,
    promedioAsistencia: 95.2,
    nivelRiesgoGeneral: "bajo",
    
    // Audit Metadata
    creadoEn: new Date("2025-01-20T10:05:00Z"),
    creadoPor: "COORD-01",
    actualizadoEn: new Date("2026-04-15T16:20:00Z"),
    actualizadoPor: "SISTEMA",
    eliminado: false,
    eliminadoEn: null
  },
  {
    id: "FICHA-003",
    codigo: "3100222",
    programaId: "PROG-003", // Contabilización
    institucionId: "INST-0002", // Normal Superior
    sedeId: "SEDE-003",
    fechaInicio: "2026-02-01T00:00:00Z",
    fechaFin: "2027-11-30T23:59:59Z",
    estado: "activo",
    
    // KPIs precalculados
    totalAprendices: 28,
    aprendicesRiesgoAlto: 5,
    promedioAsistencia: 72.4, // Asistencia baja -> Riesgo alto
    nivelRiesgoGeneral: "alto",
    
    // Audit Metadata
    creadoEn: new Date("2026-01-15T09:30:00Z"),
    creadoPor: "COORD-02",
    actualizadoEn: new Date("2026-05-10T11:45:00Z"),
    actualizadoPor: "SISTEMA",
    eliminado: false,
    eliminadoEn: null
  }
];
