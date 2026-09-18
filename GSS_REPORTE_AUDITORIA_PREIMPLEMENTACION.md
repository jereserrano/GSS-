# GSS — REPORTE DE AUDITORÍA PREIMPLEMENTACIÓN
**Sistema de Gestión y Seguimiento Académico — SENA Regional Magdalena**  
*Fecha de Auditoría:* 17 de Septiembre de 2026  
*Auditor:* Arquitecto de Software Senior & Ingeniero Full Stack / Base de Datos  
*Proyecto:* `C:\Users\Janai\Desktop\GSS\gss`  
*Branch activa:* `version-1` (Commit `3944d59`)

---

## 1. ESTADO REAL DEL PROYECTO

### 1.1 Repositorio y Git
- **Rama actual:** `version-1` (sincronizada con `origin/version-1`).
- **Ramas locales existentes:** `develop`, `main`, `version-1`.
- **Historial reciente:**
  - `3944d59` — *V1.1 - Sistema RBAC jerárquico, SecurityGuard, mejoras de presentación, auditoría y roles*
  - `100b635` — *feat: version 1 del proyecto GSS*
- **Estado de trabajo:** Limpio (`working tree clean`).

### 1.2 Compilación y Linters (Diagnóstico de Salud Técnica)
Al ejecutar la verificación estricta de tipos de TypeScript (`tsc --noEmit`), se detectaron **28 errores de compilación preexistentes** en el repositorio:
1. **Ruta de autenticación (`app/api/auth/[...nextauth]/route.ts`):** 
   - Se exporta `export const authOptions = {...}` directamente desde un Route Handler del App Router de Next.js 15. En Next.js App Router, los archivos `route.ts` únicamente pueden exportar funciones HTTP (`GET`, `POST`, etc.). Esto genera `error TS2344: Type OmitWithTag... does not satisfy the constraint '{ [x: string]: never; }'`.
   - `session.strategy: "jwt"` se infiere como `string` genérico en lugar del tipo literal `SessionStrategy` (`"jwt"`).
2. **Auditoría en Server Actions (`evaluaciones.actions.ts`, `institucion.actions.ts`, `riesgos.actions.ts`):**
   - El helper `logAudit` requiere `usuarioId: string`, pero `user.id` puede ser `string | null`, arrojando `error TS2322`.
3. **Servicios desincronizados (`services/fichas.service.ts`):**
   - Importa `Ficha` y `FiltrosFicha` desde `@/types/institucion.types`, pero allí no están exportados (`error TS2305`).
4. **Formulario de Seguimiento (`features/seguimiento/SeguimientoFormDialog.tsx`):**
   - Línea 97 intenta acceder a `institucion.codigo` cuando el tipo seleccionado solo provee `{ id, nombre }` (`error TS2339`).
5. **Configuración de Linter (`eslint.config.mjs`):**
   - Se configuró `@typescript-eslint/no-floating-promises: "error"` sin habilitar las opciones de parser con información de tipos (`parserOptions.project`), lo que provoca que `next lint` falle inmediatamente al ejecutarse.
6. **Tailwind (`tailwind.config.ts`):**
   - `darkMode: ["class"]` genera incompatibilidad de tipos con Tailwind CSS v4 / tipados v3.

---

## 2. INVENTARIO REAL DE COMPONENTES, MÓDULOS Y SERVICIOS (FASE 0.1)

