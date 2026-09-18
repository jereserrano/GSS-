
# Evolución y Arquitectura del Sistema GSS

Este documento registra el estado del proyecto y cada cambio significativo realizado a lo largo de su ciclo de vida, sirviendo como bitácora arquitectónica para entender qué modificaciones se han hecho al "PROMPT MAESTRO" original y por qué.

## Estado Base (Versión 1.0 - Cumplimiento del Prompt Maestro)
**Fecha:** Septiembre 2026
El software alcanzó el 100% de cumplimiento estructural y de seguridad delineado en la Fase 2 del requerimiento original. 

### Características del Sistema Base:
- **Stack:** Next.js App Router, Tailwind CSS, Shadcn/ui.
- **Base de Datos:** Prisma ORM, MySQL.
- **Tipado Fuerte:** Erradicación total del tipo `any` usando inferencia estricta a través de esquemas `Zod` compartidos.
- **Seguridad y RBAC (Anti-IDOR):** Autenticación mediante Auth.js. El modelo `User` posee `institucionId` (Multi-Tenancy). Las 22 *Server Actions* validan estrictamente mediante la capa `lib/rbac.ts` que ningún usuario cruce permisos hacia módulos o instituciones que no le corresponden.
- **Arquitectura Limpia:** Separación absoluta de lógica de base de datos gracias a la creación de la capa `repositories/` (ej. `FichaRepository`, `AprendizRepository`), de modo que las *Server Actions* (capa controladora) están completamente aisladas de Prisma.
- **Auditoría:** Servicio `logAudit` automático e inmutable para las operaciones de escritura (CREAR, ACTUALIZAR, ELIMINAR).

---

## Cambio #1: Asistencia Rápida y Cargas Masivas
**Estado:** Implementado

### Descripción de los cambios:
1. **Asistencia Detallada:** Se pasará de un modelo estadístico global (total de asistencias) a un modelo de asistencia individual nominal, implementando la tabla relacional `DetalleAsistencia`. 
2. **Carga por Excel:** Se implementará la carga masiva en módulos con cientos de usuarios (Aprendices, Instructores, etc).

### ¿Por qué se hace el cambio?
- **Toma de Asistencia (Mejora UX):** El proceso anterior era demorado e ineficiente para el instructor en el trabajo de campo real. La vista de lista y selección múltiple reduce el tiempo a un solo clic por grupo.
- **Carga de Datos (Eficiencia):** El registro manual uno a uno de cientos de aprendices/instructores viola los principios de eficiencia. Una carga masiva mediante archivos `.xlsx` resuelve el cuello de botella. Se incorpora la librería `xlsx` (estándar de la industria) por la imposibilidad nativa del navegador para decodificar binarios Excel.

### Manejo de Integridad:
- En la carga masiva, **la operación es atómica y estricta**. Si existe al menos un dato corrupto (ej. un correo mal formateado, un número de documento duplicado) de entre miles de registros, **se aborta inmediatamente toda la operación** sin guardar nada a medias, protegiendo así la pureza de la base de datos.

---

## Cambio #2: Ajustes de Usabilidad (Micro-interacciones UX)
**Estado:** Implementado

### Descripción de los cambios:
1. **Botón de Marcado Rápido:** Se añadió un botón "Marcar todos como Presente" en la vista de *Toma de Asistencia* para agilizar el llenado de datos por parte del instructor, reiniciando todas las celdas rápidamente a su estado positivo.
3. **Plantillas Excel Dinámicas:** Se habilitó un enlace de descarga en el modal para bajar plantillas guía de datos (ej. `plantilla_aprendices.xlsx`).

---

## Cambio #3: Retrocompatibilidad Zod, Filtros Dinámicos de Tabla
**Estado:** Implementado

