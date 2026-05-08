-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: parking
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

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
-- Table structure for table `cajones`
--

DROP TABLE IF EXISTS `cajones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cajones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `zona` varchar(20) DEFAULT NULL,
  `numero` int DEFAULT NULL,
  `ocupado` tinyint(1) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=253 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cajones`
--

LOCK TABLES `cajones` WRITE;
/*!40000 ALTER TABLE `cajones` DISABLE KEYS */;
INSERT INTO `cajones` VALUES (1,'puerta1',1,1,NULL),(2,'puerta1',2,1,NULL),(3,'puerta1',3,1,NULL),(4,'puerta1',4,1,NULL),(5,'puerta1',5,1,NULL),(6,'puerta1',6,1,NULL),(7,'puerta1',7,1,NULL),(8,'puerta1',8,1,NULL),(9,'puerta1',9,1,NULL),(10,'puerta1',10,1,NULL),(11,'puerta1',11,1,NULL),(12,'puerta1',12,1,NULL),(13,'puerta1',13,1,NULL),(14,'puerta1',14,1,NULL),(15,'puerta1',15,1,NULL),(16,'puerta1',16,1,NULL),(17,'puerta1',17,1,NULL),(18,'puerta1',18,1,NULL),(19,'puerta1',19,1,NULL),(20,'puerta1',20,1,NULL),(21,'puerta1',21,1,NULL),(22,'puerta1',22,1,NULL),(23,'puerta1',23,1,NULL),(24,'puerta1',24,1,NULL),(25,'puerta1',25,1,NULL),(26,'puerta1',26,1,NULL),(27,'puerta1',27,1,NULL),(28,'puerta1',28,1,NULL),(29,'puerta1',29,1,NULL),(30,'puerta1',30,1,NULL),(31,'puerta1',31,1,NULL),(32,'puerta1',32,1,NULL),(33,'puerta1',33,1,NULL),(34,'puerta1',34,1,NULL),(35,'puerta1',35,1,NULL),(36,'puerta1',36,1,NULL),(37,'puerta1',37,1,NULL),(38,'puerta1',38,1,NULL),(39,'puerta1',39,1,NULL),(40,'puerta1',40,1,NULL),(64,'puerta2',1,0,NULL),(65,'puerta2',2,0,NULL),(66,'puerta2',3,0,NULL),(67,'puerta2',4,0,NULL),(68,'puerta2',5,0,NULL),(69,'puerta2',6,0,NULL),(70,'puerta2',7,0,NULL),(71,'puerta2',8,0,NULL),(72,'puerta2',9,0,NULL),(73,'puerta2',10,0,NULL),(74,'puerta2',11,0,NULL),(75,'puerta2',12,0,NULL),(76,'puerta2',13,0,NULL),(77,'puerta2',14,0,NULL),(78,'puerta2',15,0,NULL),(79,'puerta2',16,0,NULL),(80,'puerta2',17,0,NULL),(81,'puerta2',18,0,NULL),(82,'puerta2',19,0,NULL),(83,'puerta2',20,0,NULL),(84,'puerta2',21,1,'INV-1778278495112'),(85,'puerta2',22,0,NULL),(86,'puerta2',23,0,NULL),(87,'puerta2',24,0,NULL),(88,'puerta2',25,0,NULL),(89,'puerta2',26,0,NULL),(90,'puerta2',27,0,NULL),(91,'puerta2',28,0,NULL),(92,'puerta2',29,0,NULL),(93,'puerta2',30,0,NULL),(94,'puerta2',31,0,NULL),(95,'puerta2',32,0,NULL),(96,'puerta2',33,0,NULL),(97,'puerta2',34,0,NULL),(98,'puerta2',35,0,NULL),(99,'puerta2',36,0,NULL),(100,'puerta2',37,0,NULL),(101,'puerta2',38,0,NULL),(102,'puerta2',39,0,NULL),(103,'puerta2',40,0,NULL),(127,'puerta3',1,1,NULL),(128,'puerta3',2,1,NULL),(129,'puerta3',3,1,NULL),(130,'puerta3',4,1,NULL),(131,'puerta3',5,1,NULL),(132,'puerta3',6,1,NULL),(133,'puerta3',7,1,NULL),(134,'puerta3',8,1,NULL),(135,'puerta3',9,1,NULL),(136,'puerta3',10,1,NULL),(137,'puerta3',11,1,NULL),(138,'puerta3',12,1,NULL),(139,'puerta3',13,1,NULL),(140,'puerta3',14,1,NULL),(141,'puerta3',15,1,NULL),(142,'puerta3',16,1,NULL),(143,'puerta3',17,1,NULL),(144,'puerta3',18,1,NULL),(145,'puerta3',19,1,NULL),(146,'puerta3',20,1,NULL),(147,'puerta3',21,1,NULL),(148,'puerta3',22,1,NULL),(149,'puerta3',23,1,NULL),(150,'puerta3',24,1,NULL),(151,'puerta3',25,1,NULL),(152,'puerta3',26,1,NULL),(153,'puerta3',27,1,NULL),(154,'puerta3',28,1,NULL),(155,'puerta3',29,1,NULL),(156,'puerta3',30,1,NULL),(157,'puerta3',31,1,NULL),(158,'puerta3',32,1,NULL),(159,'puerta3',33,1,NULL),(160,'puerta3',34,1,NULL),(161,'puerta3',35,1,NULL),(162,'puerta3',36,1,NULL),(163,'puerta3',37,1,NULL),(164,'puerta3',38,1,NULL),(165,'puerta3',39,1,NULL),(166,'puerta3',40,1,NULL),(190,'puerta4',1,0,NULL),(191,'puerta4',2,0,NULL),(192,'puerta4',3,0,NULL),(193,'puerta4',4,0,NULL),(194,'puerta4',5,1,'INV-1778280301936'),(195,'puerta4',6,0,NULL),(196,'puerta4',7,0,NULL),(197,'puerta4',8,0,NULL),(198,'puerta4',9,0,NULL),(199,'puerta4',10,0,NULL),(200,'puerta4',11,0,NULL),(201,'puerta4',12,0,NULL),(202,'puerta4',13,0,NULL),(203,'puerta4',14,0,NULL),(204,'puerta4',15,0,NULL),(205,'puerta4',16,0,NULL),(206,'puerta4',17,0,NULL),(207,'puerta4',18,0,NULL),(208,'puerta4',19,0,NULL),(209,'puerta4',20,0,NULL),(210,'puerta4',21,0,NULL),(211,'puerta4',22,0,NULL),(212,'puerta4',23,0,NULL),(213,'puerta4',24,0,NULL),(214,'puerta4',25,0,NULL),(215,'puerta4',26,0,NULL),(216,'puerta4',27,1,'INV-1778280351815'),(217,'puerta4',28,0,NULL),(218,'puerta4',29,0,NULL),(219,'puerta4',30,0,NULL),(220,'puerta4',31,0,NULL),(221,'puerta4',32,0,NULL),(222,'puerta4',33,0,NULL),(223,'puerta4',34,0,NULL),(224,'puerta4',35,0,NULL),(225,'puerta4',36,0,NULL),(226,'puerta4',37,0,NULL),(227,'puerta4',38,0,NULL),(228,'puerta4',39,0,NULL),(229,'puerta4',40,0,NULL);
/*!40000 ALTER TABLE `cajones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entradas_del_dia`
--

DROP TABLE IF EXISTS `entradas_del_dia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entradas_del_dia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(30) DEFAULT NULL,
  `clave` varchar(30) DEFAULT NULL,
  `puerta` varchar(20) DEFAULT NULL,
  `proposito` varchar(150) DEFAULT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `entra_vehiculo` tinyint(1) DEFAULT NULL,
  `placas` varchar(20) DEFAULT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `fecha_hora` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entradas_del_dia`
--

LOCK TABLES `entradas_del_dia` WRITE;
/*!40000 ALTER TABLE `entradas_del_dia` DISABLE KEYS */;
INSERT INTO `entradas_del_dia` VALUES (1,'invitado','INV-1778278067575','puerta4','q','q','q',0,NULL,NULL,NULL,'2026-05-08 22:07:47'),(2,'invitado','INV-1778278094576','puerta4','Visita','Gimel','Gimel',0,NULL,NULL,NULL,'2026-05-08 22:08:14'),(3,'invitado','INV-1778278495112','puerta2','Visita ','Jorge','Hdz',1,'Djgdjgdjgdjg','Audi','Blanco','2026-05-08 22:15:01'),(4,'invitado','INV-1778280154613','puerta1','Informes','Alicia','Gomez',0,NULL,NULL,NULL,'2026-05-08 22:42:35'),(5,'invitado','INV-1778280301936','puerta4','Q','Q','Q',1,'Q','Q','Q','2026-05-08 22:45:10'),(6,'invitado','INV-1778280351815','puerta4','Q','Q','Q',1,'Q','Q','Q','2026-05-08 22:46:03');
/*!40000 ALTER TABLE `entradas_del_dia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estudiantes`
--

DROP TABLE IF EXISTS `estudiantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudiantes` (
  `numero_control` varchar(20) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `apellido_paterno` varchar(50) DEFAULT NULL,
  `apellido_materno` varchar(50) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  `marca_auto` varchar(50) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `placas` varchar(20) DEFAULT NULL,
  `carrera` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`numero_control`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes`
--

LOCK TABLES `estudiantes` WRITE;
/*!40000 ALTER TABLE `estudiantes` DISABLE KEYS */;
/*!40000 ALTER TABLE `estudiantes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-08 23:06:41