| Área / Módulo | Estado Actual | Evidencia en Código Real | Problemas Críticos Identificados |
| :--- | :--- | :--- | :--- |
| **Autenticación (NextAuth)** | `[PARCIAL]` | `app/api/auth/[...nextauth]/route.ts`<br>`components/providers.tsx` | `NEXTAUTH_URL` en `.env` tiene IP fija `10.8.182.178:3000`. Si se navega por `localhost`, la sesión se anula. En recarga, `Providers` no recibe sesión SSR, causando parpadeo de rol y pérdida de sesión. |
| **Autorización (RBAC)** | `[PARCIAL]` | `lib/hierarchy.ts`<br>`lib/permissions.ts`<br>`middleware.ts` | Solo 3 Server Actions usan `requireRole`. Las otras 16 mutan datos sin validar rol ni sede. `hierarchy.ts` solo maneja gestión de usuarios. No existe matriz de permisos `ROL × MÓDULO × ACCIÓN`. |
| **Instituciones** | `[FUNCIONAL]` | `app/(dashboard)/instituciones`<br>`actions/institucion.actions.ts` | CRUD conectado a Prisma MySQL y revalidación operativa. Falta aislamiento por ámbito regional. |
| **Sedes** | `[PARCIAL]` | `app/(dashboard)/sedes`<br>`actions/sedes.actions.ts` | Al crear sede solo revalida `/sedes`, no revalida `/fichas`. Falta restricción para que solo Coordinador Regional pueda crearlas. |
| **Programas** | `[FUNCIONAL]` | `app/(dashboard)/programas`<br>`actions/programas.actions.ts` | CRUD funcional. Conectado a Prisma. |
| **Fichas** | `[PARCIAL]` | `app/(dashboard)/fichas`<br>`features/fichas/FichaFormDialog.tsx` | El dropdown de sedes no se refresca si se crean nuevas sedes. La relación Sede-Institución no permite creación en cascada. |
| **Aprendices (Gestión)** | `[FUNCIONAL]` | `app/(dashboard)/aprendices`<br>`actions/aprendices.actions.ts` | CRUD conectado a Prisma. No existe importación masiva. |
| **Módulo Aprendiz (Portal)** | `[NO IMPLEMENTADO]` | Sin rutas en `app/(dashboard)` | No existe portal del aprendiz (certificaciones, eventos, correo, ruta, encuestas). `Aprendiz` no tiene relación con `User`. |
| **Instructores** | `[FUNCIONAL]` | `app/(dashboard)/instructores`<br>`actions/instructores.actions.ts` | Tabla conectada a Prisma. No tienen cuenta de usuario creada en seed. |
| **Competencias** | `[PARCIAL]` | `app/(dashboard)/competencias`<br>`actions/competencias.actions.ts` | CRUD individual y exportación CSV funcionan. No existe importación de competencias ni validación de permisos en Server Actions. |
| **Resultados de Aprendizaje (RAP)** | `[FUNCIONAL]` | `app/(dashboard)/resultados-aprendizaje` | CRUD funcional conectado a `Competencia`. |
| **Plan de Formación** | `[PARCIAL]` | `app/(dashboard)/plan-formacion`<br>`PlanFormacionTimeline.tsx` | Es 100% de solo lectura. Permite seleccionar programas, pero no permite asignar fichas ni transversales a instructores. |
| **Actividades** | `[PARCIAL]` | `actions/actividades.actions.ts` | Server Action no valida permisos ni si el instructor está asignado a la ficha. |
| **Entregas** | `[PARCIAL]` | `actions/entregas.actions.ts` | Sin validación de rol. Calificación básica. |
| **Asistencia** | `[ROTO]` | `actions/asistencia.actions.ts`<br>`features/ejecucion/AsistenciaTable.tsx` | **Bug Crítico:** La BD solo guarda totales numéricos (`totalPresentes`, etc.). `AsistenciaTable` busca `a.registros` inexistente. El Administrador y los usuarios no pueden ver ni registrar la asistencia de los aprendices individuales. |
| **Evaluaciones** | `[FUNCIONAL]` | `actions/evaluaciones.actions.ts` | Registra juicios (`APROBADO`, `DEFICIENTE`, `PENDIENTE`). |
| **Resultados** | `[PARCIAL]` | `app/(dashboard)/resultados/page.tsx` | Se conectó en V1.1 a Prisma, pero cuenta totales globales sin filtro de sede/programa y usa barras CSS en vez de gráficos interactivos. |
| **Seguimiento (Visitas)** | `[PARCIAL]` | `app/(dashboard)/seguimiento` | Maneja visitas institucionales (`institucionNombre`), pero el requisito exige seguimiento orientado a aprendices. |
| **Riesgos** | `[FUNCIONAL]` | `actions/riesgos.actions.ts` | CRUD funcional de alertas tempranas. |
| **Reportes** | `[FUNCIONAL]` | `actions/reportes.actions.ts` | Genera reportes de aprendices, fichas y rendimiento. |
| **Búsqueda Global** | `[SIMULADO]` | `components/layout/Header.tsx` (líneas 100-104) | Input estático sin `onChange`, sin estado, sin endpoints, sin filtrado por rol. |
| **Notificaciones** | `[SIMULADO]` | `components/layout/Header.tsx` (líneas 21-46) | Lista fija hardcodeada con datos simulados expuestos a cualquier usuario sin autenticación. |
| **Configuración** | `[SIMULADO]` | `features/administracion/ConfiguracionForm.tsx` (línea 17) | `// Simular guardado con delay realista`. No existe persistencia en BD (`schema.prisma` carece de modelo). |
| **Secretaría** | `[NO IMPLEMENTADO]` | Sin rutas ni acciones | Rol y módulo inexistentes. |
| **Estructura Regional** | `[NO IMPLEMENTADO]` | Sin modelos ni aislamiento | No existen roles ni alcance para Coordinador Regional ni Subdirector Regional. |
| **Mensajería Jerárquica** | `[NO IMPLEMENTADO]` | Sin rutas ni modelos | No existe mensajería interna. |
| **Clases Virtuales** | `[NO IMPLEMENTADO]` | Sin rutas ni modelos | Inexistente. |
| **API Routes Públicas** | `[ROTO]` (Seguridad) | `app/api/aprendices/route.ts` | No tienen autenticación ni autorización. Permiten exfiltrar datos completos sin login. |