### Descripción de los cambios:
1. **Retrocompatibilidad de Plantillas:** El sistema ahora lee archivos de Excel que usaban la columna antigua `fichaId` y los transforma automáticamente internamente a `codigoFicha`.
2. **Coerción de Tipos (Zod):** Se aplicó un parche masivo en la capa de esquemas `schemas/index.ts` usando `z.coerce.string()` para arreglar un error donde Zod rechazaba estrictamente células de Excel que venían en formato `Number` (ej. números de cédula 1004555666 o teléfonos), parseando todo suavemente a texto.
3. **Bypass de Caché:** Se modificó la descarga estática de la plantilla añadiendo un timestamp dinámico al archivo en el frontend (`?v=TIMESTAMP`) para que el navegador siempre descargue la versión más reciente y evitar archivos oxidados.
4. **Filtros Avanzados (Tabla Aprendices):** Se programó e integró una barra de filtros colapsable (toggle) vinculada al botón *Filtros*. Ahora los usuarios pueden combinar la barra de búsqueda de texto simultáneamente con filtros exactos por: **Estado**, **Nivel de Riesgo** y **Ficha**, enviando estos parámetros directamente a las Server Actions para un filtrado eficiente desde Prisma.
5. **Filtros Avanzados (Tabla Fichas):** Se implementó la misma arquitectura de filtros en el módulo de Fichas, permitiendo filtrar por **Estado**, **Programa** e **Institución**.

---

## Cambio #4: Carga Masiva Académica (Competencias y RAP)
**Estado:** Implementado

### Descripción de los cambios:
1. **Importación de Competencias:** Se implementó la carga masiva en el módulo de Competencias. Utiliza `codigoPrograma` para asociar automáticamente la competencia al programa correspondiente.
2. **Importación de Resultados de Aprendizaje (RAP):** Se implementó la carga masiva en Resultados de Aprendizaje. Utiliza `codigoCompetencia` para asociar automáticamente el RAP a su competencia jerárquica matriz.
3. **Plantillas Excel:** Se crearon `plantilla_competencias.xlsx` y `plantilla_resultados.xlsx` en el servidor, listas para ser descargadas a través del modal de carga masiva en ambas tablas.
4. **Validaciones Zod:** Se implementaron los esquemas `importCompetenciasSchema` y `importResultadosSchema` en la capa de Zod. Ambos utilizan `z.coerce.string()` y `z.coerce.number()` para evitar errores comunes de formato provenientes de Excel (ej. horas o códigos interpretados como celdas numéricas flotantes).

---

## Cambio #5: Correcciones de UI (Bugfixes)
**Estado:** Implementado

### Descripción de los cambios:
1. **Opacidad en Modal de Plan de Formación:** Se solucionó un error visual donde el modal de detalles de la Competencia/RAP se renderizaba de forma transparente, permitiendo que los elementos de fondo se superpusieran. Se reemplazó la clase CSS inestable `bg-surface` por `bg-white` para garantizar un fondo 100% sólido e ilegible por debajo.

---

## Cambio #6: Fase Instructor + Aprendiz — Flujo Académico Completo
**Estado:** Implementado
**Commit de referencia:** v2.0 (rama v2.0, build exitoso)

### Descripción de los cambios:

#### Esquema y Migración (Prisma)
1. **Relación User ↔ Instructor y User ↔ Aprendiz:** Se añadió el campo `userId` como FK opcional en los modelos `Instructor` y `Aprendiz` para vincular las cuentas de autenticación con los registros académicos reales.
2. **Tabla `InstructorFicha` (many-to-many):** Creada como tabla de asignación formal entre instructores y fichas/grupos, permitiendo que un instructor gestione múltiples fichas y que una ficha tenga múltiples instructores.
3. **Autoría en `Actividad`:** Nuevo campo `instructorId` (FK opcional a `Instructor`) y `resultadoAprendizajeId` (FK opcional a `ResultadoAprendizaje`) para trazabilidad pedagógica completa.
4. **Ciclo de evaluación en `Entrega`:** Ampliación del enum `EstadoEntrega` con valores `APROBADA`, `NO_APROBADA`, `TARDIA`, `CALIFICADA`. Nuevos campos: `retroalimentacion`, `instructorId`, `fechaEvaluacion` para el juicio valorativo del instructor.
5. **Migración aditiva y controlada:** Todas las modificaciones se aplicaron mediante `prisma migrate` de forma no destructiva, preservando los datos reales existentes en la BD.

