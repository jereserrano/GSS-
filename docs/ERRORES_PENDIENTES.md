# GSS — Estado de Incidencias y Errores del Sistema
**Versión evaluada:** V3.0.0 / V3.0.1 (Auditoría Técnica Oficial)  
**Última actualización:** 19 de octubre de 2026  
**Estado general del sistema:** Operativo en Servidor Ubuntu Linux (VirtualBox `PEPE`, PM2 proceso `gss`, Nginx puerto 80).

---

## 🟢 HISTÓRICO RESUELTO — Incidencias Solventadas en V3.0.0

A continuación se resume el estado de las incidencias críticas heredadas de versiones anteriores (V2.1.3 - V2.2.5), verificadas como 100% resueltas en el código de producción:

### ✅ PE-01 — Búsqueda global del sistema (RESUELTO)
- **Implementación:** Se implementó la ruta dinámica `app/(dashboard)/busqueda/page.tsx` con su respectivo `BusquedaPageClient.tsx` y el Server Action `buscarGlobalmente` (`actions/busqueda.actions.ts`). El `<Input>` del Header redirige a `/busqueda?q=...` categorizando resultados en aprendices, fichas y actividades.

### ✅ PE-02 — Scope de asistencia por instructor (RESUELTO)
- **Implementación:** En `actions/asistencia.actions.ts` (`getAsistenciasAction`), el usuario con rol instructor es forzado a consultar únicamente las asistencias donde `where.instructorId = instructorRecord.id`. Adicionalmente, `COORDINADOR_SEDE` está acotado a las fichas de su `sedeId`.

### ✅ PE-03 — Ownership en evaluación de entregas (RESUELTO)
- **Implementación:** En `actions/entregas.actions.ts` (`evaluarEntregaAction`), se valida contra la tabla `InstructorFicha` que el instructor que califica esté explícitamente asignado a la ficha de la actividad correspondiente. Se rechaza cualquier intento de evaluación no autorizado (Anti-IDOR).

### ✅ PE-04 — Scope de documentos por institución y sede (RESUELTO)
- **Implementación:** En `actions/documentos.actions.ts`, las consultas de solicitudes de cartas y revisión documental (`getTodasSolicitudesCartasAction`) inyectan `whereClause.user = { sedeId: user.sedeId }` para coordinadores de sede y `{ institucionId: user.institucionId }` para otros roles.

### ✅ PE-05 — Protección de configuración con requireRole (RESUELTO)
- **Implementación:** En `actions/configuracion.actions.ts`, tanto `getConfiguracionAction` como `updateConfiguracionAction` exigen estrictamente `await requireRole(["ADMINISTRADOR"])`.

### ✅ PE-09 — Subtipo de coordinador y aislamiento por sede (RESUELTO)
- **Implementación:** El rol `COORDINADOR_SEDE` fue formalizado con aislamiento estricto en todas las Server Actions y en la barra de navegación `Sidebar.tsx`, restringiendo el acceso únicamente a los aprendices, fichas y reportes de su subsede asignada (`sedeId`).

---

## 🟡 PENDIENTES TÉCNICOS ACTUALES — Hoja de Ruta V3.1

Las siguientes tareas corresponden a mejoras arquitectónicas y de infraestructura detectadas durante la auditoría de sincronización V3.0.0 / V3.0.1:

### PE-V3-01 — Estandarización de Baseline en Migraciones de Prisma
- **Prioridad:** Media / Arquitectura
- **Contexto:** En el paso a producción de V3.0.0 se utilizó `npx prisma db push` de forma aditiva y segura, dado que el historial de `prisma/migrations` contenía únicamente la migración inicial `20260919_v2_1_5_schema_completo`.
- **Acción requerida:** Ejecutar en el entorno de desarrollo un `prisma migrate diff` para crear un archivo de migración canónico de línea base que capture las 36 tablas actuales, permitiendo que futuros despliegues utilicen `prisma migrate deploy` estrictamente.

### PE-V3-02 — Rotación de Contraseñas de Desarrollo a Producción Real
- **Prioridad:** Alta (Previo a lanzamiento público)
- **Contexto:** En los scripts de desarrollo y pruebas académicas se empleó la contraseña unificada con hash de `123456`.
- **Acción requerida:** Previo a la salida a producción con usuarios finales de colegios, forzar la expiración de claves o exigir el cambio de credencial mediante el módulo `/olvido-clave` a contraseñas robustas individuales.

### PE-V3-03 — Terminación TLS/SSL (HTTPS) en Nginx
- **Prioridad:** Media (Requerido al salir de red local NAT)
- **Contexto:** Actualmente Nginx escucha en el puerto 80 (HTTP) local a través del reenvío NAT de VirtualBox.
- **Acción requerida:** Cuando se asigne un dominio institucional o IP pública, configurar Certbot con Let's Encrypt en Nginx para cifrar el tráfico HTTPS en puerto 443.
