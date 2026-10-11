# Plan de Despliegue - GSS (Media Técnica)

Este documento servirá como bitácora de registro de cada paso ejecutado para desplegar el proyecto GSS en el servidor Linux (VirtualBox) local.

## Regla de Registro (Establecida)
**Regla:** TODO paso por mínimo que sea (crear carpetas, copiar archivos, instalar dependencias, ejecutar comandos en el servidor) debe quedar registrado en este archivo antes o inmediatamente después de su ejecución, con su respectiva fecha y hora.

## Análisis del Proyecto
- **Framework:** Next.js
- **ORM:** Prisma
- **Base de Datos:** MySQL
- **Gestor de paquetes:** npm

## Plan de Implementación (Paso por Paso)

### Fase 1: Verificación y Conexión
1. Probar la conexión SSH al servidor Linux en `127.0.0.1` por el puerto `2222`. Necesitaremos el usuario y posiblemente la contraseña (o llave SSH).

### Fase 2: Preparación del Entorno en el Servidor Linux
1. Actualizar el sistema de paquetes del servidor (`apt update` / `apt upgrade`).
2. Instalar Node.js y npm (se recomienda versión LTS, como la 20.x).
3. Instalar MySQL Server y asegurarlo.
4. Crear la base de datos para GSS en MySQL.
5. Instalar `pm2` globalmente para mantener la aplicación ejecutándose en segundo plano (`npm install -g pm2`).

### Fase 3: Transferencia de Archivos
1. Comprimir el proyecto local (omitiendo `node_modules`, `.next` y otros archivos temporales) o usar `scp` para transferir los archivos desde `c:\GSS` al servidor Linux (por ejemplo, a `/var/www/gss` o al `home` del usuario).
2. Descomprimir los archivos en el servidor.

### Fase 4: Configuración y Compilación
1. Navegar a la carpeta del proyecto en el servidor.
2. Ejecutar `npm install` para instalar todas las dependencias.
3. Crear el archivo `.env` en el servidor con la variable `DATABASE_URL` apuntando a la base de datos MySQL recién creada.
4. Ejecutar la migración de la base de datos con Prisma (`npx prisma migrate deploy` o `npx prisma db push`).
5. Generar el cliente de Prisma (`npx prisma generate`).
6. Compilar el proyecto de Next.js (`npm run build`).

### Fase 5: Puesta en Marcha
1. Iniciar la aplicación usando PM2 (`pm2 start npm --name "gss-app" -- run start`).
2. (Opcional pero recomendado) Configurar Nginx como proxy inverso para exponer la aplicación por el puerto 80.
3. Guardar la configuración de PM2 (`pm2 save` y `pm2 startup`).