#### Autenticación y Sesión
- **Normalización del rol `APRENDIZ`:** Actualizado el callback `jwt` en `[...nextauth]/route.ts` para mapear correctamente el rol `APRENDIZ` y exponer `aprendizId` en el token JWT, garantizando que el middleware RBAC funcione sin ambigüedad.

#### Server Actions
- **`actividades.actions.ts`:** Filtrado dinámico por rol: los Aprendices solo ven actividades de su ficha con estado `ACTIVA` o `PUBLICADA`. Se incluye el estado de la entrega personal del aprendiz en cada actividad retornada. Sistema de notificaciones automáticas al publicar una actividad (notifica a todos los aprendices en formación de la ficha).
- **`entregas.actions.ts`:** Flujo completo Anti-IDOR para Aprendices (el `aprendizId` siempre se obtiene del servidor, nunca del cliente). Soporte de reentregas/actualizaciones de evidencia para actividades no aprobadas. Función `evaluarEntregaAction` para el instructor: califica, genera retroalimentación, sincroniza automáticamente con `EvaluacionAprendiz` cuando hay RAP asociado, y dispara notificación al aprendiz.
- **`dashboard.actions.ts`:** KPIs y "Próximos Cierres" diferenciados por rol real (APRENDIZ, INSTRUCTOR, ADMINISTRADOR/COORDINADOR), eliminando completamente los datos hardcodeados del dashboard.
- **`notificaciones.actions.ts`:** Sistema de notificaciones corregido y estabilizado con `requireRole` para todos los roles del sistema. Función `crearNotificacionSistema` como utilidad de uso interno para los disparadores automáticos.

#### UI/Frontend
# Evolución y Arquitectura del Sistema GSS

Este documento registra el estado del proyecto y cada cambio significativo realizado a lo largo de su ciclo de vida, sirviendo como bitácora arquitectónica para entender qué modificaciones se han hecho al "PROMPT MAESTRO" original y por qué.

## Estado Base (Versión 1.0 - Cumplimiento del Prompt Maestro)
**Fecha:** Septiembre 2026
El software alcanzó el 100% de cumplimiento estructural y de seguridad delineado en la Fase 2 del requerimiento original. 

### Características del Sistema Base:
- **Stack:** Next.js App Router, Tailwind CSS, Shadcn/ui.
- **Base de Datos:** Prisma ORM, MySQL.
- **Tipado Fuerte:** Erradicación total del tipo `any` usando inferencia estricta a través de esquemas `Zod` compartidos.
- **Seguridad y RBAC (Anti-IDOR):** Autenticación mediante Auth.js. El modelo `User` posee `institucionId` (Multi-Tenancy). Las 22 *Server Actions* validan estrictamente mediante la capa `lib/rbac.ts` que ningún usuario cruce permisos hacia módulos o instituciones que no le corresponden.
- **Arquitectura Limpia:** Separación absoluta de lógica de base de datos gracias a la creación de la capa `repositories/` (ej. `FichaRepository`, `AprendizRepository`), de modo que las *Server Actions* (capa controladora) están completamente aisladas de Prisma.
- **Auditoría:** Servicio `logAudit` automático e inmutable para las operaciones de escritura (CREAR, ACTUALIZAR, ELIMINAR).

---

## Cambio #1: Asistencia Rápida y Cargas Masivas
**Estado:** Implementado

### Descripción de los cambios:
1. **Asistencia Detallada:** Se pasará de un modelo estadístico global (total de asistencias) a un modelo de asistencia individual nominal, implementando la tabla relacional `DetalleAsistencia`. 
2. **Carga por Excel:** Se implementará la carga masiva en módulos con cientos de usuarios (Aprendices, Instructores, etc).

