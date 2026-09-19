# GSS — Gestión de Seguimiento SENA

**Sistema de gestión académica para la Media Técnica SENA Regional Magdalena.**

Versión actual: `v2.1.5`

---

## 🛠 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| Base de Datos | MySQL + Prisma ORM |
| Autenticación | NextAuth.js v4 |
| UI | Tailwind CSS + shadcn/ui |
| Lenguaje | TypeScript |

---

## 🚀 Instalación (Primera vez / Clonar en nueva máquina)

### Prerrequisitos
- **Node.js** v18 o superior → [descargar](https://nodejs.org)
- **MySQL** 8.0 o superior corriendo localmente
- La base de datos `Sena_Gss` creada en MySQL

### Opción A — Script automático (PowerShell)

```powershell
# Clonar el repositorio
git clone https://github.com/jereserrano/GSS-.git
cd GSS-

# Ejecutar el script de configuración
.\scripts\setup.ps1
```

### Opción B — Manual paso a paso

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de variables de entorno
cp .env.example .env
# → Editar .env con tus credenciales de MySQL

# 3. Generar el cliente Prisma
npx prisma generate

# 4. Sincronizar la base de datos (aplica migraciones SIN borrar datos)
npx prisma migrate deploy

# 5. Iniciar servidor de desarrollo
npm run dev
```

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
DATABASE_URL="mysql://root:TU_CONTRASENA@localhost:3306/Sena_Gss"
NEXTAUTH_SECRET="una-cadena-aleatoria-de-al-menos-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
```

> ⚠️ **Nunca subas el archivo `.env` al repositorio.** Está excluido en `.gitignore`.

---

## 🗄️ Base de Datos

### Sincronizar esquema (sin perder datos)

```bash
npx prisma migrate deploy
```

### Ver el estado de la BD en interfaz gráfica

```bash
npm run db:studio
```

### Crear usuario administrador inicial

```bash
node prisma/createAdmin.js
```

### Sembrar datos de ejemplo

```bash
npm run db:seed
```

---

## 📋 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Compilar para producción |
| `npm run db:migrate` | Crear nueva migración (desarrollo) |
| `npm run db:seed` | Sembrar datos de prueba |
| `npm run db:studio` | Abrir Prisma Studio |
| `npx prisma migrate deploy` | Aplicar migraciones en producción/nueva máquina |

---

## 🔐 Roles del Sistema

| Rol | Descripción |
|-----|-------------|
| `ADMINISTRADOR` | Acceso total al sistema |
| `COORDINADOR` | Gestión de fichas, instructores y reportes |
| `INSTRUCTOR` | Registro de asistencia, actividades y evaluaciones |
| `APRENDIZ` | Consulta de su propia información |
| `DOCENTE` | Seguimiento de aprendices en institución |

---

## 📁 Estructura del Proyecto

```
GSS/
├── app/              # Rutas Next.js (App Router)
├── actions/          # Server Actions
├── components/       # Componentes UI reutilizables
├── features/         # Módulos de negocio
├── lib/              # Utilidades y configuración
├── prisma/           # Schema y migraciones de BD
│   ├── schema.prisma
│   ├── migrations/   # Historial de migraciones
│   └── seed.ts       # Datos semilla
├── schemas/          # Validaciones Zod
├── types/            # Tipos TypeScript
└── scripts/          # Scripts de utilidad
```

---

## 📄 Historial de Versiones

| Versión | Descripción |
|---------|-------------|
| v2.1.5 | Sincronización BD via migraciones, nuevas vistas de fichas y competencias, mejoras de seguridad RBAC |
| v2.1.4 | Manuales APA7, auto-perfil en creación de usuarios, instructor autodetectado en asistencia |
| v2.1.3 | Documentación completa de jornada 18-Sep-2026 |
| v2.1.2 | Corrección crítica sesión/rol, tipos NextAuth, RBAC y seguridad JWT |
| v2.1 | Rediseño institucional SENA, habilitación rol aprendiz |
| v2.0 | Carga masiva, filtros avanzados y UI fixes |
| v1.1 | Sistema RBAC jerárquico, SecurityGuard, auditoría y roles |
| v1.0 | Versión inicial del proyecto |