---
**Historial de Ejecución:**
- **[2026-10-08]** Creación de este documento con el plan inicial de despliegue. Esperando verificación y aprobación del usuario.
- **[2026-10-08 06:49]** (Fase 1) Inicio de pruebas de conexión SSH hacia `127.0.0.1:2222` con el usuario proporcionado. Preparando comando para verificar conexión.
- **[2026-10-08 06:54]** (Fase 1) ✅ Conexión SSH exitosa mediante script Python (`paramiko`).
- **[2026-10-08 06:55]** (Fase 2) Verificando permisos de superusuario (`sudo`) en el servidor para instalación de paquetes. ✅ Exitoso.
- **[2026-10-08 06:56]** (Fase 2) Ejecutando actualización de la lista de paquetes del servidor (`apt update` y `apt upgrade`). ✅ Finalizado con éxito.
- **[2026-10-08 07:01]** (Fase 2) Instalando Node.js (versión 20.x) y npm en el servidor Linux. ✅ Exitoso.
- **[2026-10-08 07:03]** (Fase 2) Instalando y configurando MySQL Server. ✅ Exitoso.
- **[2026-10-08 07:16]** (Fase 2) Configurando credenciales de root y creando la base de datos `Sena_Gss`. ✅ Exitoso.
- **[2026-10-08 07:22]** (Fase 2) Instalando PM2 globalmente en el servidor para la gestión de procesos. ✅ Exitoso.
- **[2026-10-08 07:24]** (Fase 3) Comprimiendo el proyecto (excluyendo `node_modules`, `.next`, `.git`) y transfiriéndolo al servidor vía SFTP. ✅ Exitoso.
- **[2026-10-08 07:26]** (Fase 4) Descomprimiendo archivos en el servidor (`~/gss`) y procediendo a instalar dependencias del proyecto (`npm install`). ✅ Exitoso.
- **[2026-10-08 07:26]** (Fase 4) Creando archivo `.env` en el servidor con conexión a MySQL e instalando dependencias con `npm install`. ✅ Exitoso.
- **[2026-10-08 07:37]** (Fase 4) Ejecutando sincronización de base de datos (`npx prisma db push`), generación de cliente (`npx prisma generate`). ✅ Exitoso.
- **[2026-10-10 09:39]** (Fase 4) Exportación de base de datos local `Sena_Gss` en formato UTF-8 y transferencia al servidor vía SFTP. ✅ Exitoso.
- **[2026-10-10 09:44]** (Fase 4) Ejecución de script para limpiar la base de datos `Sena_Gss` en el servidor e importar todos los datos de forma íntegra. ✅ Exitoso.
- **[2026-10-10 09:47]** (Fase 4) Creación de un archivo swap de 2GB en el servidor remoto para evitar errores OOM al compilar Next.js. ✅ Exitoso.
- **[2026-10-10 09:56]** (Fase 4) Compilación finalizada exitosamente del proyecto Next.js en el servidor (`npm run build`). ✅ Exitoso.
- **[2026-10-10 09:57]** (Fase 5) Puesta en marcha de la aplicación con PM2 (`pm2 start npm --name "gss-app" -- run start`) y guardado de estado (`pm2 save`). ✅ Exitoso.
- **[2026-10-10 10:17]** (Fase 4 - Corrección) Limpieza del caché estático de Next.js (`rm -rf .next`) y recompilación del proyecto tras reparar el error de autenticación del usuario root en MySQL, para eliminar el error 28000 persistente. Reinicio de PM2. ✅ Exitoso.
- **[2026-10-10 19:10]** (Fase 4 - Corrección / Robustez) Corrección del enlace referencial obligatorio entre `User` y `Aprendiz` (`fichaId`):
  1. Integración en `actions/user.actions.ts` y `UsuarioFormDialog.tsx` de selector obligatorio de Ficha o vinculación a aprendiz existente para evitar usuarios huérfanos.
  2. Generación automática y enlace bidireccional de cuentas de usuario en `createAprendiz` y en la importación masiva (`importAprendicesMasivo`).
  3. Lógica de auto-reparación preventiva y mensajes amigables e instructivos en `createEntrega`, `getAprendizPropioAction` y en las interfaces de `GestorActividades` y `entregas/page.tsx`. ✅ Exitoso.
- **[2026-10-11 06:54]** (Fase 4 - Corrección / Configuración) Diagnóstico de error en vinculación de Google Drive (`Missing required parameter: client_id / Error 400: invalid_request`):
  1. Causa: Al actualizar el servidor con Git, los archivos `.env` no viajan en el repositorio (están en `.gitignore`). Faltaba configurar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en el `.env` del servidor.
  2. Mejora de código: Se añadió validación defensiva en `GoogleDriveService`, `api/google/auth-url` y `GoogleDriveConfig.tsx` para alertar claramente al usuario en lugar de redirigir a una URL vacía en Google.
  3. Documentación: Se actualizó `.env.example` con las variables de Google Drive, SMTP y Zoom para prevenir omisiones en nuevos despliegues.
- **[2026-10-11 08:08]** (Fase 5 - Red y Acceso Multi-equipo / Google Drive) Configuración de acceso seguro mediante túnel persistente (`devtunnel`):
  1. Identificación y activación de túnel fijo `fancy-dog-z2wkcxj.use` con URL pública HTTPS permanente: `https://f6zrl9t3-3000.use.devtunnels.ms`.
  2. Concesión de permiso anónimo (`+Anonymous [connect]`) para permitir acceso a cualquier dispositivo sin requerir login de Microsoft.
  3. Actualización en servidor `/var/www/gss/.env` de `NEXTAUTH_URL="https://f6zrl9t3-3000.use.devtunnels.ms"` y reinicio de PM2 `gss-backend` con `--update-env`.
  4. Documentado procedimiento manual de arranque para ejecución diaria (`devtunnel host fancy-dog-z2wkcxj.use`). ✅ Exitoso.
