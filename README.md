# GSS — Gestión de Seguimiento SENA

**Sistema de gestión académica para la Media Técnica SENA Regional Magdalena.**

Versión funcional actual: `v3.0.0` | Versión de control y saneamiento: `v3.0.1`  
Repositorio oficial: [https://github.com/jereserrano/GSS-.git](https://github.com/jereserrano/GSS-.git)  
Rama activa: `main`

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Versión Verificada |
|------|-----------|--------------------|
| Framework Web | Next.js (App Router) | `16.3.7` (React 19) |
| Runtime / Servidor | Node.js / npm | Node `v24.21.0 LTS` / npm `11.19.0` |
| Base de Datos | MySQL Server | `8.4.11 LTS` (`Sena_Gss` / `gss`) |
| ORM | Prisma | `6.19.3` (36 modelos relacionales) |
| Servidor Web / Proxy | Nginx | `1.28.3` (puerto 80) |
| Process Manager | PM2 | `7.0.4` (proceso `gss`) |
| Autenticación / 2FA | NextAuth.js v4 + Otplib | JWT + TOTP + bcrypt |
| UI & Estilos | Tailwind CSS v4 + Radix UI + Lucide | Vanilla CSS / Componentes accesibles |
| Infraestructura | VirtualBox / Ubuntu Server | Ubuntu `26.04.1 LTS` (VM `PEPE`, 4 vCPU, 4GB RAM, 2GB Swap) |

---

## 🚀 Instalación y Despliegue Local

### Prerrequisitos
- **Node.js** v20 LTS o v24 LTS recomendada → [descargar](https://nodejs.org)
- **MySQL** 8.0 o 8.4 LTS corriendo localmente
- La base de datos `Sena_Gss` (o `gss`) creada en MySQL con cotejamiento `utf8mb4_unicode_ci`

### Opción A — Script automático (PowerShell en Windows)

```powershell
# Clonar el repositorio personal
git clone https://github.com/jereserrano/GSS-.git
cd GSS-

# Ejecutar el script de configuración inicial
.\scripts\setup.ps1
```

### Opción B — Manual paso a paso

```bash
# 1. Instalar dependencias exactas
npm install

# 2. Configurar variables de entorno desde la plantilla
cp .env.example .env
# → Configurar credenciales locales en .env (DATABASE_URL, NEXTAUTH_SECRET, etc.)

# 3. Generar el cliente de Prisma
npx prisma generate

# 4. Sincronizar el esquema de base de datos
# NOTA: En V3.0 el esquema incorpora tablas y columnas aditivas posteriores a la migración v2.1.5.
# Para aplicar cambios de forma segura y no destructiva sin perder datos:
npx prisma db push

# 5. Iniciar servidor de desarrollo
npm run dev
```

---

## ⚙️ Variables de Entorno

El proyecto incluye la plantilla oficial obligatoria [`.env.example`](.env.example). Crea un archivo `.env` en la raíz del proyecto (nunca versionado en Git) con las variables requeridas:

```env
# Conexión MySQL
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/Sena_Gss"

# Autenticación NextAuth
NEXTAUTH_SECRET="tu-clave-secreta-de-al-menos-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"

# Google Drive (Respaldo opcional de portafolio)
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# Notificaciones y Recuperación de Contraseña por Correo (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="tu-correo@sena.edu.co"
SMTP_PASS="tu-contrasena-de-aplicacion"
SMTP_FROM='"GSS Media Técnica" <tu-correo@sena.edu.co>'
```

> ⚠️ **Seguridad:** El archivo `.env` contiene credenciales sensibles y está estrictamente excluido por `.gitignore`. Nunca debe ser subido al repositorio.

---

## 🗄️ Base de Datos y Migraciones

### Sincronización del esquema (No destructiva)

```bash
# Generar cliente tipado
npx prisma generate

# Sincronizar esquema actual con la base de datos preservando datos
npx prisma db push
```

### Inspección visual con Prisma Studio

```bash
npm run db:studio
```

### Creación de administrador inicial y datos de prueba

```bash
# Crear usuario administrador (admin@sena.edu.co / contraseña unificada)
node create_admin.js

# Poblar datos académicos de prueba (FakerES)
npm run db:seed
```

---

## 💻 Entorno de Desarrollo y Trabajo con Cloud Antigravity

Para asegurar la coherencia entre el entorno local en Windows, la máquina virtual de pruebas y Cloud Antigravity:

1. **Directorio de trabajo:** `C:\GSS` (mapeado en Antigravity al repositorio `jereserrano/GSS-`).
2. **Control de ramas:** Trabajar siempre sobre la rama `main` para desarrollo personal, manteniendo sincronizada la rama de respaldo `v3`.
3. **Máquina Virtual (Ubuntu Server):** 
   - VM `PEPE` en VirtualBox con reenvío NAT:
     - Puerto SSH: `127.0.0.1:2222` -> `VM:22`
     - Puerto Web Directo: `127.0.0.1:3000` -> `VM:3000`
     - Puerto Web Nginx: `127.0.0.1:80` -> `VM:80`
   - El servicio de producción corre gestionado por PM2 (`pm2 status`, proceso `gss`).
4. **Regla de integridad:** Antes de realizar commits, verificar que no se incluyan archivos temporales, respaldos de base de datos (`.sql`) ni archivos `.env`.

---

## 📋 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Compilar aplicación para producción con Webpack |
| `npm run start` | Iniciar servidor de producción local |
| `npm run lint` | Ejecutar análisis estático con ESLint |
| `npm run db:generate` | Regenerar cliente Prisma tras modificar `schema.prisma` |
| `npx prisma db push` | Sincronizar esquema aditivamente con la base de datos activa |
| `npm run db:studio` | Abrir interfaz gráfica web de Prisma en puerto 5555 |
| `npm test` | Ejecutar pruebas unitarias con Vitest |

---

## 🔐 Roles del Sistema (RBAC)

| Rol | Alcance y Descripción |
|-----|------------------------|
| `ADMINISTRADOR` | Acceso total al sistema, sedes, instituciones, usuarios, roles y auditoría global |
| `COORDINADOR_SEDE` | Supervisión y gestión acotada estrictamente a su subsede asignada (`sedeId`) |
| `COORDINADOR` | Gestión académica, asignación de carga, fichas e instituciones |
| `INSTRUCTOR` | Registro de asistencias nominales, gestión de actividades, calificación de entregas y clases virtuales |
| `APRENDIZ` | Visualización de notas, historial de entregas, reporte de inasistencias y excusas médicas |
| `DOCENTE` | Seguimiento pedagógico institucional de aprendices integrados con la Media Técnica |

---

## 📁 Estructura del Proyecto

```
GSS/
├── actions/          # Server Actions seguras con RBAC (lib/rbac.ts)
├── app/              # Rutas Next.js App Router (Dashboard, APIs, Vistas)
├── components/       # Componentes de interfaz reutilizables
├── features/         # Módulos funcionales de negocio (fichas, aprendices, etc.)
├── lib/              # Utilidades centrales (auth, prisma, rbac, mail, auditoría)
├── prisma/           # Esquema relacional (schema.prisma), seeds y migraciones
├── public/           # Recursos estáticos, plantillas Excel y manuales
├── repositories/     # Patrón Repository para desacoplar consultas de Prisma
├── schemas/          # Validaciones estrictas de esquemas Zod
├── scripts/          # Scripts de utilidad, mantenimiento y configuración
├── services/         # Servicios de dominio (riesgos, Google Drive, etc.)
├── types/            # Definiciones de tipos TypeScript
└── tests/            # Pruebas automatizadas (Unitarias y E2E)
```

---

## 📄 Historial de Versiones

| Versión | Estado / Tag | Descripción |
|---------|--------------|-------------|
| **v3.0.1** | `v3.0.1` | **Saneamiento institucional de seguridad y control de versiones:** Actualización integral de `.gitignore`, desindexación de volcados de base de datos (`.sql`), logs y uploads transaccionales; incorporación del Informe Administrativo V3.0 oficial y directrices para desarrollo personal independiente. |
| **v3.0.0** | `v3.0.0` | **Versión oficial de producción desplegada en Ubuntu Server:** Aislamiento estricto por sede (`COORDINADOR_SEDE`), recuperación de contraseña multi-canal (documento / correo personal), notificaciones automáticas vía email a aprendices (`emailPersonal`), sincronización masiva de notas con entregas, PWA offline y estabilización de memoria en Linux. |
| v2.2.5 | `v2.2.5` | Módulo de cartas, Service Worker robusto, corrección de paginación en Gestor de Actividades y soporte de plantillas APA |
| v2.2.4 | `v2.2.4` | Versión estable para migración y despliegue, actualización de scripts de BD |
| v2.2.3 | `v2.2.3` | Módulo de Mensajería, 2FA, Gestor de Excusas con Auditoría y Migración completa de BD |
| v2.1.5 | `v2.1.5` | Sincronización BD via migraciones, nuevas vistas de fichas y competencias, mejoras de seguridad RBAC |
| v2.1.4 | `v2.1.4` | Manuales APA7, auto-perfil en creación de usuarios, instructor autodetectado en asistencia |
| v2.1.3 | `v2.1.3` | Documentación completa de jornada 18-Sep-2026 |
| v2.1.2 | `v2.1.2` | Corrección crítica sesión/rol, tipos NextAuth, RBAC y seguridad JWT |
| v2.1 | `v2.1` | Rediseño institucional SENA, habilitación rol aprendiz |
| v2.0 | `v2.0` | Carga masiva, filtros avanzados y UI fixes |
| v1.1 | `V1.1` | Sistema RBAC jerárquico, SecurityGuard, auditoría y roles |
| v1.0 | — | Versión inicial del proyecto GSS |

