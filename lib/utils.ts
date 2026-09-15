/**
 * lib/utils.ts
 * ─────────────────────────────────────────────────────────────────
 * Utilidades puras reutilizables en toda la aplicación.
 * NO importar aquí lógica de negocio, servicios ni tipos de dominio.
 * ─────────────────────────────────────────────────────────────────
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge }               from "tailwind-merge";

/* ── Fusión de clases Tailwind sin conflictos ──────────────────────
 * Combina clsx (condicionales) con twMerge (resolución de conflictos
 * de utilidades Tailwind: e.g. "px-2 px-4" → "px-4").
 * Uso: cn("base-class", condition && "conditional-class", "tw-override")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/* ── Formateo de fechas en español colombiano ──────────────────────
 * Devuelve: "14 de septiembre de 2026"
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";                              /* Valor nulo → guión tipográfico */
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";                /* Fecha inválida → guión */
  return d.toLocaleDateString("es-CO", {
    day:   "numeric",
    month: "long",
    year:  "numeric",
  });
}

/* ── Formateo de fecha corta ───────────────────────────────────────
 * Devuelve: "14/09/2026"
 */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", {
    day:   "2-digit",
    month: "2-digit",
    year:  "numeric",
  });
}

/* ── Formateo de fecha y hora ──────────────────────────────────────
 * Devuelve: "14/09/2026, 2:30 p. m."
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-CO", {
    day:    "2-digit",
    month:  "2-digit",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

/* ── Tiempo relativo ───────────────────────────────────────────────
 * Devuelve: "hace 3 días", "en 2 horas"
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d       = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  const now     = new Date();
  const diffMs  = d.getTime() - now.getTime();           /* Positivo = futuro */
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr  = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  const rtf = new Intl.RelativeTimeFormat("es-CO", { numeric: "auto" });

  if (Math.abs(diffSec) < 60)  return rtf.format(diffSec, "second");
  if (Math.abs(diffMin) < 60)  return rtf.format(diffMin, "minute");
  if (Math.abs(diffHr)  < 24)  return rtf.format(diffHr,  "hour");
  if (Math.abs(diffDay) < 30)  return rtf.format(diffDay, "day");
  if (Math.abs(diffDay) < 365) return rtf.format(Math.round(diffDay / 30), "month");
  return rtf.format(Math.round(diffDay / 365), "year");
}

/* ── Formateo de porcentaje ────────────────────────────────────────
 * Devuelve: "87,5 %" (formato colombiano con espacio)
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals).replace(".", ",")} %`;
}

/* ── Formateo de número entero con separadores de miles ───────────
 * Devuelve: "1.234" (punto como separador de miles en es-CO)
 */
export function formatNumber(value: number): string {
  return value.toLocaleString("es-CO");
}

/* ── Truncado de texto con elipsis ─────────────────────────────────
 * Uso: truncate("Texto muy largo...", 50)
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

/* ── Iniciales para avatar ─────────────────────────────────────────
 * getInitials("María Gómez López") → "MG"
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)                          /* Divide por cualquier espacio */
    .slice(0, 2)                           /* Toma máximo las 2 primeras palabras */
    .map((word) => word[0]?.toUpperCase() ?? "") /* Primera letra de cada palabra */
    .join("");
}

/* ── Slugify para IDs y claves de URL ─────────────────────────────
 * slugify("Medía Técnica SENA") → "media-tecnica-sena"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")                         /* Descompone diacríticos: é → e + ´ */
    .replace(/[\u0300-\u036f]/g, "")          /* Elimina los diacríticos */
    .replace(/[^a-z0-9\s-]/g, "")            /* Solo letras, números, espacios y guiones */
    .replace(/\s+/g, "-")                     /* Espacios → guiones */
    .replace(/-+/g, "-")                      /* Múltiples guiones → uno */
    .replace(/^-+|-+$/g, "");                 /* Elimina guiones al inicio/final */
}

/* ── Color de nivel de riesgo → clase CSS ─────────────────────────
 * Retorna la clase de badge correspondiente al nivel de riesgo.
 * IMPORTANTE: usar solo estas clases para mantener consistencia.
 */
export function getRiskBadgeClass(nivel: "bajo" | "medio" | "alto"): string {
  const mapa: Record<string, string> = {
    bajo:  "badge-riesgo-bajo",
    medio: "badge-riesgo-medio",
    alto:  "badge-riesgo-alto",
  };
  return mapa[nivel] ?? "badge-riesgo-bajo";
}

/* ── Color de estado de entidad → clase CSS ───────────────────────
 * Retorna la clase de badge correspondiente al estado.
 */
export function getStatusBadgeClass(
  estado: "activo" | "inactivo" | "pendiente" | "cancelado"
): string {
  const mapa: Record<string, string> = {
    activo:    "badge-activo",
    inactivo:  "badge-inactivo",
    pendiente: "badge-pendiente",
    cancelado: "badge-cancelado",
  };
  return mapa[estado] ?? "badge-inactivo";
}

/* ── Paginación: cálculo de páginas ───────────────────────────────
 * Retorna el slice de un array para la página/tamaño dados.
 */
export function paginate<T>(
  items: T[],
  page: number,       /* 1-indexed */
  pageSize: number
): { data: T[]; total: number; totalPages: number; page: number; pageSize: number } {
  const total      = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const safeePage  = Math.min(Math.max(1, page), totalPages || 1);
  const start      = (safeePage - 1) * pageSize;
  const data       = items.slice(start, start + pageSize);
  return { data, total, totalPages, page: safeePage, pageSize };
}

/* ── Ordenamiento genérico de arrays ──────────────────────────────
 * sortBy([...], "apellido", "asc")
 */
export function sortBy<T>(
  items: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...items].sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    if (va === vb) return 0;
    const result = va! < vb! ? -1 : 1;           /* ! = sabemos que no son undefined en comparación */
    return direction === "asc" ? result : -result;
  });
}

/* ── Filtro de búsqueda textual insensible a tildes ───────────────
 * Normaliza y compara: "aprendiz" coincide con "Aprendíz"
 */
export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); /* Elimina diacríticos para búsqueda */
}

export function matchSearch(field: string, query: string): boolean {
  return normalizeSearch(field).includes(normalizeSearch(query));
}

/* ── Generación de ID temporal para mock data ─────────────────────
 * En Fase 2 será reemplazado por UUIDs de la base de datos.
 * Uso limitado a data/ y tests.
 */
export function mockId(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(4, "0")}`;
}