---

## 3. COMPARACIÓN DETALLADA: DOCUMENTOS VS CÓDIGO REAL (FASE 0.2)

### BUG 01 — ADMINISTRADOR NO VE ASISTENCIAS DE LOS APRENDICES
- **Requisito en Documento:** *"Como admin no puedo ver las asistencias de los aprendices"*.
- **Estado Real en Código:** `[CONFIRMADO — ROTO]`
- **Archivos Afectados:**
  - `prisma/schema.prisma` (modelo `Asistencia`)
  - `actions/asistencia.actions.ts`
  - `features/ejecucion/AsistenciaTable.tsx` (líneas 116–122)
  - `features/ejecucion/AsistenciaFormDialog.tsx`
- **Causa Raíz:** En `schema.prisma`, la tabla `asistencias` únicamente almacena contadores agregados (`totalPresentes`, `totalFaltas`, `totalExcusas`), pero **NO existe la entidad ni la relación para el detalle por aprendiz** (`RegistroAsistencia` o `DetalleAsistencia`). En `AsistenciaTable.tsx`, el código intenta leer `a.registros` (el cual no existe en la base de datos), por lo que siempre evalúa en 0 y es imposible visualizar o registrar la asistencia individual de cada aprendiz.
- **Solución Técnica:** Crear el modelo `RegistroAsistencia` (`id`, `asistenciaId`, `aprendizId`, `estado: ASISTIO | FALTA | EXCUSA`, `observaciones`) con relación a `Asistencia` y `Aprendiz`. Adaptar la UI y Server Action para registrar y listar la asistencia nominal de los aprendices.

---

### BUG 02 — IMPORTACIÓN DE COMPETENCIAS
- **Requisito en Documento:** *"En rol de instructores sub modulo de competencias debe haber una opción de importar competencias"*.
- **Contradicción Documental Detectada:** En un apartado del documento se solicita importación para instructores, mientras que la auditoría arquitectónica y la regla institucional SENA establecen que la estructura curricular (Competencias y RAPs) es competencia exclusiva de la Coordinación Académica, restringiendo al Instructor y Coordinador de Sede para evitar alteraciones no autorizadas del diseño curricular.
- **Estado Real en Código:** `[PARCIAL / NO IMPLEMENTADO]`
- **Archivos Afectados:**
  - `actions/competencias.actions.ts`
  - `features/academico/CompetenciasTable.tsx`
- **Causa Raíz:** Solo existe `exportCompetenciasCSV()`. No existe función de importación ni componente en la UI.
- **Solución Técnica:** Implementar importador de competencias con validación CSV/Excel, pero restringido estrictamente al rol `COORDINADOR_ACADEMICO` y `ADMINISTRADOR` para preservar la integridad académica SENA.

---

