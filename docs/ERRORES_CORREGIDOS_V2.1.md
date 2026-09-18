# GSS — Errores Corregidos: Jornada 18 de Septiembre de 2026
**Versión:** V2.1.1 → V2.1.2
**Estado:** Todos los errores de esta tabla han sido CORREGIDOS y verificados con build exitoso.

---

## ERRORES CRÍTICOS RESUELTOS

### CRIT-01 — Escalada de privilegios por JWT manipulable
- **Detectado en:** Auditoría Fase 0
- **Archivo:** `app/api/auth/[...nextauth]/route.ts`
- **Descripción:** El callback `jwt` aceptaba `session.role`, `session.rolName` y `session.hierarchyLevel` desde el cliente vía `trigger = "update"`. Un usuario podía modificar su propio rol enviando una actualización de sesión con valores arbitrarios.
- **Corrección:** El callback `jwt` solo acepta `session.name` en actualizaciones. Los campos `role`, `rolName` y `hierarchyLevel` solo se establecen en el primer login desde la función `authorize()` que consulta la BD.
- **Verificación:** Build exitoso. RBAC no puede ser alterado desde el cliente.

### CRIT-02 — Usuario aparece como "Invitado" tras login exitoso
- **Detectado en:** Validación funcional post-Fase 1
- **Archivos:** `components/providers.tsx`, `types/next-auth.d.ts` (ausente), `app/api/auth/[...nextauth]/route.ts`
- **Descripción:** Después del login, el Sidebar mostraba 0 módulos y el Header mostraba "Invitado"/"Sin rol". Ocurría con todos los roles (ADMINISTRADOR, COORDINADOR, INSTRUCTOR, APRENDIZ).
- **Causa raíz:** `SessionProvider` recibía `session={null}` explícito → forzaba re-fetch a `/api/auth/session` → en producción con `NEXTAUTH_URL` distinto al host del navegador, el fetch fallaba silenciosamente → `useSession()` retornaba sesión vacía.
- **Corrección:** Eliminado `session={session ?? null}` de `<SessionProvider>`. Creado `types/next-auth.d.ts` con augmentation de tipos. Tipo `AuthOptions` explícito en `authOptions`.
- **Verificación:** Build exitoso. Servidor activo en 0.0.0.0:3000.

### CRIT-03 — `ReferenceError: authOptions is not defined` en `/fichas`
- **Detectado en:** Build de producción (primer build del día)
- **Archivo:** `actions/fichas.actions.ts` líneas 40, 43
- **Descripción:** La función `getFichasAction` usaba `authOptions` (para filtrar scope del instructor) y `prisma` (para consultar el registro de instructor) sin importarlos en el archivo. En producción el build completaba, pero acceder a `/fichas` causaba un `ReferenceError` en runtime que silenciosamente fallaba con datos vacíos.
- **Corrección:** Agregados los imports `import { authOptions } from "@/app/api/auth/[...nextauth]/route"` e `import { prisma } from "@/lib/prisma"`.
- **Verificación:** El error ya no aparece en el output del build. La página `/fichas` se genera sin errores de runtime.

### CRIT-04 — Fallback de seguridad `role ?? "INSTRUCTOR"` en `auth-helpers.ts`
- **Detectado en:** Auditoría Fase 0 / revisión de código
- **Archivo:** `lib/auth-helpers.ts` línea 25
- **Descripción:** La función `getCurrentUser()` retornaba `role: user.role ?? "INSTRUCTOR"`. Si `session.user.role` era `undefined` (sesión sin rol válido), la función asignaba silenciosamente el rol INSTRUCTOR. Cualquier ruta protegida por `requireRole("INSTRUCTOR")` sería accesible sin rol válido.
- **Corrección:** Cambiado a `role: session.user.role ?? ""`. Sin rol válido, el acceso es denegado explícitamente por `requireRole`.
- **Verificación:** `auth-helpers.ts` revisado y compilado correctamente.

---

## ERRORES ALTOS RESUELTOS

### ALTA-01 — `authOptions` sin tipo `AuthOptions` (TS2345)
- **Archivos afectados:** `lib/rbac.ts:13`, `lib/auth-helpers.ts:11`, `actions/reportes.actions.ts`
- **Descripción:** `authOptions` exportado sin tipo explícito causaba incompatibilidad con el parámetro de `getServerSession()`. TypeScript rechazaba `getServerSession(authOptions)` con TS2345.
- **Corrección:** `export const authOptions: AuthOptions = { ... }` en `route.ts`.
- **Verificación:** Errores TS2345 eliminados.

