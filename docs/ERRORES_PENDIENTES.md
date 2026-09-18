# GSS — Errores Pendientes de Corrección
**Versión actual:** V2.1.3
**Última actualización:** 18 de septiembre de 2026
**Estado general del sistema:** Operativo. Los errores listados aquí son mejoras y correcciones de seguridad necesarias pero el sistema funciona para uso básico.

> ⚠️ **PRIORIDAD**: Resolver NE-01 y NE-02 antes de poner en producción real con usuarios reales.

---

## 🔴 CRÍTICOS — Bloquean producción real

### PE-01 — Búsqueda global sin resultados reales
- **ID anterior:** NE-03
- **Archivos:** `components/layout/Header.tsx`, `app/(dashboard)/dashboard/page.tsx`
- **Descripción:** El buscador del Header actualiza la URL correctamente a `/dashboard?busqueda=TÉRMINO` al presionar Enter. Sin embargo, el componente `DashboardPage` (`app/(dashboard)/dashboard/page.tsx`) no está definido como página dinámica que lea `searchParams`, por lo que el término de búsqueda nunca se procesa ni muestra resultados.
- **Impacto:** La función de búsqueda global es completamente no funcional. El usuario escribe, presiona Enter, la URL cambia, pero no pasa nada.
- **Solución requerida:**
  1. Convertir `DashboardPage` para que acepte y lea `{ searchParams }` como prop.
  2. Implementar búsqueda en Prisma sobre `aprendiz`, `ficha` y `actividad` filtrando por el término.
  3. Mostrar resultados en un panel o sección del dashboard.
- **Archivos a modificar:** `app/(dashboard)/dashboard/page.tsx`, posiblemente `actions/dashboard.actions.ts`

### PE-02 — Instructor puede ver asistencias de fichas que no le corresponden
- **ID anterior:** NE-02
- **Archivo:** `actions/asistencia.actions.ts` — función `getAsistenciasAction`
- **Descripción:** Aunque `guardarAsistenciaMasiva` verifica que el instructor pertenezca a la ficha, `getAsistenciasAction` no filtra por instructor. Un instructor puede listar y ver asistencias de cualquier ficha del centro educativo.
- **Impacto:** Brecha de privacidad. Un instructor puede acceder a datos de estudiantes que no son suyos.
- **Solución requerida:**
  ```ts
  // En getAsistenciasAction, agregar:
  if (roleUpper.includes("INSTRUCT") && userRecord?.instructor?.id) {
    where.instructorId = userRecord.instructor.id;
    // o filtrar via InstructorFicha
  }
  ```
- **Archivos a modificar:** `actions/asistencia.actions.ts`

### PE-03 — Instructor puede evaluar entregas de fichas ajenas
- **ID anterior:** NE-04
- **Archivos:** `actions/entregas.actions.ts` — funciones `evaluarEntregaAction` y `updateEntrega`
- **Descripción:** Al evaluar una entrega, no se verifica que el instructor autenticado esté asignado a la ficha/actividad correspondiente. Un instructor podría modificar la calificación de un aprendiz que no pertenece a sus fichas.
- **Impacto:** Brecha de integridad académica y IDOR.
- **Solución requerida:** En `evaluarEntregaAction`, verificar que `instructorActual.id` esté en la tabla `InstructorFicha` para la ficha de la actividad de la entrega.
- **Archivos a modificar:** `actions/entregas.actions.ts`

---

## 🟠 ALTOS — Afectan seguridad o integridad

### PE-04 — `getDocumentosAction` sin scope por institución
- **ID anterior:** NE-05
- **Archivo:** `actions/documentos.actions.ts`
- **Descripción:** Todos los usuarios autenticados pueden ver todos los documentos del sistema sin importar a qué institución pertenecen. No hay filtro por `institucionId`.
- **Impacto:** Un coordinador o instructor de una institución puede ver documentos privados de otra institución.
- **Solución requerida:** Agregar filtro `where: { institucionId: userRecord.institucionId }` para roles no-admin.
- **Archivos a modificar:** `actions/documentos.actions.ts`

### PE-05 — `getConfiguracionAction` sin `requireRole`
- **ID anterior:** NE-06
- **Archivo:** `actions/configuracion.actions.ts`
- **Descripción:** La acción de lectura de configuración del sistema no tiene protección de rol. Cualquier usuario autenticado (incluyendo APRENDIZ) puede leer la configuración global del sistema.
- **Solución requerida:** Agregar `await requireRole(["ADMINISTRADOR"])` al inicio de la función.
- **Archivos a modificar:** `actions/configuracion.actions.ts`