### ¿Por qué se hace el cambio?
- **Toma de Asistencia (Mejora UX):** El proceso anterior era demorado e ineficiente para el instructor en el trabajo de campo real. La vista de lista y selección múltiple reduce el tiempo a un solo clic por grupo.
- **Carga de Datos (Eficiencia):** El registro manual uno a uno de cientos de aprendices/instructores viola los principios de eficiencia. Una carga masiva mediante archivos `.xlsx` resuelve el cuello de botella. Se incorpora la librería `xlsx` (estándar de la industria) por la imposibilidad nativa del navegador para decodificar binarios Excel.

### Manejo de Integridad:
- En la carga masiva, **la operación es atómica y estricta**. Si existe al menos un dato corrupto (ej. un correo mal formateado, un número de documento duplicado) de entre miles de registros, **se aborta inmediatamente toda la operación** sin guardar nada a medias, protegiendo así la pureza de la base de datos.

---

## Cambio #2: Ajustes de Usabilidad (Micro-interacciones UX)
**Estado:** Implementado

### Descripción de los cambios:
1. **Botón de Marcado Rápido:** Se añadió un botón "Marcar todos como Presente" en la vista de *Toma de Asistencia* para agilizar el llenado de datos por parte del instructor, reiniciando todas las celdas rápidamente a su estado positivo.
3. **Plantillas Excel Dinámicas:** Se habilitó un enlace de descarga en el modal para bajar plantillas guía de datos (ej. `plantilla_aprendices.xlsx`).

---

## Cambio #3: Retrocompatibilidad Zod, Filtros Dinámicos de Tabla
**Estado:** Implementado

### Descripción de los cambios:
1. **Retrocompatibilidad de Plantillas:** El sistema ahora lee archivos de Excel que usaban la columna antigua `fichaId` y los transforma automáticamente internamente a `codigoFicha`.
2. **Coerción de Tipos (Zod):** Se aplicó un parche masivo en la capa de esquemas `schemas/index.ts` usando `z.coerce.string()` para arreglar un error donde Zod rechazaba estrictamente células de Excel que venían en formato `Number` (ej. números de cédula 1004555666 o teléfonos), parseando todo suavemente a texto.
3. **Bypass de Caché:** Se modificó la descarga estática de la plantilla añadiendo un timestamp dinámico al archivo en el frontend (`?v=TIMESTAMP`) para que el navegador siempre descargue la versión más reciente y evitar archivos oxidados.
4. **Filtros Avanzados (Tabla Aprendices):** Se programó e integró una barra de filtros colapsable (toggle) vinculada al botón *Filtros*. Ahora los usuarios pueden combinar la barra de búsqueda de texto simultáneamente con filtros exactos por: **Estado**, **Nivel de Riesgo** y **Ficha**, enviando estos parámetros directamente a las Server Actions para un filtrado eficiente desde Prisma.
5. **Filtros Avanzados (Tabla Fichas):** Se implementó la misma arquitectura de filtros en el módulo de Fichas, permitiendo filtrar por **Estado**, **Programa** e **Institución**.

---

## Cambio #4: Carga Masiva Académica (Competencias y RAP)
**Estado:** Implementado

### Descripción de los cambios:
1. **Importación de Competencias:** Se implementó la carga masiva en el módulo de Competencias. Utiliza `codigoPrograma` para asociar automáticamente la competencia al programa correspondiente.
2. **Importación de Resultados de Aprendizaje (RAP):** Se implementó la carga masiva en Resultados de Aprendizaje. Utiliza `codigoCompetencia` para asociar automáticamente el RAP a su competencia jerárquica matriz.
3. **Plantillas Excel:** Se crearon `plantilla_competencias.xlsx` y `plantilla_resultados.xlsx` en el servidor, listas para ser descargadas a través del modal de carga masiva en ambas tablas.
4. **Validaciones Zod:** Se implementaron los esquemas `importCompetenciasSchema` y `importResultadosSchema` en la capa de Zod. Ambos utilizan `z.coerce.string()` y `z.coerce.number()` para evitar errores comunes de formato provenientes de Excel (ej. horas o códigos interpretados como celdas numéricas flotantes).

