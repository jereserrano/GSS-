-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: Sena_Gss
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_competenciatoprograma`
--

DROP TABLE IF EXISTS `_competenciatoprograma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_competenciatoprograma` (
  `A` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `B` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `_CompetenciaToPrograma_AB_unique` (`A`,`B`),
  KEY `_CompetenciaToPrograma_B_index` (`B`),
  CONSTRAINT `_CompetenciaToPrograma_A_fkey` FOREIGN KEY (`A`) REFERENCES `competencias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_CompetenciaToPrograma_B_fkey` FOREIGN KEY (`B`) REFERENCES `programas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_competenciatoprograma`
--

LOCK TABLES `_competenciatoprograma` WRITE;
/*!40000 ALTER TABLE `_competenciatoprograma` DISABLE KEYS */;
INSERT INTO `_competenciatoprograma` VALUES ('cmv1g4mps0024ump4skwmr5hy','cmv1fz66w0003umwgh9y1ujzj'),('cmv1g4mql0025ump4ochr5590','cmv1fz66w0003umwgh9y1ujzj'),('cmv1ghmns0000um4sdhhzrzxp','cmv1fz66w0003umwgh9y1ujzj'),('cmv1ghmpd0001um4soqhzhqny','cmv1fz66w0003umwgh9y1ujzj'),('cmv1ghmpu0002um4sn5nf9tnj','cmv1fz66w0003umwgh9y1ujzj');
/*!40000 ALTER TABLE `_competenciatoprograma` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actividades`
--