### PE-06 — Errores TypeScript en acciones de importación (`import.actions.ts`)
- **Archivo:** `actions/import.actions.ts`
- **Errores:**
  - `TS2554` líneas 157, 205: `Expected 1 args, got 4` — función llamada con firma incorrecta
- **Descripción:** Las importaciones masivas tienen errores de TypeScript que podrían causar fallos silenciosos en ciertos escenarios de importación.
- **Solución requerida:** Revisar la firma de la función llamada en líneas 157 y 205 y corregir los argumentos.
- **Archivos a modificar:** `actions/import.actions.ts`

### PE-07 — Errores TypeScript en `dashboard.actions.ts`
- **Archivo:** `actions/dashboard.actions.ts`
- **Errores:**
  - `TS2322` líneas 118, 123, 127, 139: `{ in: string[] | undefined }` — Prisma no acepta `undefined` en filtro `in`
  - `TS2551` líneas 150, 151, 174: `.ficha` no existe, usar `.fichaId`
- **Descripción:** El dashboard usa propiedades inexistentes del tipo Prisma y pasa `undefined` en filtros que deben ser `string[]`. Pueden causar errores en runtime en ciertos filtros de KPIs.
- **Solución requerida:**
  - Usar `filter(Boolean)` antes de pasar arrays a `{ in: ... }`.
  - Cambiar `.ficha` por `.fichaId` en los selects correspondientes.
- **Archivos a modificar:** `actions/dashboard.actions.ts`

### PE-08 — Errores TypeScript en `institucion.actions.ts` y `riesgos.actions.ts`
- **Archivos:** `actions/institucion.actions.ts`, `actions/riesgos.actions.ts`
- **Errores:** `TS2304 getSessionUserId` — función removida pero aún referenciada. `TS2353 userId` — campo incorrecto en `logAudit`.
- **Descripción:** Estas acciones aún referencian la función auxiliar `getSessionUserId` que fue removida al migrar a `requireRole`. El campo `userId` no existe en la firma de `logAudit`.
- **Solución requerida:** Eliminar referencias a `getSessionUserId` y usar el usuario retornado por `requireRole`. Cambiar `userId` por `usuarioId` (o el campo correcto).
- **Archivos a modificar:** `actions/institucion.actions.ts`, `actions/riesgos.actions.ts`

### PE-09 — Subtipo de coordinador no diferenciado en RBAC
- **ID anterior:** NE-08
- **Archivos:** `lib/rbac.ts`, `lib/permissions.ts`
- **Descripción:** Los roles `COORDINADOR_SEDE`, `COORDINADOR_ACADEMICO` y `COORDINADOR_REGIONAL` tienen exactamente el mismo alcance de permisos. No existe diferenciación de acceso entre subtipos de coordinador.
- **Impacto:** Un coordinador de sede ve información de todas las sedes, no solo la suya.
- **Solución requerida:** Definir alcance por subtipo en `canAccessRoute` y `requireRole`, filtrando por `institucionId` o `sedeId` según corresponda.
- **Archivos a modificar:** `lib/permissions.ts`, `lib/rbac.ts`, múltiples Server Actions

---

## 🟡 MEDIOS — Mejoras de seguridad / UX

### PE-10 — Errores TypeScript menores (lint — no bloquean runtime)
- **Archivos:** 12+ archivos de actions
- **Tipos de errores:**
  - `TS6133`: Variables/parámetros declarados pero no usados
  - `TS2375`: `exactOptionalPropertyTypes` — objetos con campos opcionales no compatibles con Prisma
  - `TS2769`: Sobrecarga de `Date` incorrecta
  - `TS2367`: Comparación boolean vs string
- **Archivos más afectados:**
  - `actions/actividades.actions.ts` (4 errores)
  - `actions/aprendices.actions.ts` (3 errores)
  - `actions/competencias.actions.ts` (3 errores)
  - `actions/docentes.actions.ts` (4 errores)
  - `actions/instructores.actions.ts` (3 errores)
  - `actions/notificaciones.actions.ts` (3 errores)
  - `actions/programas.actions.ts` (3 errores)
  - `actions/sedes.actions.ts` (4 errores)
  - `actions/seguimientos.actions.ts` (2 errores)
  - `actions/roles.actions.ts` (2 errores)
  - `actions/resultados_aprendizaje.actions.ts` (2 errores)
  - `prisma/seed.ts` (7 errores)
  - `tailwind.config.ts` (1 error)
  - Varios `features/*.tsx` (5 errores totales)
