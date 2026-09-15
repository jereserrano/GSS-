/**
 * data/instituciones.mock.ts
 * ─────────────────────────────────────────────────────────────────
 * Mock data para Instituciones Educativas.
 * ─────────────────────────────────────────────────────────────────
 */
import type { Institucion } from "@/types/institucion.types";

export const mockInstituciones: Institucion[] = [
  {
    id: "INST-0001",
    nit: "890.987.654-1",
    nombre: "I.E.D. Simón Bolívar",
    rector: "Carlos Arturo López Mejía",
    telefono: "300 123 4567",
    email: "rectoria@iedsimonbolivar.edu.co",
    direccion: "Cra 14 # 22-10",
    municipio: "Santa Marta",
    departamento: "Magdalena",
    estado: "activo",
    sedes: ["SEDE-001", "SEDE-002"],
    
    // Audit Metadata
    creadoEn: new Date("2025-01-15T08:30:00Z"),
    creadoPor: "ADMIN-01",
    actualizadoEn: new Date("2025-01-15T08:30:00Z"),
    actualizadoPor: "ADMIN-01",
    eliminado: false,
    eliminadoEn: null
  },
  {
    id: "INST-0002",
    nit: "800.123.456-7",
    nombre: "Normal Superior María Auxiliadora",
    rector: "Sor Ana María Jaramillo",
    telefono: "315 987 6543",
    email: "normal@auxiliadora.edu.co",
    direccion: "Calle 10 # 5-20",
    municipio: "Santa Marta",
    departamento: "Magdalena",
    estado: "activo",
    sedes: ["SEDE-003"],
    
    // Audit Metadata
    creadoEn: new Date("2025-02-10T09:15:00Z"),
    creadoPor: "ADMIN-01",
    actualizadoEn: new Date("2025-02-10T09:15:00Z"),
    actualizadoPor: "ADMIN-01",
    eliminado: false,
    eliminadoEn: null
  },
  {
    id: "INST-0003",
    nit: "901.234.567-8",
    nombre: "I.E.D. San Juan del Sur",
    rector: "Luis Fernando Rivas",
    telefono: "301 555 4433",
    email: "contacto@iedsanjuandelsur.edu.co",
    direccion: "Vía al mar km 15",
    municipio: "Ciénaga",
    departamento: "Magdalena",
    estado: "inactivo",
    sedes: [],
    
    // Audit Metadata
    creadoEn: new Date("2024-11-05T14:20:00Z"),
    creadoPor: "ADMIN-02",
    actualizadoEn: new Date("2026-01-20T10:00:00Z"),
    actualizadoPor: "ADMIN-01",
    eliminado: false,
    eliminadoEn: null
  }
];