DROP TABLE IF EXISTS `actividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividades` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fichaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `instrucciones` text COLLATE utf8mb4_unicode_ci,
  `tipo` enum('TALLER','PROYECTO','FORO','QUIZ') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TALLER',
  `fechaInicio` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fechaVencimiento` datetime(3) NOT NULL,
  `estado` enum('ACTIVA','CERRADA','BORRADOR','PUBLICADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVA',
  `instructorId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resultadoAprendizajeId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `actividades_fichaId_fkey` (`fichaId`),
  KEY `actividades_instructorId_fkey` (`instructorId`),
  KEY `actividades_resultadoAprendizajeId_fkey` (`resultadoAprendizajeId`),
  CONSTRAINT `actividades_fichaId_fkey` FOREIGN KEY (`fichaId`) REFERENCES `fichas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `actividades_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `actividades_resultadoAprendizajeId_fkey` FOREIGN KEY (`resultadoAprendizajeId`) REFERENCES `resultados_aprendizaje` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividades`
--

LOCK TABLES `actividades` WRITE;
/*!40000 ALTER TABLE `actividades` DISABLE KEYS */;
INSERT INTO `actividades` VALUES ('cmv1g4mrm002dump4lv7pverj','cmv1fz68a0005umwg8k258ogc','Taller de Java B├ísicos',NULL,NULL,'TALLER','2024-02-01 00:00:00.000','2024-03-01 00:00:00.000','CERRADA','cmv1fz6sy0009umwgapo491in','cmv1g4mqs0027ump4kc6r8ik8','2026-10-09 20:56:58.690','2026-10-09 20:56:58.690'),('cmv1g4mw2003jump4ewh5rzb0','cmv1fz68a0005umwg8k258ogc','Proyecto Tienda Online',NULL,NULL,'PROYECTO','2024-02-01 00:00:00.000','2024-03-01 00:00:00.000','CERRADA','cmv1fz6sy0009umwgapo491in','cmv1g4mr60029ump4mobb6p39','2026-10-09 20:56:58.851','2026-10-09 20:56:58.851'),('cmv1g4mzr004pump4y06m4ujk','cmv1fz68a0005umwg8k258ogc','Diagrama de Clases UML',NULL,NULL,'TALLER','2024-02-01 00:00:00.000','2024-03-01 00:00:00.000','CERRADA','cmv1fz6sy0009umwgapo491in','cmv1g4mrd002bump4bwx81fg1','2026-10-09 20:56:58.983','2026-10-09 20:56:58.983');
/*!40000 ALTER TABLE `actividades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alertas_riesgo`
--

DROP TABLE IF EXISTS `alertas_riesgo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alertas_riesgo` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aprendizId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nivel` enum('BAJO','MEDIO','ALTO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIO',
  `fechaDeteccion` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `gestionada` tinyint(1) NOT NULL DEFAULT '0',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `alertas_riesgo_aprendizId_fkey` (`aprendizId`),
  CONSTRAINT `alertas_riesgo_aprendizId_fkey` FOREIGN KEY (`aprendizId`) REFERENCES `aprendices` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertas_riesgo`
--

LOCK TABLES `alertas_riesgo` WRITE;
/*!40000 ALTER TABLE `alertas_riesgo` DISABLE KEYS */;
/*!40000 ALTER TABLE `alertas_riesgo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aprendices`
--

DROP TABLE IF EXISTS `aprendices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aprendices` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipoDocumento` enum('CC','TI','CE','PP') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CC',
  `numeroDocumento` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombres` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fechaNacimiento` datetime(3) DEFAULT NULL,
  `genero` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emailPersonal` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emailSena` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fichaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('EN_FORMACION','EGRESADO','RETIRADO','APLAZADO','CANCELADO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EN_FORMACION',
  `nivelRiesgo` enum('BAJO','MEDIO','ALTO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BAJO',
  `porcentajeAsistencia` double NOT NULL DEFAULT '100',
  `promedioAcumulado` double NOT NULL DEFAULT '0',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `aprendices_numeroDocumento_key` (`numeroDocumento`),
  UNIQUE KEY `aprendices_userId_key` (`userId`),
  KEY `aprendices_fichaId_fkey` (`fichaId`),
  CONSTRAINT `aprendices_fichaId_fkey` FOREIGN KEY (`fichaId`) REFERENCES `fichas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `aprendices_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aprendices`
--

LOCK TABLES `aprendices` WRITE;
/*!40000 ALTER TABLE `aprendices` DISABLE KEYS */;
INSERT INTO `aprendices` VALUES ('cmv1fz6w0000fumwgvz3eefbb','CC','1000000002','Iv├ín','Aprendiz',NULL,NULL,'','camachoyefry5@gmail.com','ivan@sena.edu.co',NULL,'cmv1fz68a0005umwg8k258ogc','EN_FORMACION','BAJO',100,0,'cmv1fz6uv000dumwgmr6036qk','2026-10-09 20:52:44.831','2026-10-09 21:26:48.528');
/*!40000 ALTER TABLE `aprendices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignaciones_carga`
--

DROP TABLE IF EXISTS `asignaciones_carga`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignaciones_carga` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instructorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fichaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resultadoAprendizajeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asignadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `asignaciones_carga_instructorId_fichaId_resultadoAprendizaje_key` (`instructorId`,`fichaId`,`resultadoAprendizajeId`),
  KEY `asignaciones_carga_fichaId_fkey` (`fichaId`),
  KEY `asignaciones_carga_resultadoAprendizajeId_fkey` (`resultadoAprendizajeId`),
  CONSTRAINT `asignaciones_carga_fichaId_fkey` FOREIGN KEY (`fichaId`) REFERENCES `fichas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `asignaciones_carga_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructores` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `asignaciones_carga_resultadoAprendizajeId_fkey` FOREIGN KEY (`resultadoAprendizajeId`) REFERENCES `resultados_aprendizaje` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones_carga`
--

LOCK TABLES `asignaciones_carga` WRITE;
/*!40000 ALTER TABLE `asignaciones_carga` DISABLE KEYS */;
/*!40000 ALTER TABLE `asignaciones_carga` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencias`
--

DROP TABLE IF EXISTS `asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencias` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fichaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instructorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` datetime(3) NOT NULL,
  `totalPresentes` int NOT NULL DEFAULT '0',
  `totalFaltas` int NOT NULL DEFAULT '0',
  `totalExcusas` int NOT NULL DEFAULT '0',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `estado` enum('PENDIENTE','REGISTRADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `asistencias_fichaId_fecha_key` (`fichaId`,`fecha`),
  KEY `asistencias_instructorId_fkey` (`instructorId`),
  CONSTRAINT `asistencias_fichaId_fkey` FOREIGN KEY (`fichaId`) REFERENCES `fichas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `asistencias_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructores` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias`
--

LOCK TABLES `asistencias` WRITE;
/*!40000 ALTER TABLE `asistencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `asistencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modulo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accion` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detalle` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `entidad` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entidadId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `valoresAnteriores` json DEFAULT NULL,
  `valoresNuevos` json DEFAULT NULL,
  `ip` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_userId_fkey` (`userId`),
  CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES ('cmv1g9i090001umskcs6f3b84','cmv1fz6sa0007umwgbs2t6kiq','SEGURIDAD','LOGIN','Inicio de sesi├│n exitoso de isaias@sena.edu.co (Rol: INSTRUCTOR)','User','cmv1fz6sa0007umwgbs2t6kiq','null','null','127.0.0.1','2026-10-09 21:00:45.797'),('cmv1gblzm000pumsk4ixb42no','cmv1fz6uv000dumwgmr6036qk','SEGURIDAD','LOGIN','Inicio de sesi├│n exitoso de ivan@sena.edu.co (Rol: APRENDIZ)','User','cmv1fz6uv000dumwgmr6036qk','null','null','127.0.0.1','2026-10-09 21:02:24.274'),('cmv1h6dx00003umns3oms2rdj','cmv1fz6uv000dumwgmr6036qk','SEGURIDAD','LOGIN','Inicio de sesi├│n exitoso de ivan@sena.edu.co (Rol: APRENDIZ)','User','cmv1fz6uv000dumwgmr6036qk','null','null','127.0.0.1','2026-10-09 21:26:20.147'),('cmv1h8vok0007umnsksj17ejq','cmv1fz6sa0007umwgbs2t6kiq','SEGURIDAD','LOGIN','Inicio de sesi├│n exitoso de isaias@sena.edu.co (Rol: INSTRUCTOR)','User','cmv1fz6sa0007umwgbs2t6kiq','null','null','127.0.0.1','2026-10-09 21:28:16.484'),('cmv1h9m4v001dumnsedjfyqcy','cmv1fz6sa0007umwgbs2t6kiq','Evaluaciones','ACTUALIZAR','Calificaci├│n masiva para RAP ID: cmv1ghmqr0006um4s07z3iqqj en Ficha ID: cmv1fz68a0005umwg8k258ogc (20 aprendices)',NULL,NULL,'null','null','127.0.0.1','2026-10-09 21:28:50.767'),('cmv1hpqve000numdgrsurg1v8','cmv1fz6uv000dumwgmr6036qk','SEGURIDAD','LOGIN','Inicio de sesi├│n exitoso de ivan@sena.edu.co (Rol: APRENDIZ)','User','cmv1fz6uv000dumwgmr6036qk','null','null','127.0.0.1','2026-10-09 21:41:23.401'),('cmv2aasit0001um4gc65axmyx','cmv1fz6wg000humwgqurflxsd','SEGURIDAD','LOGIN','Inicio de sesi├│n exitoso de admin@sena.edu.co (Rol: ADMINISTRADOR)','User','cmv1fz6wg000humwgqurflxsd','null','null','127.0.0.1','2026-10-10 11:01:34.549'),('cmv2bzlv30003umukjd13zzpa','cmv1fz6uv000dumwgmr6036qk','SEGURIDAD','LOGIN','Inicio de sesi├│n exitoso de ivan@sena.edu.co (Rol: APRENDIZ)','User','cmv1fz6uv000dumwgmr6036qk','null','null','127.0.0.1','2026-10-10 11:48:51.951'),('cmv2c0opj0009umukth3opqyl','cmv1fz6sa0007umwgbs2t6kiq','SEGURIDAD','LOGIN','Inicio de sesi├│n exitoso de isaias@sena.edu.co (Rol: INSTRUCTOR)','User','cmv1fz6sa0007umwgbs2t6kiq','null','null','127.0.0.1','2026-10-10 11:49:42.294'),('cmv2c246s000dumukdljesp2i','cmv1fz6uv000dumwgmr6036qk','SEGURIDAD','LOGIN','Inicio de sesi├│n exitoso de ivan@sena.edu.co (Rol: APRENDIZ)','User','cmv1fz6uv000dumwgmr6036qk','null','null','127.0.0.1','2026-10-10 11:50:49.013');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clases_virtuales`
--

DROP TABLE IF EXISTS `clases_virtuales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clases_virtuales` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `enlaceUrl` text COLLATE utf8mb4_unicode_ci,
  `zoomMeetingId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaInicio` datetime(3) NOT NULL,
  `duracionMin` int NOT NULL,
  `fichaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instructorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVO',
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `clases_virtuales_fichaId_fkey` (`fichaId`),
  KEY `clases_virtuales_instructorId_fkey` (`instructorId`),
  CONSTRAINT `clases_virtuales_fichaId_fkey` FOREIGN KEY (`fichaId`) REFERENCES `fichas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `clases_virtuales_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructores` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clases_virtuales`
--

LOCK TABLES `clases_virtuales` WRITE;
/*!40000 ALTER TABLE `clases_virtuales` DISABLE KEYS */;
INSERT INTO `clases_virtuales` VALUES ('cmv2c37pe000fumuk6tifpyl9','Programaci├│n 1','Programaci├│n dirigida a objetos ','https://us05web.zoom.us/j/88515682700?pwd=uudp75SrfapQfzgi9mVKaqbVNAW3qN.1','88515682700','2026-10-13 13:00:00.000',60,'cmv1fz68a0005umwg8k258ogc','cmv1fz6sy0009umwgapo491in','ACTIVO','2026-10-10 11:51:40.226');
/*!40000 ALTER TABLE `clases_virtuales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `competencias`
--

DROP TABLE IF EXISTS `competencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `competencias` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('TECNICA','TRANSVERSAL','BASICA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TECNICA',
  `duracionHoras` int NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVO',
  `urlGuia` text COLLATE utf8mb4_unicode_ci,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `competencias_codigo_key` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `competencias`
--

LOCK TABLES `competencias` WRITE;
/*!40000 ALTER TABLE `competencias` DISABLE KEYS */;
INSERT INTO `competencias` VALUES ('cmuzwyn560004umc0noan5dji','COMP-4548','Competencia T├®cnica en An├ílisis y Desarrollo de Software','TECNICA',120,'ACTIVO',NULL,'2026-10-08 19:12:40.363','2026-10-08 19:12:40.363'),('cmuzwyn5l0005umc0f7pvpsyw','COMP-2236','Competencia Transversal (├ëtica/Biling├╝ismo) An├ílisis y Desarrollo de Software','TRANSVERSAL',48,'ACTIVO',NULL,'2026-10-08 19:12:40.377','2026-10-08 19:12:40.377'),('cmuzwyn69000aumc02g9zem6h','COMP-4064','Competencia T├®cnica en Gesti├│n Log├¡stica','TECNICA',120,'ACTIVO',NULL,'2026-10-08 19:12:40.402','2026-10-08 19:12:40.402'),('cmuzwyn6h000bumc0xvgumwlz','COMP-6958','Competencia Transversal (├ëtica/Biling├╝ismo) Gesti├│n Log├¡stica','TRANSVERSAL',48,'ACTIVO',NULL,'2026-10-08 19:12:40.409','2026-10-08 19:12:40.409'),('cmuzwyn6x000gumc0tkntx80t','COMP-1160','Competencia T├®cnica en Sistemas','TECNICA',120,'ACTIVO',NULL,'2026-10-08 19:12:40.426','2026-10-08 19:12:40.426'),('cmuzwyn73000humc08u1rccud','COMP-5562','Competencia Transversal (├ëtica/Biling├╝ismo) Sistemas','TRANSVERSAL',48,'ACTIVO',NULL,'2026-10-08 19:12:40.431','2026-10-08 19:12:40.431'),('cmuzwyn7j000mumc0opz5ty0r','COMP-6650','Competencia T├®cnica en Cocina','TECNICA',120,'ACTIVO',NULL,'2026-10-08 19:12:40.447','2026-10-08 19:12:40.447'),('cmuzwyn7o000numc0s4rubqmq','COMP-9281','Competencia Transversal (├ëtica/Biling├╝ismo) Cocina','TRANSVERSAL',48,'ACTIVO',NULL,'2026-10-08 19:12:40.453','2026-10-08 19:12:40.453'),('cmv1g4mps0024ump4skwmr5hy','COMP-01','Construir el sistema que cumpla con los requisitos','TECNICA',120,'ACTIVO',NULL,'2026-10-09 20:56:58.625','2026-10-09 20:56:58.625'),('cmv1g4mql0025ump4ochr5590','COMP-02','Dise├▒ar la arquitectura del software','TECNICA',100,'ACTIVO',NULL,'2026-10-09 20:56:58.653','2026-10-09 20:56:58.653'),('cmv1ghmns0000um4sdhhzrzxp','COMP-03','Implantar la soluci├│n de software','TECNICA',80,'ACTIVO',NULL,'2026-10-09 21:07:05.080','2026-10-09 21:07:05.080'),('cmv1ghmpd0001um4soqhzhqny','COMP-04','Administrar bases de datos','TECNICA',90,'ACTIVO',NULL,'2026-10-09 21:07:05.136','2026-10-09 21:07:05.136'),('cmv1ghmpu0002um4sn5nf9tnj','COMP-05','Aplicar pr├ícticas de calidad','TECNICA',50,'ACTIVO',NULL,'2026-10-09 21:07:05.154','2026-10-09 21:07:05.154');
/*!40000 ALTER TABLE `competencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_sistema`
--

DROP TABLE IF EXISTS `configuracion_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_sistema` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'global',
  `anioLectivo` int NOT NULL DEFAULT '2026',
  `trimestre` int NOT NULL DEFAULT '3',
  `regional` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SENA Regional Magdalena',
  `ciudad` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Santa Marta',
  `faltasRiesgoAlto` int NOT NULL DEFAULT '3',
  `asistenciaMinima` int NOT NULL DEFAULT '75',
  `promedioMinimo` double NOT NULL DEFAULT '3',
  `diasEntrega` int NOT NULL DEFAULT '7',
  `duracionSesionHoras` int NOT NULL DEFAULT '8',
  `intentosLogin` int NOT NULL DEFAULT '5',
  `diasMaximoExcusa` int NOT NULL DEFAULT '3',
  `nombreInstitucion` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SENA',
  `nombreSoftware` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GSS - Media T├®cnica',
  `colorPrincipal` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#39A900',
  `colorSecundario` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#00304D',
  `logoUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT '/logo-sena.png',
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_sistema`
--

LOCK TABLES `configuracion_sistema` WRITE;
/*!40000 ALTER TABLE `configuracion_sistema` DISABLE KEYS */;
INSERT INTO `configuracion_sistema` VALUES ('global',2026,3,'SENA Regional Magdalena','Santa Marta',3,75,3,7,8,5,3,'SENA','GSS - Media T├®cnica','#39A900','#00304D','/logo-sena.png','2026-10-10 11:29:05.111');
/*!40000 ALTER TABLE `configuracion_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `criterios_evaluacion`
--

DROP TABLE IF EXISTS `criterios_evaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `criterios_evaluacion` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `resultadoAprendizajeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `criterios_evaluacion_resultadoAprendizajeId_fkey` (`resultadoAprendizajeId`),
  CONSTRAINT `criterios_evaluacion_resultadoAprendizajeId_fkey` FOREIGN KEY (`resultadoAprendizajeId`) REFERENCES `resultados_aprendizaje` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `criterios_evaluacion`
--

LOCK TABLES `criterios_evaluacion` WRITE;
/*!40000 ALTER TABLE `criterios_evaluacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `criterios_evaluacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `docentes`
--

DROP TABLE IF EXISTS `docentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `docentes` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipoDocumento` enum('CC','TI','CE','PP') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CC',
  `numeroDocumento` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombres` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profesion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `institucionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVO',
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `docentes_numeroDocumento_key` (`numeroDocumento`),
  UNIQUE KEY `docentes_email_key` (`email`),
  KEY `docentes_institucionId_fkey` (`institucionId`),
  CONSTRAINT `docentes_institucionId_fkey` FOREIGN KEY (`institucionId`) REFERENCES `instituciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `docentes`
--

LOCK TABLES `docentes` WRITE;
/*!40000 ALTER TABLE `docentes` DISABLE KEYS */;
/*!40000 ALTER TABLE `docentes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos`
--

DROP TABLE IF EXISTS `documentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OTRO',
  `institucionId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tamanoBytes` int DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `documentos_institucionId_fkey` (`institucionId`),
  CONSTRAINT `documentos_institucionId_fkey` FOREIGN KEY (`institucionId`) REFERENCES `instituciones` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos`
--

LOCK TABLES `documentos` WRITE;
/*!40000 ALTER TABLE `documentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos_empleados`
--

DROP TABLE IF EXISTS `documentos_empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos_empleados` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipoDocumento` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `urlArchivo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VIGENTE',
  `fechaVencimiento` datetime(3) DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `documentos_empleados_userId_fkey` (`userId`),
  CONSTRAINT `documentos_empleados_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos_empleados`
--

LOCK TABLES `documentos_empleados` WRITE;
/*!40000 ALTER TABLE `documentos_empleados` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos_empleados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entregas`
--

DROP TABLE IF EXISTS `entregas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entregas` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actividadId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aprendizId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fechaEntrega` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `urlArchivo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comentario` text COLLATE utf8mb4_unicode_ci,
  `estado` enum('PENDIENTE','CALIFICADA','TARDIA','APROBADA','NO_APROBADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `calificacion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `retroalimentacion` text COLLATE utf8mb4_unicode_ci,
  `instructorId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaEvaluacion` datetime(3) DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `entregas_actividadId_aprendizId_key` (`actividadId`,`aprendizId`),
  KEY `entregas_aprendizId_fkey` (`aprendizId`),
  KEY `entregas_instructorId_fkey` (`instructorId`),
  CONSTRAINT `entregas_actividadId_fkey` FOREIGN KEY (`actividadId`) REFERENCES `actividades` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `entregas_aprendizId_fkey` FOREIGN KEY (`aprendizId`) REFERENCES `aprendices` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `entregas_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregas`
--

LOCK TABLES `entregas` WRITE;
/*!40000 ALTER TABLE `entregas` DISABLE KEYS */;
INSERT INTO `entregas` VALUES ('cmv1g4mvu003hump4dtw7r5rn','cmv1g4mrm002dump4lv7pverj','cmv1fz6w0000fumwgvz3eefbb','2024-02-15 00:00:00.000',NULL,'Entrega realizada','CALIFICADA','Aprobado','Buen trabajo','cmv1fz6sy0009umwgapo491in','2024-02-20 00:00:00.000','2026-10-09 20:56:58.843','2026-10-09 20:56:58.843'),('cmv1g4mzj004nump4cldlou0q','cmv1g4mw2003jump4ewh5rzb0','cmv1fz6w0000fumwgvz3eefbb','2024-02-15 00:00:00.000',NULL,'Entrega realizada','CALIFICADA','Aprobado','Buen trabajo','cmv1fz6sy0009umwgapo491in','2024-02-20 00:00:00.000','2026-10-09 20:56:58.976','2026-10-09 20:56:58.976'),('cmv1g4n2u005tump4p17fzbzw','cmv1g4mzr004pump4y06m4ujk','cmv1fz6w0000fumwgvz3eefbb','2024-02-15 00:00:00.000',NULL,'Entrega realizada','NO_APROBADA','Deficiente','Falta profundizar','cmv1fz6sy0009umwgapo491in','2024-02-20 00:00:00.000','2026-10-09 20:56:59.094','2026-10-09 20:56:59.094');
/*!40000 ALTER TABLE `entregas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluaciones_aprendiz`
--

DROP TABLE IF EXISTS `evaluaciones_aprendiz`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluaciones_aprendiz` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aprendizId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resultadoAprendizajeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `juicio` enum('APROBADO','DEFICIENTE','PENDIENTE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `nota` double DEFAULT NULL,
  `fecha` datetime(3) DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `evaluaciones_aprendiz_aprendizId_resultadoAprendizajeId_key` (`aprendizId`,`resultadoAprendizajeId`),
  KEY `evaluaciones_aprendiz_resultadoAprendizajeId_fkey` (`resultadoAprendizajeId`),
  CONSTRAINT `evaluaciones_aprendiz_aprendizId_fkey` FOREIGN KEY (`aprendizId`) REFERENCES `aprendices` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `evaluaciones_aprendiz_resultadoAprendizajeId_fkey` FOREIGN KEY (`resultadoAprendizajeId`) REFERENCES `resultados_aprendizaje` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluaciones_aprendiz`
--

LOCK TABLES `evaluaciones_aprendiz` WRITE;
/*!40000 ALTER TABLE `evaluaciones_aprendiz` DISABLE KEYS */;
INSERT INTO `evaluaciones_aprendiz` VALUES ('cmv1g4n6g006xump4rz10w3o7','cmv1fz6w0000fumwgvz3eefbb','cmv1g4mqs0027ump4kc6r8ik8','APROBADO',4.43,'2026-10-09 20:56:59.223','Calificaci├│n de cierre de RA','2026-10-09 20:56:59.224','2026-10-09 20:56:59.224'),('cmv1g4nb90081ump4qfr3rs0s','cmv1fz6w0000fumwgvz3eefbb','cmv1g4mr60029ump4mobb6p39','APROBADO',3.8,'2026-10-09 20:56:59.396','Calificaci├│n de cierre de RA','2026-10-09 20:56:59.398','2026-10-09 20:56:59.398'),('cmv1g4nek0095ump42fjjoxls','cmv1fz6w0000fumwgvz3eefbb','cmv1g4mrd002bump4bwx81fg1','APROBADO',3.62,'2026-10-09 20:56:59.515','Calificaci├│n de cierre de RA','2026-10-09 20:56:59.516','2026-10-09 20:56:59.516'),('cmv1ghmrz000aum4syx5lduvs','cmv1fz6w0000fumwgvz3eefbb','cmv1ghmqa0004um4s74hpg0pw','APROBADO',3.06,'2026-10-09 21:07:05.223','Evaluaci├│n complementaria','2026-10-09 21:07:05.231','2026-10-09 21:07:05.231'),('cmv1ghmv5001eum4sokpsc07d','cmv1fz6w0000fumwgvz3eefbb','cmv1ghmqr0006um4s07z3iqqj','APROBADO',5,'2026-10-09 21:28:50.677','Evaluaci├│n complementaria','2026-10-09 21:07:05.346','2026-10-09 21:28:50.686'),('cmv1ghmyi002ium4sj4sg9itz','cmv1fz6w0000fumwgvz3eefbb','cmv1ghmqx0008um4stj5nr83i','APROBADO',4.07,'2026-10-09 21:07:05.461','Evaluaci├│n complementaria','2026-10-09 21:07:05.466','2026-10-09 21:07:05.466');
/*!40000 ALTER TABLE `evaluaciones_aprendiz` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `excusas`
--

DROP TABLE IF EXISTS `excusas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `excusas` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aprendizId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `archivoUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaInicio` datetime(3) DEFAULT NULL,
  `fechaFin` datetime(3) DEFAULT NULL,
  `estado` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `observacionInstructor` text COLLATE utf8mb4_unicode_ci,
  `apelacion` text COLLATE utf8mb4_unicode_ci,
  `apelacionRespuesta` text COLLATE utf8mb4_unicode_ci,
  `instructorRevisorId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `excusas_aprendizId_fkey` (`aprendizId`),
  KEY `excusas_instructorRevisorId_fkey` (`instructorRevisorId`),
  CONSTRAINT `excusas_aprendizId_fkey` FOREIGN KEY (`aprendizId`) REFERENCES `aprendices` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `excusas_instructorRevisorId_fkey` FOREIGN KEY (`instructorRevisorId`) REFERENCES `instructores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `excusas`
--

LOCK TABLES `excusas` WRITE;
/*!40000 ALTER TABLE `excusas` DISABLE KEYS */;
/*!40000 ALTER TABLE `excusas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fichas`
--

DROP TABLE IF EXISTS `fichas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fichas` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `programaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institucionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sedeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fechaInicio` datetime(3) NOT NULL,
  `fechaFin` datetime(3) NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVO',
  `jornada` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fichas_codigo_key` (`codigo`),
  KEY `fichas_programaId_fkey` (`programaId`),
  KEY `fichas_institucionId_fkey` (`institucionId`),
  KEY `fichas_sedeId_fkey` (`sedeId`),
  CONSTRAINT `fichas_institucionId_fkey` FOREIGN KEY (`institucionId`) REFERENCES `instituciones` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fichas_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `programas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fichas_sedeId_fkey` FOREIGN KEY (`sedeId`) REFERENCES `sedes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fichas`
--

LOCK TABLES `fichas` WRITE;
/*!40000 ALTER TABLE `fichas` DISABLE KEYS */;
INSERT INTO `fichas` VALUES ('cmv1fz68a0005umwg8k258ogc','2700123','cmv1fz66w0003umwgh9y1ujzj','cmv1fz62h0000umwgx1dd8y0v','cmv1fz6590002umwgnxa7atgp','2024-01-15 00:00:00.000','2026-01-15 00:00:00.000','ACTIVO',NULL,'2026-10-09 20:52:43.978','2026-10-09 20:52:43.978');
/*!40000 ALTER TABLE `fichas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instituciones`
--

DROP TABLE IF EXISTS `instituciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instituciones` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nit` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `municipio` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departamento` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Magdalena',
  `direccion` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rector` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVO',
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `instituciones_nit_key` (`nit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instituciones`
--

LOCK TABLES `instituciones` WRITE;
/*!40000 ALTER TABLE `instituciones` DISABLE KEYS */;
INSERT INTO `instituciones` VALUES ('cmv1fz62h0000umwgx1dd8y0v','899999239-1','SENA Regional Magdalena','Santa Marta','Magdalena','Avenida Ferrocarril #27-97',NULL,NULL,NULL,'ACTIVO','2026-10-09 20:52:43.768','2026-10-09 20:52:43.768');
/*!40000 ALTER TABLE `instituciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor_fichas`
--

DROP TABLE IF EXISTS `instructor_fichas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor_fichas` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instructorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fichaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rolFicha` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LIDER_TECNICO',
  `asignadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `instructor_fichas_instructorId_fichaId_key` (`instructorId`,`fichaId`),
  KEY `instructor_fichas_fichaId_fkey` (`fichaId`),
  CONSTRAINT `instructor_fichas_fichaId_fkey` FOREIGN KEY (`fichaId`) REFERENCES `fichas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `instructor_fichas_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructores` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_fichas`
--

LOCK TABLES `instructor_fichas` WRITE;
/*!40000 ALTER TABLE `instructor_fichas` DISABLE KEYS */;
INSERT INTO `instructor_fichas` VALUES ('cmv1fz6u4000bumwgzg1opzqe','cmv1fz6sy0009umwgapo491in','cmv1fz68a0005umwg8k258ogc','LIDER_TECNICO','2026-10-09 20:52:44.764');
/*!40000 ALTER TABLE `instructor_fichas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructores`
--

DROP TABLE IF EXISTS `instructores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructores` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipoDocumento` enum('CC','TI','CE','PP') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CC',
  `numeroDocumento` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombres` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profesion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVO',
  `direccionResidencia` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `municipioResidencia` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `eps` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fondoPension` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaNacimiento` datetime(3) DEFAULT NULL,
  `estadoCivil` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  `emailPersonal` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `instructores_numeroDocumento_key` (`numeroDocumento`),
  UNIQUE KEY `instructores_email_key` (`email`),
  UNIQUE KEY `instructores_userId_key` (`userId`),
  CONSTRAINT `instructores_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructores`
--

LOCK TABLES `instructores` WRITE;
/*!40000 ALTER TABLE `instructores` DISABLE KEYS */;
INSERT INTO `instructores` VALUES ('cmv1fz6sy0009umwgapo491in','CC','1000000001','Isa├¡as','Instructor','isaias@sena.edu.co',NULL,NULL,'cmv1fz6sa0007umwgbs2t6kiq','ACTIVO',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-09 20:52:44.722','2026-10-09 20:52:44.722',NULL);
/*!40000 ALTER TABLE `instructores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instrumentos_evaluacion`
--

DROP TABLE IF EXISTS `instrumentos_evaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instrumentos_evaluacion` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `criterioEvaluacionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `instrumentos_evaluacion_criterioEvaluacionId_fkey` (`criterioEvaluacionId`),
  CONSTRAINT `instrumentos_evaluacion_criterioEvaluacionId_fkey` FOREIGN KEY (`criterioEvaluacionId`) REFERENCES `criterios_evaluacion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instrumentos_evaluacion`
--

LOCK TABLES `instrumentos_evaluacion` WRITE;
/*!40000 ALTER TABLE `instrumentos_evaluacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `instrumentos_evaluacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes`
--

DROP TABLE IF EXISTS `mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `emisorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receptorId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `esGlobal` tinyint(1) NOT NULL DEFAULT '0',
  `contenido` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `adjuntoUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leido` tinyint(1) NOT NULL DEFAULT '0',
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `replyToId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mensajes_replyToId_fkey` (`replyToId`),
  KEY `mensajes_emisorId_fkey` (`emisorId`),
  KEY `mensajes_receptorId_fkey` (`receptorId`),
  CONSTRAINT `mensajes_emisorId_fkey` FOREIGN KEY (`emisorId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `mensajes_receptorId_fkey` FOREIGN KEY (`receptorId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `mensajes_replyToId_fkey` FOREIGN KEY (`replyToId`) REFERENCES `mensajes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes`
--

LOCK TABLES `mensajes` WRITE;
/*!40000 ALTER TABLE `mensajes` DISABLE KEYS */;
INSERT INTO `mensajes` VALUES ('cmv2b8igu0001umtgcobuf9qb','cmv1fz6wg000humwgqurflxsd',NULL,1,'sena ',NULL,0,'2026-10-10 11:27:47.837',NULL);
/*!40000 ALTER TABLE `mensajes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes_leidos`
--

DROP TABLE IF EXISTS `mensajes_leidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_leidos` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensajeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leidoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `mensajes_leidos_mensajeId_userId_key` (`mensajeId`,`userId`),
  KEY `mensajes_leidos_userId_fkey` (`userId`),
  CONSTRAINT `mensajes_leidos_mensajeId_fkey` FOREIGN KEY (`mensajeId`) REFERENCES `mensajes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `mensajes_leidos_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes_leidos`
--

LOCK TABLES `mensajes_leidos` WRITE;
/*!40000 ALTER TABLE `mensajes_leidos` DISABLE KEYS */;
INSERT INTO `mensajes_leidos` VALUES ('cmv2b8ili0007umtglkxjt5no','cmv2b8igu0001umtgcobuf9qb','cmv1fz6wg000humwgqurflxsd','2026-10-10 11:27:48.005'),('cmv2bzvju0005umukm0pq31pt','cmv2b8igu0001umtgcobuf9qb','cmv1fz6uv000dumwgmr6036qk','2026-10-10 11:49:04.505'),('cmv2c3e4k000iumuk940g3ma1','cmv2b8igu0001umtgcobuf9qb','cmv1fz6sa0007umwgbs2t6kiq','2026-10-10 11:51:48.548');
/*!40000 ALTER TABLE `mensajes_leidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT '0',
  `tipo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INFO',
  `enlace` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `notificaciones_userId_fkey` (`userId`),
  CONSTRAINT `notificaciones_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES ('cmv1gb9bd0004umskmpen1ys7','cmv1fz6uv000dumwgmr6036qk','Nueva Clase Virtual Programada','Se ha programado una clase virtual de Zoom: \"Programaci├│n 1\" para el 13/10/2026, 8:00:00 a. m.',1,'INFO','/clases-virtuales','2026-10-09 21:02:07.849'),('cmv1ham5s001gumns99l4kj0w','cmv1fz6uv000dumwgmr6036qk','Nueva Clase Virtual Programada','Se ha programado una clase virtual de Zoom: \"Programaci├│n 1\" para el 14/10/2026, 2:00:00 p. m.',1,'INFO','/clases-virtuales','2026-10-09 21:29:37.456'),('cmv1hntvd0002umdgg4kr9hqm','cmv1fz6uv000dumwgmr6036qk','Nueva Clase Virtual Programada','Se ha programado una clase virtual de Zoom: \"Programaci├│n 1\" para el 15/10/2026, 8:00:00 a. m.',1,'INFO','/clases-virtuales','2026-10-09 21:39:53.976'),('cmv2b8ihd0003umtg4zikxmme','cmv1fz6sa0007umwgbs2t6kiq','­ƒôó Comunicado de Admin Global','sena ',1,'INFO','/mensajes','2026-10-10 11:27:47.857'),('cmv2b8ihi0005umtguxq9embd','cmv1fz6uv000dumwgmr6036qk','­ƒôó Comunicado de Admin Global','sena ',1,'INFO','/mensajes','2026-10-10 11:27:47.857'),('cmv2c37pq000gumukgzv5qxgp','cmv1fz6uv000dumwgmr6036qk','Nueva Clase Virtual Programada','Se ha programado una clase virtual de Zoom: \"Programaci├│n 1\" para el 13/10/2026, 8:00:00 a. m.',1,'INFO','/clases-virtuales','2026-10-10 11:51:40.238');
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires` datetime(3) NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `password_reset_tokens_token_key` (`token`),
  KEY `password_reset_tokens_email_fkey` (`email`),
  CONSTRAINT `password_reset_tokens_email_fkey` FOREIGN KEY (`email`) REFERENCES `users` (`email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programas`
--

DROP TABLE IF EXISTS `programas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programas` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nivelFormacion` enum('TECNICO','TECNOLOGO','OPERARIO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TECNICO',
  `estado` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVO',
  `version` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duracion` int DEFAULT NULL,
  `modalidad` enum('PRESENCIAL','VIRTUAL','DISTANCIA','COMBINADO') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `area` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `areaDesempeno` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `titulacion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `perfilIngreso` text COLLATE utf8mb4_unicode_ci,
  `perfilEgresado` text COLLATE utf8mb4_unicode_ci,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `programas_codigo_key` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programas`
--

LOCK TABLES `programas` WRITE;
/*!40000 ALTER TABLE `programas` DISABLE KEYS */;
INSERT INTO `programas` VALUES ('cmv1fz66w0003umwgh9y1ujzj','228118','An├ílisis y Desarrollo de Software','TECNOLOGO','ACTIVO',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-09 20:52:43.928','2026-10-09 20:52:43.928');
/*!40000 ALTER TABLE `programas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registros_asistencia`
--

DROP TABLE IF EXISTS `registros_asistencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registros_asistencia` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asistenciaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aprendizId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('PRESENTE','FALLA','EXCUSA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRESENTE',
  `observaciones` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `registros_asistencia_asistenciaId_aprendizId_key` (`asistenciaId`,`aprendizId`),
  KEY `registros_asistencia_aprendizId_fkey` (`aprendizId`),
  CONSTRAINT `registros_asistencia_aprendizId_fkey` FOREIGN KEY (`aprendizId`) REFERENCES `aprendices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `registros_asistencia_asistenciaId_fkey` FOREIGN KEY (`asistenciaId`) REFERENCES `asistencias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registros_asistencia`
--

LOCK TABLES `registros_asistencia` WRITE;
/*!40000 ALTER TABLE `registros_asistencia` DISABLE KEYS */;
/*!40000 ALTER TABLE `registros_asistencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resultados_aprendizaje`
--

DROP TABLE IF EXISTS `resultados_aprendizaje`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resultados_aprendizaje` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `competenciaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fase` enum('ANALISIS','PLANEACION','EJECUCION','EVALUACION') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ANALISIS',
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `resultados_aprendizaje_competenciaId_fkey` (`competenciaId`),
  CONSTRAINT `resultados_aprendizaje_competenciaId_fkey` FOREIGN KEY (`competenciaId`) REFERENCES `competencias` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resultados_aprendizaje`
--

LOCK TABLES `resultados_aprendizaje` WRITE;
/*!40000 ALTER TABLE `resultados_aprendizaje` DISABLE KEYS */;
INSERT INTO `resultados_aprendizaje` VALUES ('cmuzwyn5v0006umc01zl8j2yt','RAP-1','Comprender conceptos b├ísicos','cmuzwyn560004umc0noan5dji','ANALISIS','2026-10-08 19:12:40.387','2026-10-08 19:12:40.387'),('cmuzwyn5v0007umc02c35ihc1','RAP-2','Aplicar conocimientos t├®cnicos','cmuzwyn560004umc0noan5dji','EJECUCION','2026-10-08 19:12:40.387','2026-10-08 19:12:40.387'),('cmuzwyn5v0008umc0lemuoj9c','RAP-1','Comunicarse en ingl├®s','cmuzwyn5l0005umc0f7pvpsyw','EJECUCION','2026-10-08 19:12:40.387','2026-10-08 19:12:40.387'),('cmuzwyn6o000cumc0r85nmkp6','RAP-1','Comprender conceptos b├ísicos','cmuzwyn69000aumc02g9zem6h','ANALISIS','2026-10-08 19:12:40.416','2026-10-08 19:12:40.416'),('cmuzwyn6o000dumc0ntnitum7','RAP-2','Aplicar conocimientos t├®cnicos','cmuzwyn69000aumc02g9zem6h','EJECUCION','2026-10-08 19:12:40.416','2026-10-08 19:12:40.416'),('cmuzwyn6o000eumc0zhvpfnsl','RAP-1','Comunicarse en ingl├®s','cmuzwyn6h000bumc0xvgumwlz','EJECUCION','2026-10-08 19:12:40.416','2026-10-08 19:12:40.416'),('cmuzwyn7a000iumc0lcp7xkoj','RAP-1','Comprender conceptos b├ísicos','cmuzwyn6x000gumc0tkntx80t','ANALISIS','2026-10-08 19:12:40.439','2026-10-08 19:12:40.439'),('cmuzwyn7a000jumc0dyfj64wa','RAP-2','Aplicar conocimientos t├®cnicos','cmuzwyn6x000gumc0tkntx80t','EJECUCION','2026-10-08 19:12:40.439','2026-10-08 19:12:40.439'),('cmuzwyn7a000kumc0x8iv2g5k','RAP-1','Comunicarse en ingl├®s','cmuzwyn73000humc08u1rccud','EJECUCION','2026-10-08 19:12:40.439','2026-10-08 19:12:40.439'),('cmuzwyn7x000oumc0n0ew57xx','RAP-1','Comprender conceptos b├ísicos','cmuzwyn7j000mumc0opz5ty0r','ANALISIS','2026-10-08 19:12:40.461','2026-10-08 19:12:40.461'),('cmuzwyn7x000pumc0afgw16e1','RAP-2','Aplicar conocimientos t├®cnicos','cmuzwyn7j000mumc0opz5ty0r','EJECUCION','2026-10-08 19:12:40.461','2026-10-08 19:12:40.461'),('cmuzwyn7x000qumc018yn2gwa','RAP-1','Comunicarse en ingl├®s','cmuzwyn7o000numc0s4rubqmq','EJECUCION','2026-10-08 19:12:40.461','2026-10-08 19:12:40.461'),('cmv1g4mqs0027ump4kc6r8ik8','RA-01-1','Escribir c├│digo orientado a objetos','cmv1g4mps0024ump4skwmr5hy','ANALISIS','2026-10-09 20:56:58.661','2026-10-09 20:56:58.661'),('cmv1g4mr60029ump4mobb6p39','RA-01-2','Aplicar patrones de dise├▒o','cmv1g4mps0024ump4skwmr5hy','ANALISIS','2026-10-09 20:56:58.674','2026-10-09 20:56:58.674'),('cmv1g4mrd002bump4bwx81fg1','RA-02-1','Dise├▒ar diagramas UML','cmv1g4mql0025ump4ochr5590','ANALISIS','2026-10-09 20:56:58.681','2026-10-09 20:56:58.681'),('cmv1ghmqa0004um4s74hpg0pw','RA-03-1','Desplegar aplicaci├│n en producci├│n','cmv1ghmns0000um4sdhhzrzxp','ANALISIS','2026-10-09 21:07:05.169','2026-10-09 21:07:05.169'),('cmv1ghmqr0006um4s07z3iqqj','RA-04-1','Crear consultas SQL complejas','cmv1ghmpd0001um4soqhzhqny','ANALISIS','2026-10-09 21:07:05.187','2026-10-09 21:07:05.187'),('cmv1ghmqx0008um4stj5nr83i','RA-05-1','Realizar pruebas unitarias','cmv1ghmpu0002um4sn5nf9tnj','ANALISIS','2026-10-09 21:07:05.193','2026-10-09 21:07:05.193');
/*!40000 ALTER TABLE `resultados_aprendizaje` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `permisos` json DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_nombre_key` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('ADMINISTRADOR','Administrador','Acceso total al sistema','[]','2026-10-09 20:41:41.927','2026-10-09 20:41:41.927'),('APRENDIZ','Aprendiz','Estudiante de la media t├®cnica','[]','2026-10-09 20:41:41.927','2026-10-09 20:41:41.927'),('COORDINADOR_REGIONAL','Coordinador Regional','Gesti├│n a nivel regional','[]','2026-10-09 20:41:41.927','2026-10-09 20:41:41.927'),('COORDINADOR_SEDE','Coordinador de Sede','Gesti├│n de la sede','[]','2026-10-09 20:41:41.927','2026-10-09 20:41:41.927'),('INSTRUCTOR','Instructor','Gesti├│n de aprendices y calificaciones','[]','2026-10-09 20:41:41.927','2026-10-09 20:41:41.927'),('SECRETARIO','Secretario','Gesti├│n administrativa','[]','2026-10-09 20:41:41.927','2026-10-09 20:41:41.927'),('SUBDIRECTOR_REGIONAL','Subdirector Regional','Subdirecci├│n a nivel regional','[]','2026-10-09 20:41:41.927','2026-10-09 20:41:41.927');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sedes`
--

DROP TABLE IF EXISTS `sedes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sedes` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institucionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barrio` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `municipio` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `esPrincipal` tinyint(1) NOT NULL DEFAULT '0',
  `coordinador` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVO',
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sedes_institucionId_fkey` (`institucionId`),
  CONSTRAINT `sedes_institucionId_fkey` FOREIGN KEY (`institucionId`) REFERENCES `instituciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sedes`
--

LOCK TABLES `sedes` WRITE;
/*!40000 ALTER TABLE `sedes` DISABLE KEYS */;
INSERT INTO `sedes` VALUES ('cmv1fz6590002umwgnxa7atgp','Sede Principal','cmv1fz62h0000umwgx1dd8y0v','Avenida Ferrocarril #27-97',NULL,NULL,1,NULL,NULL,'ACTIVO','2026-10-09 20:52:43.866','2026-10-09 20:52:43.866');
/*!40000 ALTER TABLE `sedes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session_logs`
--

DROP TABLE IF EXISTS `session_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deviceId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `trustedUntil` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `lastActiveAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `session_logs_userId_fkey` (`userId`),
  CONSTRAINT `session_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_logs`
--

LOCK TABLES `session_logs` WRITE;
/*!40000 ALTER TABLE `session_logs` DISABLE KEYS */;
INSERT INTO `session_logs` VALUES ('cmv1h6dvs0001umns9i2ep8k1','cmv1fz6uv000dumwgmr6036qk','17181041-24c9-428b-a40c-5987396dfd1c',NULL,NULL,0,'2026-11-08 21:26:19.943','2026-10-09 21:26:20.100','2026-10-09 21:41:23.308'),('cmv1h8vmv0005umnstog6g2kr','cmv1fz6sa0007umwgbs2t6kiq','17181041-24c9-428b-a40c-5987396dfd1c',NULL,NULL,0,'2026-11-08 21:28:16.372','2026-10-09 21:28:16.423','2026-10-09 21:28:16.423'),('cmv2bzltx0001umuk1dfwxpmu','cmv1fz6uv000dumwgmr6036qk','2ae1ee55-49cc-4e3f-a94a-f4c2f2e7361d',NULL,NULL,0,'2026-11-09 11:48:51.826','2026-10-10 11:48:51.906','2026-10-10 11:48:51.906'),('cmv2c0oon0007umukogupyyco','cmv1fz6sa0007umwgbs2t6kiq','2ae1ee55-49cc-4e3f-a94a-f4c2f2e7361d',NULL,NULL,1,'2026-11-09 11:49:42.211','2026-10-10 11:49:42.263','2026-10-10 11:49:42.263'),('cmv2c245e000bumuk13zr507f','cmv1fz6uv000dumwgmr6036qk','9796e4d8-a869-41f7-9b9f-f601ece3ac47',NULL,NULL,1,'2026-11-09 11:50:48.901','2026-10-10 11:50:48.963','2026-10-10 11:50:48.963');
/*!40000 ALTER TABLE `session_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudes_cartas`
--

DROP TABLE IF EXISTS `solicitudes_cartas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_cartas` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipoCarta` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo` text COLLATE utf8mb4_unicode_ci,
  `dirigidoA` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `urlCarta` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `solicitudes_cartas_userId_fkey` (`userId`),
  CONSTRAINT `solicitudes_cartas_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes_cartas`
--

LOCK TABLES `solicitudes_cartas` WRITE;
/*!40000 ALTER TABLE `solicitudes_cartas` DISABLE KEYS */;
/*!40000 ALTER TABLE `solicitudes_cartas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'APRENDIZ',
  `institucionId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sedeId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVO',
  `ultimoAcceso` datetime(3) DEFAULT NULL,
  `twoFactorSecret` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twoFactorEnabled` tinyint(1) NOT NULL DEFAULT '0',
  `last2FADate` datetime(3) DEFAULT NULL,
  `fotoPerfil` text COLLATE utf8mb4_unicode_ci,
  `googleDriveLinked` tinyint(1) NOT NULL DEFAULT '0',
  `googleDriveFolderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `googleRefreshToken` text COLLATE utf8mb4_unicode_ci,
  `firmaDigitalUrl` text COLLATE utf8mb4_unicode_ci,
  `zoomAccessToken` text COLLATE utf8mb4_unicode_ci,
  `zoomRefreshToken` text COLLATE utf8mb4_unicode_ci,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  KEY `users_institucionId_fkey` (`institucionId`),
  KEY `users_sedeId_fkey` (`sedeId`),
  CONSTRAINT `users_institucionId_fkey` FOREIGN KEY (`institucionId`) REFERENCES `instituciones` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `users_sedeId_fkey` FOREIGN KEY (`sedeId`) REFERENCES `sedes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('cmv1fz6sa0007umwgbs2t6kiq','Isa├¡as Instructor','isaias@sena.edu.co','$2b$10$TlgIsP6dBi2kaIreFVBIT.7A0UXrm7uqxt3M2VJgGEqNcjFBgmSdC','INSTRUCTOR','cmv1fz62h0000umwgx1dd8y0v',NULL,'ACTIVO','2026-10-10 11:49:42.261','BAWSK72ACM4FUL3J',1,'2026-10-10 11:49:42.211','­ƒÉ▒',0,NULL,NULL,NULL,NULL,NULL,'2026-10-09 20:52:44.698','2026-10-10 11:49:42.275'),('cmv1fz6uv000dumwgmr6036qk','Iv├ín Aprendiz','ivan@sena.edu.co','$2b$10$TlgIsP6dBi2kaIreFVBIT.7A0UXrm7uqxt3M2VJgGEqNcjFBgmSdC','APRENDIZ','cmv1fz62h0000umwgx1dd8y0v',NULL,'ACTIVO','2026-10-10 11:50:48.973','CAZUGORILVEX4NRB',1,'2026-10-10 11:50:48.901','',0,NULL,NULL,NULL,NULL,NULL,'2026-10-09 20:52:44.791','2026-10-10 11:50:48.979'),('cmv1fz6wg000humwgqurflxsd','Admin Global','admin@sena.edu.co','$2b$10$TlgIsP6dBi2kaIreFVBIT.7A0UXrm7uqxt3M2VJgGEqNcjFBgmSdC','ADMINISTRADOR','cmv1fz62h0000umwgx1dd8y0v',NULL,'ACTIVO','2026-10-10 11:01:34.369','F5OTGNJYFZCFQIDS',1,'2026-10-10 11:02:46.601','­ƒÿÄ',0,NULL,NULL,NULL,NULL,NULL,'2026-10-09 20:52:44.848','2026-10-10 11:03:39.019');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visitas_seguimiento`
--

DROP TABLE IF EXISTS `visitas_seguimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitas_seguimiento` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aprendizId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fichaId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `institucionNombre` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha` datetime(3) NOT NULL,
  `responsable` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `novedades` int NOT NULL DEFAULT '0',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `estado` enum('PROGRAMADA','REALIZADA','APLAZADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PROGRAMADA',
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `visitas_seguimiento_aprendizId_fkey` (`aprendizId`),
  KEY `visitas_seguimiento_fichaId_fkey` (`fichaId`),
  CONSTRAINT `visitas_seguimiento_aprendizId_fkey` FOREIGN KEY (`aprendizId`) REFERENCES `aprendices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `visitas_seguimiento_fichaId_fkey` FOREIGN KEY (`fichaId`) REFERENCES `fichas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitas_seguimiento`
--

LOCK TABLES `visitas_seguimiento` WRITE;
/*!40000 ALTER TABLE `visitas_seguimiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `visitas_seguimiento` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-10  9:42:10