---

## Cambio #5: Correcciones de UI (Bugfixes)
**Estado:** Implementado

### Descripción de los cambios:
1. **Opacidad en Modal de Plan de Formación:** Se solucionó un error visual donde el modal de detalles de la Competencia/RAP se renderizaba de forma transparente, permitiendo que los elementos de fondo se superpusieran. Se reemplazó la clase CSS inestable `bg-surface` por `bg-white` para garantizar un fondo 100% sólido e ilegible por debajo.

---

## Cambio #6: Fase Instructor + Aprendiz — Flujo Académico Completo
**Estado:** Implementado
**Commit de referencia:** v2.0 (rama v2.0, build exitoso)

### Descripción de los cambios:

#### Esquema y Migración (Prisma)
1. **Relación User ↔ Instructor y User ↔ Aprendiz:** Se añadió el campo `userId` como FK opcional en los modelos `Instructor` y `Aprendiz` para vincular las cuentas de autenticación con los registros académicos reales.
2. **Tabla `InstructorFicha` (many-to-many):** Creada como tabla de asignación formal entre instructores y fichas/grupos, permitiendo que un instructor gestione múltiples fichas y que una ficha tenga múltiples instructores.
3. **Autoría en `Actividad`:** Nuevo campo `instructorId` (FK opcional a `Instructor`) y `resultadoAprendizajeId` (FK opcional a `ResultadoAprendizaje`) para trazabilidad pedagógica completa.
4. **Ciclo de evaluación en `Entrega`:** Ampliación del enum `EstadoEntrega` con valores `APROBADA`, `NO_APROBADA`, `TARDIA`, `CALIFICADA`. Nuevos campos: `retroalimentacion`, `instructorId`, `fechaEvaluacion` para el juicio valorativo del instructor.
5. **Migración aditiva y controlada:** Todas las modificaciones se aplicaron mediante `prisma migrate` de forma no destructiva, preservando los datos reales existentes en la BD.

#### Autenticación y Sesión
- **Normalización del rol `APRENDIZ`:** Actualizado el callback `jwt` en `[...nextauth]/route.ts` para mapear correctamente el rol `APRENDIZ` y exponer `aprendizId` en el token JWT, garantizando que el middleware RBAC funcione sin ambigüedad.

#### Server Actions
- **`actividades.actions.ts`:** Filtrado dinámico por rol: los Aprendices solo ven actividades de su ficha con estado `ACTIVA` o `PUBLICADA`. Se incluye el estado de la entrega personal del aprendiz en cada actividad retornada. Sistema de notificaciones automáticas al publicar una actividad (notifica a todos los aprendices en formación de la ficha).
- **`entregas.actions.ts`:** Flujo completo Anti-IDOR para Aprendices (el `aprendizId` siempre se obtiene del servidor, nunca del cliente). Soporte de reentregas/actualizaciones de evidencia para actividades no aprobadas. Función `evaluarEntregaAction` para el instructor: califica, genera retroalimentación, sincroniza automáticamente con `EvaluacionAprendiz` cuando hay RAP asociado, y dispara notificación al aprendiz.
- **`dashboard.actions.ts`:** KPIs y "Próximos Cierres" diferenciados por rol real (APRENDIZ, INSTRUCTOR, ADMINISTRADOR/COORDINADOR), eliminando completamente los datos hardcodeados del dashboard.
- **`notificaciones.actions.ts`:** Sistema de notificaciones corregido y estabilizado con `requireRole` para todos los roles del sistema. Función `crearNotificacionSistema` como utilidad de uso interno para los disparadores automáticos.

