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
- **[2026-10-10 10:29]** (Fase 3 - Corrección) Resolución de error de "Tabla no existe" en Linux debido a la sensibilidad a mayúsculas/minúsculas de MySQL (`lower_case_table_names=0`). Se renombró la tabla `_competenciatoprograma` a `_CompetenciaToPrograma` para coincidir con el esquema exacto de Prisma. Reinicio de PM2. ✅ Exitoso.
