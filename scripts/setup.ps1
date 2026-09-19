# GSS - Script de Configuración Inicial (PowerShell)
# Ejecutar después de clonar el repositorio

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  GSS - Configuración Inicial v2.1.5   " -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node.js
Write-Host "[1/5] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "     ✅ Node.js $nodeVersion encontrado" -ForegroundColor Green
} catch {
    Write-Host "     ❌ Node.js no encontrado. Instala desde https://nodejs.org" -ForegroundColor Red
    exit 1
}

# 2. Instalar dependencias
Write-Host "[2/5] Instalando dependencias npm..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "     ❌ Error en npm install" -ForegroundColor Red; exit 1 }
Write-Host "     ✅ Dependencias instaladas" -ForegroundColor Green

# 3. Configurar variables de entorno
Write-Host "[3/5] Configurando variables de entorno..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "     ⚠️  Archivo .env creado desde .env.example" -ForegroundColor Yellow
    Write-Host "     👉 IMPORTANTE: Edita .env con tus credenciales de base de datos antes de continuar" -ForegroundColor Magenta
    Write-Host ""
    Read-Host "     Presiona ENTER cuando hayas editado el archivo .env"
} else {
    Write-Host "     ✅ Archivo .env ya existe" -ForegroundColor Green
}

# 4. Generar cliente Prisma
Write-Host "[4/5] Generando cliente Prisma..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) { Write-Host "     ❌ Error en prisma generate" -ForegroundColor Red; exit 1 }
Write-Host "     ✅ Cliente Prisma generado" -ForegroundColor Green

# 5. Aplicar migraciones de base de datos (SIN borrar datos)
Write-Host "[5/5] Aplicando migraciones de base de datos..." -ForegroundColor Yellow
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "     ❌ Error al aplicar migraciones" -ForegroundColor Red
    Write-Host "     💡 Verifica que tu DATABASE_URL en .env sea correcta y que MySQL esté corriendo" -ForegroundColor Yellow
    exit 1
}
Write-Host "     ✅ Base de datos sincronizada" -ForegroundColor Green

Write-Host ""
Write-Host "=======================================" -ForegroundColor Green
Write-Host "  ✅ Configuración completada          " -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar el servidor de desarrollo:" -ForegroundColor Cyan
Write-Host "    npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Para crear el usuario administrador inicial:" -ForegroundColor Cyan
Write-Host "    node prisma/createAdmin.js" -ForegroundColor White
Write-Host ""