#### UI/Frontend
- **`Header.tsx`:** Integración real con el backend de notificaciones. Carga y refresca las notificaciones del usuario autenticado cada 30 segundos via `getMisNotificacionesAction`. Visualización con tiempo relativo usando `date-fns`. Marcado individual y masivo de notificaciones como leídas.
- **`dashboard/page.tsx`:** Vista dinámica y contextual según rol. El APRENDIZ ve su progreso personal (actividades, evidencias, porcentaje de asistencia). El INSTRUCTOR ve métricas de sus fichas asignadas. El ADMINISTRADOR mantiene la vista global. Eliminados todos los datos estáticos/ficticios.
- **`ActividadesTable.tsx`:** Vista dual por rol: el APRENDIZ ve columna "Mi Entrega" con estado de su entrega personal y botón "Entregar/Actualizar" inline (sin botones de edición/creación/eliminación). El INSTRUCTOR/ADMIN retiene el CRUD completo.
- **`EntregasTable.tsx`:** Vista dual por rol: el APRENDIZ solo ve y actualiza sus propias entregas (sin "Registrar Entrega" manual ni botón eliminar). Entrega aprobada bloquea el botón de actualización.
- **`EntregaFormDialog.tsx`:** Soporte dual: el APRENDIZ ingresa URL de evidencia y comentario; el INSTRUCTOR evalúa con juicio (APROBADA/NO_APROBADA), calificación numérica y retroalimentación.

### ¿Por qué se hizo el cambio?
- **Requerimiento funcional crítico:** Los usuarios con rol INSTRUCTOR y APRENDIZ no tenían flujos de trabajo definidos ni acceso contextual al sistema. Esta fase cierra el ciclo pedagógico completo de la Media Técnica SENA.
- **Seguridad RBAC real:** La verificación de alcance se ejecuta siempre en el servidor. Un aprendiz no puede ver ni modificar entregas de otro aprendiz bajo ninguna circunstancia.
- **UX contextual:** Cada rol ve exclusivamente la información y las acciones que le corresponden, reduciendo la complejidad cognitiva y el riesgo de error operativo.

---

## Cambio #7: Habilitación y Corrección de Asignación del Rol APRENDIZ en Administración de Usuarios
**Estado:** Implementado
**Fecha:** Septiembre 2026

### Descripción de los cambios:
1. **Normalización del Motor de Jerarquías (`lib/hierarchy.ts`):**
   - Se añadió el nivel `APRENDIZ = 5` al enum `HierarchyLevel`.
   - Se actualizó la función `getHierarchyLevel` para que reconozca la palabra clave `"APRENDIZ"` y asigne correctamente el nivel de jerarquía 5.
   - Se configuró la función de orden de resolución en `getHierarchyLevel` evitando falsos positivos de palabras clave (`APOYO` antes de `ADMIN`, `SEDE` antes de `COORD`).
   - Se reforzó `canRoleManageUsers` para garantizar que los roles sin capacidad administrativa (`APRENDIZ`, `INSTRUCTOR`, `APOYO_ADMINISTRATIVO`) retornen `false` y no puedan gestionar usuarios ni asignar roles.
   - Se actualizó `getAssignableRoles` para verificar `canRoleManageUsers(currentRolNombre)` antes de filtrar la lista de roles asignables.

2. **Formulario de Usuarios UI (`UsuarioFormDialog.tsx`):**
   - Al retornar el nivel `5` para `"Aprendiz"`, la comparación de jerarquía `rolLevel > currentUserSession.hierarchyLevel` evalúa correctamente `5 > 1` (para Administrador), incluyendo automáticamente el rol `"Aprendiz"` en el selector `<select>` sin omitirlo ni filtrarlo como desconocido (`99`).

3. **Autenticación y NextAuth (`app/api/auth/[...nextauth]/route.ts`):**
   - Se verificó que el callback `authorize` mapee el rol `"Aprendiz"` a `role: "APRENDIZ"` con `hierarchyLevel: 5`.
   - El token JWT y la sesión transmiten los permisos del rol `APRENDIZ` al middleware y las Server Actions.