### BUG 03 — IMPORTACIONES MASIVAS REUTILIZABLES
- **Requisito en Documento:** *"Tener la opción importar en competencias, resultados de aprendizaje, aprendices, entregas, y asistencias esto en todos los submodulos que necesiten datos masivos"*.
- **Estado Real en Código:** `[NO IMPLEMENTADO]`
- **Causa Raíz:** No existe una utilidad centralizada de procesamiento masivo. Cada módulo actual maneja solo creación individual.
- **Solución Técnica:** Crear un motor unificado en `lib/importer/` que gestione validación por esquema Zod fila por fila, detección de duplicados, transacciones con rollback atómico en Prisma y reporte estructurado de errores (`{ fila, campo, error }`).

---

### BUG 04 — SESIÓN Y PÉRDIDA DE ROL
- **Requisito en Documento:** *"Después de unos minutos de haber iniciado sesión los usuarios quedan sin rol como si su sesión se cerrara y tienen que volver a iniciar sesión"*.
- **Estado Real en Código:** `[CONFIRMADO — ROTO]`
- **Archivos Afectados:**
  - `.env` y `.env.local`
  - `app/api/auth/[...nextauth]/route.ts`
  - `components/providers.tsx`
  - `app/layout.tsx`
  - `components/layout/Header.tsx` (líneas 54–56)
  - `components/layout/Sidebar.tsx` (línea 100)
- **Causa Raíz Multimodal:**
  1. `NEXTAUTH_URL` está fijada como `http://10.8.182.178:3000`. Al acceder desde `localhost:3000` o IP dinámica, las cookies de sesión y CSRF son rechazadas por disparidad de host.
  2. `RootLayout` no pasa la sesión del servidor a `<Providers>`, dejando al cliente sin sesión inicial durante la hidratación.
  3. Durante el refresco en segundo plano de NextAuth (`status === "loading"`), `Header.tsx` asigna `"Sin rol"` y `Sidebar.tsx` asigna `"INSTRUCTOR"` por defecto, ocultando visualmente los accesos y dando la apariencia de sesión caída.
  4. En `route.ts`, la exportación de `authOptions` rompe el type-check del App Router.
- **Solución Técnica:** Normalizar `authOptions` en `lib/auth.ts`, corregir detección de host dinámico en `NEXTAUTH_URL`, alimentar `SessionProvider` con sesión del servidor y manejar estados de carga sin degradar el rol a `"Sin rol"`.

---

### BUG 05 — BÚSQUEDA GLOBAL DEL SOFTWARE
- **Requisito en Documento:** *"La búsqueda del software no funciona en ningún rol"*.
- **Estado Real en Código:** `[CONFIRMADO — SIMULADO]`
- **Archivos Afectados:**
  - `components/layout/Header.tsx` (línea 100)
- **Causa Raíz:** El `<Input>` en `Header.tsx` es una maqueta puramente visual; carece de eventos, estado y lógica de consulta.
- **Solución Técnica:** Crear un Server Action / API de búsqueda segura con debounce y filtrado estricto por el ámbito del rol del usuario (Sede, Ficha, Programa), mostrando un modal de resultados rápidos (aprendices, fichas, programas).

---

### BUG 06 — NOTIFICACIONES EXPUESTAS SIN AUTENTICACIÓN
- **Requisito en Documento:** *"Cuando un usuario recarga la página le aparecen notificaciones eso no debería pasar si no estás logueado no deben aparecer notificaciones del sistema"*.
- **Estado Real en Código:** `[CONFIRMADO — SIMULADO Y VULNERABLE]`
- **Archivos Afectados:**
  - `components/layout/Header.tsx` (líneas 21–46)
  - `app/(dashboard)/notificaciones/page.tsx`
- **Causa Raíz:** La lista `NOTIFICACIONES_INICIALES` está embebida de forma estática en el código del cliente con nombres reales y datos ficticios de aprendices. Se renderiza sin comprobar sesión.
- **Solución Técnica:** Crear el modelo `Notificacion` en Prisma (`userId`, `titulo`, `mensaje`, `leida`, `tipo`, `creadoEn`), obtener las notificaciones exclusivamente desde el backend para el usuario autenticado y proteger la vista.

