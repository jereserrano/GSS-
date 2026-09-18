/**
 * =============================================================================
 * scripts/test-hierarchy-security.ts
 * Suite de Pruebas de Seguridad — Jerarquía RBAC
 * GSS Media Técnica — SENA Regional Magdalena
 * =============================================================================
 *
 * Ejecutar con:
 *   npx ts-node --project tsconfig.json scripts/test-hierarchy-security.ts
 *
 * O con tsx:
 *   npx tsx scripts/test-hierarchy-security.ts
 *
 * Valida los 12 casos de prueba del plan de implementación.
 * No requiere conexión a la BD: prueba la lógica pura del motor de jerarquías.
 */

import {
  canManageUser,
  getHierarchyLevel,
  getAssignableRoles,
  HierarchyLevel,
  type CurrentUserCtx,
  type TargetUserCtx,
} from "../lib/hierarchy";

// =============================================================================
// UTILIDADES DE TEST
// =============================================================================

let passed = 0;
let failed = 0;
const results: Array<{ id: string; name: string; ok: boolean; detail: string }> = [];

function test(id: string, name: string, condition: boolean, detail: string) {
  const ok = condition;
  if (ok) passed++;
  else failed++;
  results.push({ id, name, ok, detail });
  const icon = ok ? "✅" : "❌";
  console.log(`${icon} [${id}] ${name}`);
  if (!ok) console.log(`    ⚠  Detalle: ${detail}`);
}

// =============================================================================
// CONTEXTOS DE PRUEBA
// =============================================================================

const ADMIN: CurrentUserCtx = {
  id: "admin-001",
  role: "ADMINISTRADOR",
  rolName: "Administrador del Sistema",
  estado: "ACTIVO",
};

const COORDINADOR: CurrentUserCtx = {
  id: "coord-001",
  role: "COORDINADOR",
  rolName: "Coordinador Académico",
  estado: "ACTIVO",
};

const COORD_SEDE: CurrentUserCtx = {
  id: "csede-001",
  role: "COORDINADOR_SEDE",
  rolName: "Coordinador de Sede",
  estado: "ACTIVO",
};

const APOYO: CurrentUserCtx = {
  id: "apoyo-001",
  role: "APOYO_ADMINISTRATIVO",
  rolName: "Apoyo Administrativo",
  estado: "ACTIVO",
};

const INSTRUCTOR: CurrentUserCtx = {
  id: "inst-001",
  role: "INSTRUCTOR",
  rolName: "Instructor SENA",
  estado: "ACTIVO",
};

// Targets
const TARGET_COORDINADOR: TargetUserCtx = { id: "coord-002", rolNombre: "Coordinador Académico" };
const TARGET_ADMIN: TargetUserCtx       = { id: "admin-002", rolNombre: "Administrador del Sistema" };
const TARGET_INSTRUCTOR: TargetUserCtx  = { id: "inst-002",  rolNombre: "Instructor SENA" };

// =============================================================================
// 12 CASOS DE PRUEBA
// =============================================================================

console.log("\n════════════════════════════════════════════════════════════════");
console.log("  SUITE DE SEGURIDAD — JERARQUÍA RBAC — GSS Media Técnica");
console.log("════════════════════════════════════════════════════════════════\n");

// [TEST 01] Instructor intentando eliminar Coordinador → 403 Forbidden
{
  const r = canManageUser(INSTRUCTOR, TARGET_COORDINADOR, "ELIMINAR_USUARIO");
  test("TEST 01", "Instructor elimina Coordinador → 403", !r.allowed && r.httpStatus === 403,
    `allowed=${r.allowed}, status=${r.httpStatus}, reason=${r.reason}`);
}

// [TEST 02] Instructor intentando modificar Administrador → 403 Forbidden
{
  const r = canManageUser(INSTRUCTOR, TARGET_ADMIN, "MODIFICAR_USUARIO");
  test("TEST 02", "Instructor modifica Administrador → 403", !r.allowed && r.httpStatus === 403,
    `allowed=${r.allowed}, status=${r.httpStatus}`);
}

