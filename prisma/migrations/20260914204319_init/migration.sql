-- CreateTable
CREATE TABLE `instituciones` (
    `id` VARCHAR(191) NOT NULL,
    `nit` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `municipio` VARCHAR(191) NOT NULL,
    `departamento` VARCHAR(191) NOT NULL DEFAULT 'Magdalena',
    `direccion` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `rector` VARCHAR(191) NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `instituciones_nit_key`(`nit`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sedes` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `institucionId` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NULL,
    `barrio` VARCHAR(191) NULL,
    `municipio` VARCHAR(191) NULL,
    `esPrincipal` BOOLEAN NOT NULL DEFAULT false,
    `coordinador` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `programas` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `nivelFormacion` ENUM('TECNICO', 'TECNOLOGO', 'OPERARIO') NOT NULL DEFAULT 'TECNICO',
    `estado` ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `programas_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fichas` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `programaId` VARCHAR(191) NOT NULL,
    `institucionId` VARCHAR(191) NOT NULL,
    `sedeId` VARCHAR(191) NOT NULL,
    `fechaInicio` DATETIME(3) NOT NULL,
    `fechaFin` DATETIME(3) NOT NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `jornada` VARCHAR(191) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fichas_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aprendices` (
    `id` VARCHAR(191) NOT NULL,
    `tipoDocumento` ENUM('CC', 'TI', 'CE', 'PP') NOT NULL DEFAULT 'CC',
    `numeroDocumento` VARCHAR(191) NOT NULL,
    `nombres` VARCHAR(191) NOT NULL,
    `apellidos` VARCHAR(191) NOT NULL,
    `fechaNacimiento` DATETIME(3) NULL,
    `genero` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `emailPersonal` VARCHAR(191) NULL,
    `emailSena` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NULL,
    `fichaId` VARCHAR(191) NOT NULL,
    `estado` ENUM('EN_FORMACION', 'EGRESADO', 'RETIRADO', 'APLAZADO', 'CANCELADO') NOT NULL DEFAULT 'EN_FORMACION',
    `nivelRiesgo` ENUM('BAJO', 'MEDIO', 'ALTO') NOT NULL DEFAULT 'BAJO',
    `porcentajeAsistencia` DOUBLE NOT NULL DEFAULT 100.0,
    `promedioAcumulado` DOUBLE NOT NULL DEFAULT 0.0,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `aprendices_numeroDocumento_key`(`numeroDocumento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instructores` (
    `id` VARCHAR(191) NOT NULL,
    `tipoDocumento` ENUM('CC', 'TI', 'CE', 'PP') NOT NULL DEFAULT 'CC',
    `numeroDocumento` VARCHAR(191) NOT NULL,
    `nombres` VARCHAR(191) NOT NULL,
    `apellidos` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NULL,
    `profesion` VARCHAR(191) NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `instructores_numeroDocumento_key`(`numeroDocumento`),
    UNIQUE INDEX `instructores_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `docentes` (
    `id` VARCHAR(191) NOT NULL,
    `nombres` VARCHAR(191) NOT NULL,
    `apellidos` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NULL,
    `asignatura` VARCHAR(191) NULL,
    `institucionNombre` VARCHAR(191) NULL,
    `sedeNombre` VARCHAR(191) NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `docentes_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `competencias` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nombre` TEXT NOT NULL,
    `programaId` VARCHAR(191) NOT NULL,
    `tipo` ENUM('TECNICA', 'TRANSVERSAL', 'BASICA') NOT NULL DEFAULT 'TECNICA',
    `duracionHoras` INTEGER NOT NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `competencias_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resultados_aprendizaje` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nombre` TEXT NOT NULL,
    `competenciaId` VARCHAR(191) NOT NULL,
    `fase` ENUM('ANALISIS', 'PLANEACION', 'EJECUCION', 'EVALUACION') NOT NULL DEFAULT 'ANALISIS',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `actividades` (
    `id` VARCHAR(191) NOT NULL,
    `fichaId` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `tipo` ENUM('TALLER', 'PROYECTO', 'FORO', 'QUIZ') NOT NULL DEFAULT 'TALLER',
    `fechaVencimiento` DATETIME(3) NOT NULL,
    `estado` ENUM('ACTIVA', 'CERRADA', 'BORRADOR') NOT NULL DEFAULT 'ACTIVA',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entregas` (
    `id` VARCHAR(191) NOT NULL,
    `actividadId` VARCHAR(191) NOT NULL,
    `aprendizId` VARCHAR(191) NOT NULL,
    `fechaEntrega` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `urlArchivo` VARCHAR(191) NULL,
    `comentario` TEXT NULL,
    `estado` ENUM('PENDIENTE', 'CALIFICADA', 'TARDIA') NOT NULL DEFAULT 'PENDIENTE',
    `calificacion` VARCHAR(191) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `entregas_actividadId_aprendizId_key`(`actividadId`, `aprendizId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asistencias` (
    `id` VARCHAR(191) NOT NULL,
    `fichaId` VARCHAR(191) NOT NULL,
    `instructorId` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `totalPresentes` INTEGER NOT NULL DEFAULT 0,
    `totalFaltas` INTEGER NOT NULL DEFAULT 0,
    `totalExcusas` INTEGER NOT NULL DEFAULT 0,
    `observaciones` TEXT NULL,
    `estado` ENUM('PENDIENTE', 'REGISTRADA') NOT NULL DEFAULT 'PENDIENTE',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `asistencias_fichaId_fecha_key`(`fichaId`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluaciones_aprendiz` (
    `id` VARCHAR(191) NOT NULL,
    `aprendizId` VARCHAR(191) NOT NULL,
    `resultadoAprendizajeId` VARCHAR(191) NOT NULL,
    `juicio` ENUM('APROBADO', 'DEFICIENTE', 'PENDIENTE') NOT NULL DEFAULT 'PENDIENTE',
    `fecha` DATETIME(3) NULL,
    `observaciones` TEXT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `evaluaciones_aprendiz_aprendizId_resultadoAprendizajeId_key`(`aprendizId`, `resultadoAprendizajeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alertas_riesgo` (
    `id` VARCHAR(191) NOT NULL,
    `aprendizId` VARCHAR(191) NOT NULL,
    `motivo` VARCHAR(191) NOT NULL,
    `nivel` ENUM('BAJO', 'MEDIO', 'ALTO') NOT NULL DEFAULT 'MEDIO',
    `fechaDeteccion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `gestionada` BOOLEAN NOT NULL DEFAULT false,
    `observaciones` TEXT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visitas_seguimiento` (
    `id` VARCHAR(191) NOT NULL,
    `institucionNombre` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `responsable` VARCHAR(191) NOT NULL,
    `novedades` INTEGER NOT NULL DEFAULT 0,
    `observaciones` TEXT NULL,
    `estado` ENUM('PROGRAMADA', 'REALIZADA', 'APLAZADA') NOT NULL DEFAULT 'PROGRAMADA',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `rolId` VARCHAR(191) NOT NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `ultimoAcceso` DATETIME(3) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,

    UNIQUE INDEX `roles_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `modulo` VARCHAR(191) NOT NULL,
    `accion` VARCHAR(191) NOT NULL,
    `detalle` TEXT NOT NULL,
    `ip` VARCHAR(191) NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sedes` ADD CONSTRAINT `sedes_institucionId_fkey` FOREIGN KEY (`institucionId`) REFERENCES `instituciones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fichas` ADD CONSTRAINT `fichas_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `programas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fichas` ADD CONSTRAINT `fichas_institucionId_fkey` FOREIGN KEY (`institucionId`) REFERENCES `instituciones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fichas` ADD CONSTRAINT `fichas_sedeId_fkey` FOREIGN KEY (`sedeId`) REFERENCES `sedes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aprendices` ADD CONSTRAINT `aprendices_fichaId_fkey` FOREIGN KEY (`fichaId`) REFERENCES `fichas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `competencias` ADD CONSTRAINT `competencias_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `programas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resultados_aprendizaje` ADD CONSTRAINT `resultados_aprendizaje_competenciaId_fkey` FOREIGN KEY (`competenciaId`) REFERENCES `competencias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `actividades` ADD CONSTRAINT `actividades_fichaId_fkey` FOREIGN KEY (`fichaId`) REFERENCES `fichas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entregas` ADD CONSTRAINT `entregas_actividadId_fkey` FOREIGN KEY (`actividadId`) REFERENCES `actividades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entregas` ADD CONSTRAINT `entregas_aprendizId_fkey` FOREIGN KEY (`aprendizId`) REFERENCES `aprendices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asistencias` ADD CONSTRAINT `asistencias_fichaId_fkey` FOREIGN KEY (`fichaId`) REFERENCES `fichas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asistencias` ADD CONSTRAINT `asistencias_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluaciones_aprendiz` ADD CONSTRAINT `evaluaciones_aprendiz_aprendizId_fkey` FOREIGN KEY (`aprendizId`) REFERENCES `aprendices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluaciones_aprendiz` ADD CONSTRAINT `evaluaciones_aprendiz_resultadoAprendizajeId_fkey` FOREIGN KEY (`resultadoAprendizajeId`) REFERENCES `resultados_aprendizaje`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alertas_riesgo` ADD CONSTRAINT `alertas_riesgo_aprendizId_fkey` FOREIGN KEY (`aprendizId`) REFERENCES `aprendices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
