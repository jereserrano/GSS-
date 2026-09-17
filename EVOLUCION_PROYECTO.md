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