// [TEST 03] Instructor intentando cambiar rol de un usuario → 403
{
  const r = canManageUser(INSTRUCTOR, TARGET_INSTRUCTOR, "CAMBIAR_ROL", { newRolNombre: "Instructor SENA" });
  test("TEST 03", "Instructor cambia rol → 403", !r.allowed && r.httpStatus === 403,
    `allowed=${r.allowed}, reason=${r.reason}`);
}

// [TEST 04] Coordinador de Sede modificando Coordinador Académico → 403
{
  const r = canManageUser(COORD_SEDE, TARGET_COORDINADOR, "MODIFICAR_USUARIO");
  test("TEST 04", "Coord. Sede modifica Coordinador → 403", !r.allowed && r.httpStatus === 403,
    `allowed=${r.allowed}, current=${HierarchyLevel.COORDINADOR_SEDE}, target=${HierarchyLevel.COORDINADOR}`);
}

// [TEST 05] Coordinador Académico modificando Administrador → 403
{
  const r = canManageUser(COORDINADOR, TARGET_ADMIN, "MODIFICAR_USUARIO");
  test("TEST 05", "Coordinador modifica Administrador → 403", !r.allowed && r.httpStatus === 403,
    `allowed=${r.allowed}`);
}

// [TEST 06] Auto-escalamiento: usuario eleva su propio rol → 403
{
  const selfCtx: TargetUserCtx = { id: INSTRUCTOR.id, rolNombre: "Instructor SENA" };
  const r = canManageUser(INSTRUCTOR, selfCtx, "CAMBIAR_ROL", { newRolNombre: "Coordinador Académico" });
  test("TEST 06", "Self-Escalation (cambiar propio rol) → 403", !r.allowed && r.httpStatus === 403,
    `allowed=${r.allowed}, reason=${r.reason}`);
}

// [TEST 07] Coordinador intenta asignarse permisos superiores (auto-estado) → 403
{
  const selfCtx: TargetUserCtx = { id: COORDINADOR.id, rolNombre: "Coordinador Académico" };
  const r = canManageUser(COORDINADOR, selfCtx, "CAMBIAR_ESTADO");
  test("TEST 07", "Auto-cambio de estado (auto-escalación) → 403", !r.allowed && r.httpStatus === 403,
    `allowed=${r.allowed}`);
}

// [TEST 08] Usuario no autenticado (null) → 401 Unauthorized
{
  const r = canManageUser(null, TARGET_INSTRUCTOR, "MODIFICAR_USUARIO");
  test("TEST 08", "Sin sesión → 401 Unauthorized", !r.allowed && r.httpStatus === 401,
    `allowed=${r.allowed}, status=${r.httpStatus}`);
}

// [TEST 09] Admin modificando Instructor → 200 OK (operación permitida)
{
  const r = canManageUser(ADMIN, TARGET_INSTRUCTOR, "MODIFICAR_USUARIO");
  test("TEST 09", "Admin modifica Instructor → Permitido", r.allowed === true,
    `allowed=${r.allowed}`);
}

// [TEST 10] Coordinador intentando asignar rol de Administrador → 403
{
  const r = canManageUser(COORDINADOR, TARGET_INSTRUCTOR, "CAMBIAR_ROL", {
    newRolNombre: "Administrador del Sistema",
  });
  test("TEST 10", "Coordinador asigna rol Admin → 403", !r.allowed && r.httpStatus === 403,
    `allowed=${r.allowed}, reason=${r.reason}`);
}

// [TEST 11] Apoyo Administrativo no puede gestionar usuarios (nivel 3 sin capacidad)
{
  const r = canManageUser(APOYO, TARGET_INSTRUCTOR, "MODIFICAR_USUARIO");
  test("TEST 11", "Apoyo Admin no puede gestionar usuarios → 403", !r.allowed && r.httpStatus === 403,
    `allowed=${r.allowed}, reason=${r.reason}`);
}

// [TEST 12] Payload manipulado: target es Admin pero solicitante es Instructor → 403
{
  const manipulatedTarget: TargetUserCtx = { id: "admin-999", rolNombre: "Administrador del Sistema" };
  const r = canManageUser(INSTRUCTOR, manipulatedTarget, "ELIMINAR_USUARIO");
  test("TEST 12", "Payload manipulado (target=Admin, current=Instructor) → 403",
    !r.allowed && r.httpStatus === 403,
    `allowed=${r.allowed}, status=${r.httpStatus}`);
}