- **[2026-10-11 09:15]** (Fase 4 - Mejora / Gestión de Actividades) Incorporación de botones de edición y eliminación para instructores en el Gestor de Actividades:
  1. Adición de botones "Editar" (icono Pencil) y "Eliminar" (icono Trash2) en cada tarjeta de actividad en `GestorActividades.tsx`.
  2. Implementación de modal interactivo de confirmación de eliminación con aviso sobre entregas asociadas y borrado seguro en cascada en `deleteActividad` (`actions/actividades.actions.ts`).
  3. Soporte de edición en `ActividadFormDialog.tsx` con precarga correcta de fecha de vencimiento en hora local, código y descripción.
  4. Despliegue hacia el servidor Linux remoto vía Git y actualización del servicio PM2. ✅ Exitoso.
- **[2026-10-11 10:00]** (Fase 4 - Corrección / Centro de Calificaciones y Gestor de Actividades) Sincronización automática de Calificación Masiva y visualización de notas en rol Aprendiz:
  1. Causa: `calificarMasivoAction` solo guardaba en la tabla `EvaluacionAprendiz`, sin actualizar las entregas de las actividades asociadas a dicho RAP en la ficha. Esto ocasionaba que en el Gestor de Actividades siguieran saliendo como "Por Calificar" y que al aprendiz no se le reflejara la entrega calificada en su historial.
  2. Solución en backend: Se actualizó `calificarMasivoAction` en `actions/evaluaciones.actions.ts` para realizar sincronización automática (`upsert` en modelo `Entrega`) en todas las actividades vinculadas al RAP en esa ficha, registrar retroalimentación, generar notificaciones en el sistema para los aprendices evaluados y revalidar las rutas `/centro-calificaciones`, `/gestor-actividades`, `/actividades` y `/evaluaciones`.
  3. Solución en frontend: Se mejoró `CentroCalificaciones.tsx` para incluir búsqueda resiliente de la cuenta de aprendiz (por `userId` y `email`), expansión automática de competencias por defecto en la vista de aprendiz, y alertas informativas mediante `sonner` `toast` tras la calificación masiva.
  4. Sincronización retroactiva: Se sincronizaron las evaluaciones existentes en base de datos para que actividades previas queden en estado `CALIFICADA` con su nota correspondiente.
  5. Despliegue en servidor Linux remoto mediante Git y reinicio de servicio PM2. ✅ Exitoso.
- **[2026-10-11 10:35]** (Fase 2 y 4 - Infraestructura y Robustez) Ampliación de memoria RAM en servidor Linux a 4.3GB y optimización de detección de entregas en Gestor de Actividades:
  1. Verificación de infraestructura: Se comprobó por SSH el incremento de memoria RAM en la máquina virtual a 4281 MB (~4.3 GB) y disponibilidad de 3.1 GB de RAM libre, asegurando compilaciones fluidas sin riesgo de OOM.
  2. Mejora en `GestorActividades.tsx`: Implementación de la función `isMyEntrega` con validación multi-criterio (`userId`, `emailSena`, `emailPersonal`, `user.email`) insensible a mayúsculas/minúsculas para garantizar que el aprendiz siempre visualice sus entregas en "Historial de Entregas" y nunca pierda visibilidad de su nota.
  3. Ejecución de suite de pruebas automatizadas (`test_calificar_masivo.ts`) confirmando que la calificación masiva actualiza instantáneamente las entregas a `CALIFICADA`, deja en 0 las entregas pendientes de evaluar en el Gestor de Actividades y refleja la nota en la vista del aprendiz.
  4. Despliegue en el servidor Linux con PM2 operativo. ✅ Exitoso.