---

### BUG 07 — SEDES NO APARECEN AL CREAR FICHA
- **Requisito en Documento:** *"En el módulo de programa yo agrego un programa normal y cuando voy a agregar una ficha coloco la institución voy a buscar la sede, no me sale..."*.
- **Estado Real en Código:** `[CONFIRMADO — DEFICIENCIA DE FLUJO Y CACHÉ]`
- **Archivos Afectados:**
  - `app/(dashboard)/fichas/page.tsx`
  - `features/fichas/FichaFormDialog.tsx`
  - `actions/sedes.actions.ts` (línea 66)
- **Causa Raíz:** 
  1. Modelo de datos: Una Sede pertenece a una `Institución`, no a un `Programa`. Si el usuario crea un Programa, allí no se crean sedes.
  2. Al crear una sede en `/sedes`, el Server Action solo ejecuta `revalidatePath("/sedes")`, dejando la caché de `/fichas` desactualizada.
  3. `FichaFormDialog` no ofrece creación rápida de sede ni advertencia clara si la institución elegida carece de sedes activas.
- **Solución Técnica:** Revalidar `/fichas` al mutar sedes, agregar endpoint dinámico de sedes por institución y permitir la creación directa de sede desde el formulario si el usuario tiene los permisos requeridos.

---

### FASE 4 — CONFIGURACIÓN GLOBAL
- **Requisito en Documento:** Guardado y persistencia real de parámetros institucionales y de seguridad.
- **Estado Real en Código:** `[CONFIRMADO — 100% SIMULADO]`
- **Archivos Afectados:**
  - `features/administracion/ConfiguracionForm.tsx` (línea 17: `await new Promise((r) => setTimeout(r, 900))`)
- **Causa Raíz:** No existe modelo en la base de datos ni Server Action para guardar la configuración.
- **Solución Técnica:** Crear el modelo `ConfiguracionSistema` en Prisma (`clave`, `valor`, `descripcion`, `categoria`, `actualizadoPor`) y conectar el formulario con Server Action real.

---

### FASE 5 — RESULTADOS ACADÉMICOS
- **Requisito en Documento:** Estadísticas reales, eliminación de KPIs fijos y gráficos interactivos.
- **Estado Real en Código:** `[PARCIAL]`
- **Archivos Afectados:**
  - `app/(dashboard)/resultados/page.tsx`
- **Causa Raíz:** Aunque en V1.1 se agregaron consultas Prisma, estas cuentan evaluaciones a nivel global sin segmentación por programa o ficha, y la visualización son solo barras CSS estáticas sin soporte de filtros interactivos.
- **Solución Técnica:** Incorporar gráficos reales con `Recharts` (ya disponible en `package.json`), selectores por programa/ficha y métricas reales segmentadas.

---

### FASE 6 & 7 — MULTIPROGRAMA Y PLAN DE FORMACIÓN
- **Requisito en Documento:** Soporte para múltiples programas en simultáneo y asignación de competencias/transversales por parte del Coordinador Académico.
- **Estado Real en Código:** `[PARCIAL]`
- **Archivos Afectados:**
  - `app/(dashboard)/plan-formacion/page.tsx`
  - `features/academico/PlanFormacionTimeline.tsx`
- **Causa Raíz:** La base de datos ya soporta múltiples programas (relación 1:N entre `Programa` y `Competencia`). Sin embargo, el módulo actual es solo un visor. No existe la funcionalidad para asignar instructores a fichas ni a competencias transversales.
- **Solución Técnica:** Desarrollar el módulo interactivo de asignación de cargas y planes de trabajo exclusivo para `COORDINADOR_ACADEMICO`.

---

## 4. AUDITORÍA DE SEGURIDAD Y VULNERABILIDADES CRÍTICAS

1. **Exfiltración de Datos por API Routes:**
   - `GET /api/aprendices`: No exige token ni rol. Cualquier cliente HTTP externo puede volcar la lista completa de aprendices con NIT, teléfonos, correos y niveles de riesgo.
2. **Falta de Autorización en Server Actions:**
   - 16 de 19 archivos de Server Actions carecen de `requireRole()`. Un usuario con rol `INSTRUCTOR` o incluso no autenticado (vía RPC directo de Next.js) puede invocar `deleteCompetencia`, `deleteFicha`, `deleteSede`, etc.