// =============================================================================
// PRUEBAS ADICIONALES: getHierarchyLevel y getAssignableRoles
// =============================================================================

console.log("\n── Pruebas de getHierarchyLevel ──────────────────────────────────\n");

test("LEVEL 01", "getHierarchyLevel('Administrador del Sistema') = 1",
  getHierarchyLevel("Administrador del Sistema") === 1,
  `result=${getHierarchyLevel("Administrador del Sistema")}`);

test("LEVEL 02", "getHierarchyLevel('Coordinador Académico') = 2",
  getHierarchyLevel("Coordinador Académico") === 2,
  `result=${getHierarchyLevel("Coordinador Académico")}`);

test("LEVEL 03", "getHierarchyLevel('Apoyo Administrativo') = 3",
  getHierarchyLevel("Apoyo Administrativo") === 3,
  `result=${getHierarchyLevel("Apoyo Administrativo")}`);

test("LEVEL 04", "getHierarchyLevel('Coordinador de Sede') = 3",
  getHierarchyLevel("Coordinador de Sede") === 3,
  `result=${getHierarchyLevel("Coordinador de Sede")}`);

test("LEVEL 05", "getHierarchyLevel('Instructor SENA') = 4",
  getHierarchyLevel("Instructor SENA") === 4,
  `result=${getHierarchyLevel("Instructor SENA")}`);

test("LEVEL 06", "getHierarchyLevel('Aprendiz') = 5",
  getHierarchyLevel("Aprendiz") === 5,
  `result=${getHierarchyLevel("Aprendiz")}`);

test("LEVEL 07", "getHierarchyLevel(null) = 99 (desconocido)",
  getHierarchyLevel(null) === 99,
  `result=${getHierarchyLevel(null)}`);

console.log("\n── Pruebas de getAssignableRoles ─────────────────────────────────\n");

const allRolesMock = [
  { id: "r1", nombre: "Administrador del Sistema" },
  { id: "r2", nombre: "Coordinador Académico" },
  { id: "r3", nombre: "Coordinador de Sede" },
  { id: "r4", nombre: "Apoyo Administrativo" },
  { id: "r5", nombre: "Instructor SENA" },
  { id: "r6", nombre: "Aprendiz" },
];

const rolesForAdmin = getAssignableRoles("Administrador del Sistema", allRolesMock);
test("ASSIGN 01", "Admin puede asignar: Coord, CoordSede, Apoyo, Instructor, Aprendiz (5 roles)",
  rolesForAdmin.length === 5,
  `roles asignables por Admin: ${rolesForAdmin.map(r => r.nombre).join(", ")}`);

const rolesForCoord = getAssignableRoles("Coordinador Académico", allRolesMock);
test("ASSIGN 02", "Coordinador puede asignar: CoordSede, Apoyo, Instructor, Aprendiz (4 roles)",
  rolesForCoord.length === 4,
  `roles asignables por Coordinador: ${rolesForCoord.map(r => r.nombre).join(", ")}`);

const rolesForInstructor = getAssignableRoles("Instructor SENA", allRolesMock);
test("ASSIGN 03", "Instructor NO puede asignar ningún rol (0 roles)",
  rolesForInstructor.length === 0,
  `roles: ${rolesForInstructor.length}`);

const rolesForApoyo = getAssignableRoles("Apoyo Administrativo", allRolesMock);
test("ASSIGN 04", "Apoyo Admin NO puede asignar ningún rol (0 roles)",
  rolesForApoyo.length === 0,
  `roles: ${rolesForApoyo.length}`);

// =============================================================================
// RESUMEN FINAL
// =============================================================================

const total = passed + failed;
console.log("\n════════════════════════════════════════════════════════════════");
console.log(`  RESULTADO FINAL: ${passed}/${total} pruebas pasaron`);
if (failed > 0) {
  console.log(`  ❌ FALLIDAS: ${failed}`);
  console.log("  Las pruebas fallidas indican una regresión en el motor de seguridad.");
} else {
  console.log("  ✅ TODAS LAS PRUEBAS DE SEGURIDAD PASARON CORRECTAMENTE");
}
console.log("════════════════════════════════════════════════════════════════\n");

process.exit(failed > 0 ? 1 : 0);