- **[2026-10-11 14:18]** (Fase 4 - Administración y Seguridad / Control de Sedes) Soporte integral de asignación de Sede para Coordinadores de Sede y Apoyos:
  1. Frontend en Gestión de Usuarios: Se añadió el selector reactivo de "Sede Asignada" (`sedeId`) en `UsuarioFormDialog.tsx`, con validación obligatoria para los roles `COORDINADOR_SEDE` y `APOYO_COORDINACION`, y filtrado contextual por institución seleccionada.
  2. Proveedor de datos en `/usuarios`: Se actualizó `usuarios/page.tsx` para cargar las sedes educativas desde Prisma y suministrarlas a `UsuariosTable` y a los diálogos.
  3. Visualización en tabla: Se incorporó la relación `sede` en `getUsers()` y el distintivo visual (badge `🏛️ Sede` / alerta `⚠️ Sin Sede`) en `UsuariosTable.tsx` para supervisión inmediata del Administrador.
  4. Persistencia en Backend: Se ajustaron las mutaciones `createUser` y `updateUser` en `actions/user.actions.ts` para persistir `sedeId` en el repositorio de usuarios.
  5. Contexto de Sesión JWT: Se integraron `sedeId` e `institucionId` en los callbacks de `authorize`, `jwt` y `session` de `lib/auth.ts` y en las extensiones de tipos de NextAuth (`types/next-auth.d.ts`), permitiendo que los filtros de seguridad por sede operen desde el inicio de sesión.
  6. Despliegue y verificación: Sincronización vía Git hacia el servidor Linux remoto, compilación limpia de producción con Next.js y reinicio del proceso PM2 `gss-backend`. ✅ Exitoso.
- **[2026-10-11 14:36]** (Fase 4 - Corrección / Notificaciones por correo) Enrutamiento al correo personal del aprendiz y notificaciones automáticas por email:
  1. Diagnóstico: `createActividad` únicamente creaba la notificación en la plataforma (in-app en tabla `Notificacion`), sin invocar el despachador de correos. Se verificó conectividad y autenticación SMTP exitosa desde el servidor Linux (puerto 587 TLS a Gmail y `transporter.verify()` activo).
  2. Notificación al publicar actividad: En `actions/actividades.actions.ts`, al publicar una actividad se despacha un correo HTML personalizado a cada aprendiz `EN_FORMACION` de la ficha utilizando prioritariamente `emailPersonal` (con respaldo en `emailSena` y en `user.email`). Se diseñó la plantilla `getActividadEmailTemplate` en `lib/email-templates.ts` detallando instructor, ficha, RAP, descripción, fecha de vencimiento y enlace directo.
  3. Despacho centralizado en el sistema: En `actions/notificaciones.actions.ts`, toda llamada a `crearNotificacionSistema` (entregas de aprendices, justificación de inasistencias, etc.) envía automáticamente un correo al destinatario (aprendices a su correo personal; instructores/coordinadores a su correo de cuenta). Se incluyó el flag `enviarCorreo=false` para eventos que ya disponen de correo dedicado (calificación masiva) o mensajes de chat/comunicados masivos in-app.
  4. Rendimiento y límites SMTP: Se configuró en `lib/mail.ts` una cola con pool de conexiones (`pool: true`, `maxConnections: 3`, `maxMessages: 100`, tasa limitada a 5 msg/s) para despachar sin bloqueos ni rechazos por spam de Gmail al notificar a fichas completas.
  5. Despliegue: Sincronización vía Git, compilación de Next.js sin errores y reinicio de proceso PM2 `gss-backend` en el servidor Linux. ✅ Exitoso.
- **[2026-10-11 14:50]** (Fase 4 - Mejora / Recuperación de contraseña por correo):
  1. Diagnóstico: El flujo de `/olvido-clave` ya existía con generación de tokens (`password_reset_tokens`) y despacho SMTP, pero dependía exclusivamente de que el usuario ingresara la dirección exacta de `users.email` (correo institucional con coincidencia exacta y sensible a espacios/mayúsculas). Si un aprendiz o instructor ingresaba su correo personal o su documento, no se despachaba el correo.
  2. Solución en `actions/auth.actions.ts`: Búsqueda ampliada resiliente. Ahora acepta el correo institucional, el **correo personal** (`emailPersonal`), o el **número de documento**. Localiza la cuenta correspondiente y despacha el correo prioritariamente al buzón personal del usuario (`emailPersonal` de aprendiz o instructor).
  3. Plantilla corporativa: Se diseñó la plantilla `getRecuperacionPasswordEmailTemplate` en `lib/email-templates.ts` con botón de restablecimiento, enlace de respaldo seguro de 1 hora y mensaje institucional.
  4. Interfaz en `/olvido-clave`: Se actualizó `OlvidoClaveClient.tsx` para guiar al usuario a revisar tanto su correo personal como institucional y la carpeta de spam.