3. **Aislamiento Multisede Inexistente en Backend:**
   - Ninguna consulta de lectura o mutación filtra por la `sedeId` asignada al usuario. Un Coordinador de Sede A puede ver y alterar datos de Sede B.
4. **Almacenamiento de Contraseñas de Aprendices:**
   - Actualmente los aprendices no tienen usuario (`User`). Si se habilita la creación masiva de aprendices con acceso, debe implementarse hashing obligatorio con `bcryptjs` (cost factor 12) y forzar cambio en primer ingreso.

---

## 5. MATRIZ DE NUEVOS ROLES Y NUEVOS MÓDULOS REQUERIDOS

### Nuevos Roles Requeridos:
1. **`APRENDIZ`:** Acceso exclusivo a su propia formación, notas, asistencia, actividades, certificaciones y mensajes de su instructor.
2. **`SECRETARIO`:** Consulta global y exportación de fichas, aprendices, reportes institucionales, gestión documental y mensajería oficial. Sin facultades de alteración curricular ni administración de usuarios.
3. **`COORDINADOR_REGIONAL`:** Supervisión general de la Regional Magdalena, creación/edición de Sedes e Instituciones, mensajería jerárquica a Coordinadores de Sede.
4. **`SUBDIRECTOR_REGIONAL`:** Máxima autoridad directiva regional; reportes ejecutivos, auditoría y lectura estratégica multisede.

### Nuevos Módulos Requeridos:
1. **Módulo Portal Aprendiz (`/mi-formacion` o `/aprendiz`):** Perfil, ruta formativa, estado de juicio evaluativo, plan de trabajo, eventos y actividades.
2. **Módulo Secretaría (`/secretaria`):** Verificación de matrículas, certificados SENA, exportación oficial y novedades documentales.
3. **Mensajería Jerárquica (`/mensajes`):**
   - *Región → Sede*
   - *Sede → Coordinación Académica / Instructor*
   - *Instructor → Aprendiz*
   - *Secretaría → Destinatarios institucionales*
   - Bloqueo estricto en backend de saltos no permitidos (ej. Instructor no puede mensajear a Subdirector).
4. **Clases Virtuales (`/clases-virtuales`):** Creación de sesiones de formación remota (título, enlace Meet/Teams/Zoom, fecha, hora, ficha, estado).
5. **Importador Masivo Centralizado:** Reutilizable para Competencias, RAPs, Aprendices y Asistencias.

---

## 6. IMPACTO EN BASE DE DATOS (`prisma/schema.prisma`)

Para satisfacer los requisitos sin migraciones destructivas ni pérdida de datos:

1. **Nuevo Modelo `RegistroAsistencia`:**
   - `id`, `asistenciaId` (FK Asistencia), `aprendizId` (FK Aprendiz), `estado` (`ASISTIO`, `FALTA`, `EXCUSA`), `observaciones`, `creadoEn`.
2. **Nuevo Modelo `ConfiguracionSistema`:**
   - `id`, `clave` (unique), `valor`, `descripcion`, `categoria`, `actualizadoEn`.
3. **Nuevo Modelo `Notificacion`:**
   - `id`, `userId` (FK User), `titulo`, `mensaje`, `leida` (boolean), `tipo`, `enlace`, `creadoEn`.
4. **Nuevo Modelo `Mensaje`:**
   - `id`, `remitenteId` (FK User), `destinatarioId` (FK User), `asunto`, `contenido`, `leido`, `creadoEn`.
5. **Nuevo Modelo `ClaseVirtual`:**
   - `id`, `fichaId` (FK Ficha), `instructorId` (FK Instructor), `titulo`, `descripcion`, `plataforma`, `urlReunion`, `fechaHora`, `duracionMinutos`, `estado`.
6. **Vincular `User` con `Aprendiz` e `Instructor`:**
   - Campo opcional `userId` en `Aprendiz` e `Instructor` para permitir login unificado bajo el mismo sistema NextAuth.
