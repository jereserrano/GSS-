/**
 * data/sedes.mock.ts
 * ─────────────────────────────────────────────────────────────────
 * Mock data para Sedes de Instituciones Educativas.
 * ─────────────────────────────────────────────────────────────────
 */
import type { Sede } from "@/types/sede.types";

export const mockSedes: Sede[] = [
  {
    id: "SEDE-001",
    institucionId: "INST-0001", // I.E.D. Simón Bolívar
    nombre: "Sede Principal (Bachillerato)",
    direccion: "Cra 14 # 22-10",
    coordinador: "Martha Lucía Gómez",
    telefono: "300 123 4567 ext 1",
    email: "coordinacion1@iedsimonbolivar.edu.co",
    estado: "activo",
    
    // Audit Metadata
    creadoEn: new Date("2025-01-15T08:35:00Z"),
    creadoPor: "ADMIN-01",
    actualizadoEn: new Date("2025-01-15T08:35:00Z"),
    actualizadoPor: "ADMIN-01",
    eliminado: false,
    eliminadoEn: null
  },
  {
    id: "SEDE-002",
    institucionId: "INST-0001", // I.E.D. Simón Bolívar
    nombre: "Sede B (Básica Primaria)",
    direccion: "Calle 24 # 13-45",
    coordinador: "José Ramiro Vives",
    telefono: "300 123 4568",
    email: "coordinacion2@iedsimonbolivar.edu.co",
    estado: "inactivo",
    
    // Audit Metadata
    creadoEn: new Date("2025-01-15T08:40:00Z"),
    creadoPor: "ADMIN-01",
    actualizadoEn: new Date("2026-03-01T10:00:00Z"),
    actualizadoPor: "ADMIN-01",
    eliminado: false,
    eliminadoEn: null
  },
  {
    id: "SEDE-003",
    institucionId: "INST-0002", // Normal Superior María Auxiliadora
    nombre: "Campus Principal",
    direccion: "Calle 10 # 5-20",
    coordinador: "Sor Teresita de Jesús",
    telefono: "315 987 6543 ext 2",
    email: "academica@auxiliadora.edu.co",
    estado: "activo",
    
    // Audit Metadata
    creadoEn: new Date("2025-02-10T09:20:00Z"),
    creadoPor: "ADMIN-01",
    actualizadoEn: new Date("2025-02-10T09:20:00Z"),
    actualizadoPor: "ADMIN-01",
    eliminado: false,
    eliminadoEn: null
  }
];