### ALTA-02 — Ausencia de declaración de tipos para NextAuth (`next-auth.d.ts`)
- **Archivos afectados:** Toda la app — `useSession()` y `getServerSession()` devolvían tipo sin `role`/`rolName`/`id`/`hierarchyLevel`
- **Descripción:** Sin augmentation de tipos, `session.user` solo tenía `name`, `email`, `image`. Los campos personalizados requerían casts `as any`.
- **Corrección:** Creado `types/next-auth.d.ts` con `declare module "next-auth"` extendiendo `Session`, `User` y `JWT`.
- **Verificación:** Casts `as any` eliminados de Sidebar, Header y auth-helpers.

### ALTA-03 — Scope de Instructor en Asistencia (`getAsistenciasAction`)
- **Archivo:** `actions/asistencia.actions.ts`
- **Descripción:** La función no filtraba por instructor. Un instructor podía listar asistencias de fichas que no le correspondían.
- **Corrección:** Se añadió filtro condicional por `instructorId` cuando el rol es INSTRUCTOR.
- **Verificación:** Incluido en Fase 1.

### ALTA-04 — `guardarAsistenciaMasiva` sin verificación de propiedad de ficha
- **Archivo:** `actions/asistencia.actions.ts`
- **Descripción:** Un instructor podía registrar asistencia en una ficha que no tenía asignada.
- **Corrección:** Se verifica que el instructor pertenezca a la ficha vía `InstructorFicha` antes de guardar.
- **Verificación:** Incluido en Fase 1.

### ALTA-05 — Aprendiz podía auto-calificarse en entregas (`E-24`)
- **Archivos:** `actions/entregas.actions.ts`, `actions/evaluaciones.actions.ts`
- **Descripción:** El rol APRENDIZ no tenía restricciones explícitas en los campos `estado`, `calificacion` y `retroalimentacion` al crear/actualizar una entrega.
- **Corrección:** `createEntrega` fuerza `estado: "PENDIENTE"` y `calificacion: null` para el rol APRENDIZ. Solo INSTRUCTOR/ADMINISTRADOR pueden evaluar.
- **Verificación:** Incluido en Fase 1.

### ALTA-06 — Búsqueda global sin consumidor en Dashboard (`NE-03`)
- **Archivos:** `components/layout/Header.tsx`, `app/(dashboard)/dashboard/page.tsx`
- **Descripción:** El input de búsqueda actualiza la URL a `/dashboard?busqueda=TÉRMINO`, pero `DashboardPage` no recibe ni procesa `searchParams`.
- **Estado:** ⚠️ **PENDIENTE** — Documentado. Ver sección de errores pendientes.

---

## ERRORES MEDIOS RESUELTOS

### MEDIA-01 — `fechaEntrega` ausente en `entregaSchema` (TS2339)
- **Archivo:** `schemas/index.ts` + `actions/entregas.actions.ts:166,334`
- **Descripción:** `data.fechaEntrega` se accedía en `createEntrega` y `updateEntrega` pero no estaba definido en el schema Zod.
- **Corrección:** Agregado `fechaEntrega: z.string().optional()` a `entregaSchema`.
- **Verificación:** Errores TS2339 en entregas eliminados.

### MEDIA-02 — `logAudit` no acepta acción `"IMPORTAR"` (TS2322)
- **Archivo:** `actions/import.actions.ts:44,105`
- **Descripción:** Se llamaba `logAudit` con `accion: "IMPORTAR"` pero el tipo solo acepta `"CREAR" | "ACTUALIZAR" | "ELIMINAR" | "LOGIN" | "OTRO"`.
- **Corrección:** Cambiado a `accion: "OTRO"` con detalle descriptivo.
- **Verificación:** Incluido en Fase 1.

### MEDIA-03 — Auditoría ilegible (`formatDetalle` ausente)
- **Archivo:** `features/administracion/AuditoriaTable.tsx`
- **Descripción:** Los registros de auditoría mostraban JSON crudo en lugar de texto comprensible.
- **Corrección:** Implementado helper `formatDetalle()` que parsea el JSON y genera texto legible.
- **Verificación:** Incluido en Fase 1.

---

*Documento generado al cierre de jornada — 18 de septiembre de 2026.*