4. **Reglas de Seguridad Manteniéndose Intactas:**
   - Únicamente el rol `ADMINISTRADOR` (nivel 1) tiene permisos para acceder a `/usuarios` y ejecutar mutaciones (`createUser`, `updateUser`, `deleteUser`).
   - El backend valida la sesión activa y jerarquía en cada Server Action.

### Suite de Pruebas:
- **Suite de Pruebas de Seguridad (`scripts/test-hierarchy-security.ts`):** 23/23 pruebas de seguridad superadas exitosamente (100% OK).
- **Build de Next.js (`npm run build`):** 34 páginas estáticas y dinámicas compiladas limpiamente sin errores de sintaxis o de tipos.

---

## V2.1 — Cierre de Jornada: Rediseño Institucional SENA, Rol Aprendiz y Estabilización
**Fecha:** 18 de septiembre de 2026  
**Versión de Referencia Anterior:** V2.0 (Commit `3287594`)  
**Tag Formal:** `v2.1`  
**Rama:** `v2.0`  

### 1. Auditoría Previa Realizada
- **Documento generado:** `GSS_REPORTE_AUDITORIA_PREIMPLEMENTACION.md`.
- **Diagnóstico:** Se evaluó de forma exhaustiva la interfaz preexistente identificando ausencia de identidad corporativa SENA, tipografía genérica sin jerarquía editorial clara, contraste insuficiente en componentes de datos, falta de pie de página institucional y componentes desarticulados respecto a plataformas como Zajuna y SOFIA Plus.
- **Directriz de seguridad:** Cero impacto en la lógica de negocio subyacente, preservación estricta de las Server Actions y esquemas Zod existentes.

### 2. Rediseño Visual Institucional (Contexto SENA / Zajuna / SOFIA Plus)
- **Tipografía Institucional:** Integración de `Work Sans` en `app/layout.tsx` como fuente principal con soporte de pesos 300 a 700 para emular el estándar visual de las plataformas formativas del SENA.
- **Paleta de Colores Corporativa:**
  - `sena-green` (`#39A900`): Verde insignia institucional para botones de acción principal, badges de aprobación, estados activos y acentos clave.
  - `sena-navy` (`#00324D`): Azul oscuro corporativo para barras superiores, encabezados de tablas, títulos de alta jerarquía y estados de contraste.
  - `sena-bg` / `sena-surface` (`#F8FAFC`, `#FFFFFF`): Fondos limpios y contrastantes que eliminan el aspecto plano o descuidado.
- **Header Superior (`components/layout/Header.tsx`):** Barra institucional con acento tricolor/institucional, logo e isotipo SENA, buscador unificado, badge de rol con jerarquía, avatar con iniciales y campana de notificaciones en tiempo real conectada a `getMisNotificacionesAction` con actualización automática.
- **Navegación Lateral (`components/layout/Sidebar.tsx`):** Organización semántica agrupada por fases del proceso formativo (Gestión Formativa, Ejecución y Evaluación, Acompañamiento, Configuración / Administración), estados activos en verde SENA, soporte colapsable y tooltip informativo.
- **Footer Institucional (`components/layout/Footer.tsx`):** Inclusión del pie de página oficial con mención a la Dirección de Formación Profesional, Sistema de Información GSS y enlaces institucionales.
- **Componentes de Datos y Tablas (`DataTable.tsx`, `table.tsx`):** Cabeceras en `sena-navy`, filas alternas con legibilidad optimizada, estados de entrega armonizados con badges de color institucional.
- **Tarjetas de Métricas y Gráficos (`KpiCard.tsx`, `Charts.tsx`):** Tarjetas con bordes sutiles, micro-interacciones hover, paleta de gráficos adaptada a la identidad SENA.
- **Pantalla de Inicio de Sesión (`app/login/page.tsx`):** Rediseño institucional de dos columnas (panel izquierdo institucional SENA Media Técnica y formulario de acceso seguro a la derecha).