7. **Ampliación del Enum / Tabla de Roles:**
   - Incluir `APRENDIZ`, `SECRETARIO`, `COORDINADOR_REGIONAL`, `SUBDIRECTOR_REGIONAL`, `COORDINADOR_SEDE`.

---

## 7. CONTRADICCIONES Y DECISIONES TÉCNICAS REQUERIDAS

> [!IMPORTANT]
> **DECISIÓN REQUERIDA 1 — Importación de Competencias (Instructor vs Coordinador Académico):**
> - *Contradicción:* El texto de bugs menciona que el instructor debe tener un botón para importar competencias. No obstante, las normas institucionales SENA y la auditoría señalan que las competencias pertenecen al diseño curricular y solo deben ser gestionadas/importadas por el **Coordinador Académico**.
> - *Propuesta recomendada:* Habilitar la importación masiva de competencias **exclusivamente para Coordinador Académico y Administrador**. El Instructor tendrá acceso de solo lectura a las competencias asignadas a su programa.
>
> **DECISIÓN REQUERIDA 2 — Enfoque del Módulo de Visitas de Seguimiento:**
> - *Contradicción:* La implementación actual (`visitas_seguimiento`) registra visitas físicas a la Institución (`institucionNombre`, `responsable`). El documento de bugs indica: *"el modulo de visitas de seguimiento es solo para aprendices"*.
> - *Propuesta recomendada:* Mantener el registro institucional existente y añadir una relación con `Aprendiz` (`aprendizId` opcional o bitácora de seguimiento de etapa productiva/visita por aprendiz).
>
> **DECISIÓN REQUERIDA 3 — Creación de Usuarios para Aprendices:**
> - *Requisito:* Creación masiva de aprendices y usuarios.
> - *Propuesta recomendada:* Al importar aprendices, generar automáticamente su registro `User` asociado con rol `APRENDIZ`, asignando contraseña inicial segura (ej. número de documento) con flag `debeCambiarPassword: true` y hash bcrypt.

---

## 8. PLAN DE IMPLEMENTACIÓN POR FASES (SECUENCIA CONTROLADA)

Para cumplir estrictamente con el principio de **"No reescritura, sino evolución controlada"**:

- **Fase 1:** Estabilización de Autenticación, Corrección de Errores TypeScript (`authOptions`, `services/fichas.service.ts`), `Providers` y Cookies Dinámicas.
- **Fase 2:** Matriz RBAC Backend Real (`ROL × MÓDULO × ACCIÓN`) y blindaje de Server Actions y API Routes.
- **Fase 3:** Corrección de Bugs Confirmados:
  - *Bug 01:* Modelo `RegistroAsistencia` y vista nominal por aprendiz.
  - *Bug 04:* Sesión y roles persistentes.
  - *Bug 05:* Búsqueda segura con debounce.
  - *Bug 06:* Notificaciones privadas conectadas a BD.
  - *Bug 07:* Flujo y revalidación de Sedes/Fichas.
- **Fase 4:** Persistencia de Configuración Global en BD.
- **Fase 5:** Resultados con datos reales agregados y visualización Recharts.
- **Fase 6 & 7:** Multiprograma interactivo y Asignación en Plan de Formación.
- **Fase 8 & 9:** Módulo Portal Aprendiz y Seguimiento.
- **Fase 10 & 11:** Roles y vistas de Secretaría y Estructura Regional (Coordinador y Subdirector).
- **Fase 12 & 13:** Mensajería Jerárquica protegida y Notificaciones en tiempo real.
- **Fase 14:** Clases Virtuales.
- **Fase 15:** Motor Reutilizable de Importaciones Masivas (CSV/Excel con rollback transaccional).
- **Fase 16:** Estilo Institucional SENA (Verde institucional `#39A900`, azul `#00324D`, logo y tipografía).
- **Fase 17:** Eliminación de datos simulados de negocio.
- **Fase 18–21:** Pruebas integrales de seguridad, regresión, `npm run lint` y `npm run build`.

---

**ESTADO ACTUAL: FASE 0 COMPLETADA.**  
*No se han realizado modificaciones en el código fuente ni en la base de datos durante esta fase.*  
*Esperando aprobación de la auditoría y decisiones requeridas para iniciar la FASE 1.*
