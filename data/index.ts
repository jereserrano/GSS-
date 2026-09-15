/**
 * data/index.ts
 * ─────────────────────────────────────────────────────────────────
 * Archivo central para re-exportar toda la mock data.
 * También implementa funciones helper para resolver las relaciones
 * entre entidades, simulando un JOIN de base de datos.
 * ─────────────────────────────────────────────────────────────────
 */
import { mockInstituciones } from "./instituciones.mock";
import { mockSedes } from "./sedes.mock";
import { mockProgramas } from "./programas.mock";
import { mockFichas } from "./fichas.mock";
import { mockAprendices } from "./aprendices.mock";

export {
  mockInstituciones,
  mockSedes,
  mockProgramas,
  mockFichas,
  mockAprendices
};

/* ── Helpers para resolver relaciones (Simulación de ORM) ───────── */

/**
 * Resuelve las relaciones de una Ficha (Programa, Institución, Sede).
 */
export function hydrateFicha(fichaId: string) {
  const ficha = mockFichas.find(f => f.id === fichaId);
  if (!ficha) return null;

  return {
    ...ficha,
    programa: mockProgramas.find(p => p.id === ficha.programaId),
    institucion: mockInstituciones.find(i => i.id === ficha.institucionId),
    sede: mockSedes.find(s => s.id === ficha.sedeId),
  };
}

/**
 * Resuelve las relaciones de un Aprendiz (Ficha, Institución, Sede).
 */
export function hydrateAprendiz(aprendizId: string) {
  const aprendiz = mockAprendices.find(a => a.id === aprendizId);
  if (!aprendiz) return null;

  return {
    ...aprendiz,
    ficha: hydrateFicha(aprendiz.fichaId) ?? undefined,
    institucion: mockInstituciones.find(i => i.id === aprendiz.institucionId),
    sede: mockSedes.find(s => s.id === aprendiz.sedeId),
  };
}