### 3. Asignación del Rol APRENDIZ en Administración de Usuarios
- **Diagnóstico del Problema:** En el panel de administración de usuarios (`/usuarios`), el rol `APRENDIZ` (presente en la tabla de base de datos) no aparecía en el selector de roles al crear o editar usuarios.
- **Causa Raíz:** En `lib/hierarchy.ts`, `HierarchyLevel` no incluía el valor explícito para `APRENDIZ`, asignándole nivel `99` (desconocido/inválido), lo que ocasionaba que la validación jerárquica `rolLevel > currentUserSession.hierarchyLevel` lo excluyera de la lista de roles asignables para el Administrador (nivel 1).
- **Corrección Implementada:**
  - Asignación formal de `APRENDIZ = 5` en `HierarchyLevel` (`lib/hierarchy.ts`).
  - Reconocimiento de palabra clave `"APRENDIZ"` en `getHierarchyLevel`.
  - Protección de seguridad en `canRoleManageUsers`: `APRENDIZ`, `INSTRUCTOR` y `APOYO_ADMINISTRATIVO` retornan `false`, impidiendo cualquier gestión administrativa o asignación de roles no autorizada.
  - Comprobación en `UsuarioFormDialog.tsx`: el rol `Aprendiz` ahora se incluye correctamente en el `<select>` para usuarios con rol `ADMINISTRADOR`.
  - Mapeo en NextAuth (`app/api/auth/[...nextauth]/route.ts`): autenticación con `role: "APRENDIZ"` y `hierarchyLevel: 5`.
- **Suite de Pruebas de Seguridad:** `scripts/test-hierarchy-security.ts` ejecutado con éxito (23/23 pruebas aprobadas, 100% OK).

### 4. Diagnóstico del Servidor e Incidente de Estilos (CSS)
- **Incidente Reportado:** El servidor retornó temporalmente "Error de conexión" y se reportó pérdida aparente de estilos CSS en `localhost:3000`.
- **Diagnóstico y Causa Raíz:**
  1. El proceso en segundo plano de Node/Next.js se había terminado. El puerto 3000 estaba libre sin ningún proceso escuchando (comprobado con `netstat -ano`).
  2. No existía ningún archivo de estilos corrupto ni eliminado. `globals.css` y `tailwind.config.ts` contenían la configuración correcta y sin errores de sintaxis.
- **Recuperación del Servidor:** Se reinició el servidor de desarrollo mediante Node directo con asignación de host `0.0.0.0` compatible con Windows.
- **Verificación Automatizada vía Navegador:**
  - Se lanzó una sesión de navegación headless sobre `http://localhost:3000`.
  - Se confirmó que los estilos Tailwind CSS, la tipografía Work Sans y la paleta de colores institucional verde SENA `#39A900` se renderizan de manera 100% íntegra y correcta (evidenciado mediante captura de pantalla de la pantalla de login).
  - La aparente falta de estilos en sesiones locales se identificó como un problema de caché de chunks CSS del navegador del cliente (solucionable mediante recarga forzada `Ctrl + Shift + R`).

### 5. Estado Actual del Proyecto y Archivos Modificados
- **Módulos Operativos:**
  - Autenticación NextAuth y protección RBAC multi-nivel.
  - Dashboard contextual por roles (Aprendiz, Instructor, Administrador).
  - Notificaciones en tiempo real en Header.
  - Carga masiva y asistencia rápida.
  - Ciclo formativo completo: actividades y entregas de evidencias.
  - Rediseño visual institucional SENA aplicado y operativo.
- **Pendientes para Próxima Jornada:**
  - Continuar con el refinamiento de la creación de usuario con rol APRENDIZ y su vinculación automática/manual con el registro de aprendiz de ficha existente.
  - Validación cruzada de navegación por parte del usuario mediante recarga sin caché (`Ctrl + Shift + R`).