- **Solución requerida:** Limpieza sistemática de variables no usadas, guards `?? undefined` para exactOptionalPropertyTypes, corrección de tipos de fecha.

### PE-11 — `services/fichas.service.ts` importa tipos inexistentes
- **Archivo:** `services/fichas.service.ts:2`
- **Error:** `TS2305: Module has no exported member 'Ficha', 'FiltrosFicha'`
- **Descripción:** El servicio importa tipos que fueron renombrados o eliminados del módulo `@/types`.
- **Solución requerida:** Actualizar importaciones a los tipos actuales o crear los tipos faltantes.

### PE-12 — Role flashing en carga inicial del Sidebar
- **Archivo:** `components/layout/Sidebar.tsx`
- **Descripción:** En el primer render, `status = "loading"` y `rawRole = ""`. Durante esa fracción de segundo, el Sidebar muestra 0 módulos. No es "Invitado" (se muestra "Cargando...") pero hay un flash de contenido vacío antes de que la sesión cargue.
- **Solución requerida:** Mostrar un skeleton de navegación mientras `status === "loading"` en lugar de un sidebar vacío.
- **Archivos a modificar:** `components/layout/Sidebar.tsx`

### PE-13 — Flujo de recuperación de contraseña ausente
- **Descripción:** No existe flujo de "Olvidé mi contraseña". Los usuarios que pierden acceso deben ser asistidos por un administrador.
- **Solución requerida:** Implementar endpoint de recuperación por email o al menos un flujo de reset manual con UI en el panel de administración.

### PE-14 — Mensajes internos (sistema de mensajería)
- **Descripción:** El módulo de mensajes internos entre usuarios del sistema (COORDINADOR → INSTRUCTOR, etc.) no está implementado.
- **Solución requerida:** Implementar tabla `Mensaje` en Prisma, server actions y UI de bandeja de entrada.

---

## DEUDA TÉCNICA ACUMULADA

| Área | Descripción | Prioridad |
|------|-------------|-----------|
| TypeScript | ~106 líneas de error en 25 archivos | Alta |
| RBAC Subtipos | Coordinadores sin diferenciación de alcance | Alta |
| Búsqueda global | No funcional | Alta |
| Scope asistencia | Instructor ve todo | Alta |
| Scope evaluaciones | Sin verificación de propiedad | Alta |
| Scope documentos | Sin filtro institucional | Media |
| Recuperación contraseña | No implementado | Media |
| Mensajería interna | No implementado | Baja |
| Skeleton loading | Flash de contenido vacío | Baja |

---

## ORDEN RECOMENDADO DE CORRECCIÓN (Fase 2)

```
1. PE-02 — getAsistenciasAction scope instructor          [30 min — 1 archivo]
2. PE-03 — Ownership en evaluarEntregaAction              [45 min — 1 archivo]
3. PE-01 — Búsqueda global funcional en dashboard         [2h — 2 archivos]
4. PE-04 — Scope documentos por institución               [20 min — 1 archivo]
5. PE-05 — Proteger configuración con requireRole         [10 min — 1 archivo]
6. PE-07 — Errores TypeScript dashboard.actions.ts        [30 min — 1 archivo]
7. PE-08 — Errores TypeScript institucion/riesgos         [30 min — 2 archivos]
8. PE-06 — Errores TypeScript import.actions.ts           [45 min — 1 archivo]
9. PE-10 — Limpieza de errores TypeScript lint (masivo)   [2h — 12+ archivos]
10. PE-09 — Diferenciación de subtipos coordinador        [3h — múltiples archivos]
11. PE-11 — Corrección tipos fichas.service.ts            [15 min — 1 archivo]
12. PE-12 — Skeleton loading Sidebar                      [30 min — 1 archivo]
13. PE-13 — Recuperación de contraseña                    [4h — nuevo módulo]
14. PE-14 — Mensajería interna                            [8h — nuevo módulo]
```

**Tiempo estimado total Fase 2 (correcciones de seguridad):** ~8 horas
**Tiempo estimado total Fase 2 completa (todo):** ~20 horas

---

*Documento actualizado al cierre de jornada — 18 de septiembre de 2026.*
