-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: algaida_volei_club
-- ------------------------------------------------------
-- Server version	8.4.4

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
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_age` int DEFAULT NULL,
  `max_age` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Alevín',NULL,NULL),(2,'Infantil',NULL,NULL),(3,'Cadete',NULL,NULL),(4,'Juvenil',NULL,NULL),(5,'Sénior',NULL,NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `debt_history`
--

DROP TABLE IF EXISTS `debt_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `debt_history` (
  `debt_id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `season_id` int NOT NULL,
  `total_due` decimal(10,2) NOT NULL,
  `total_paid` decimal(10,2) DEFAULT '0.00',
  `status` enum('pending','partially_paid','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`debt_id`),
  KEY `player_id` (`player_id`),
  KEY `season_id` (`season_id`),
  CONSTRAINT `debt_history_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`),
  CONSTRAINT `debt_history_ibfk_2` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `debt_history`
--

LOCK TABLES `debt_history` WRITE;
/*!40000 ALTER TABLE `debt_history` DISABLE KEYS */;
INSERT INTO `debt_history` VALUES (1,6,1,400.00,0.00,'pending','2025-05-07 20:52:27','2025-05-07 20:52:27'),(2,7,1,400.00,0.00,'pending','2025-05-07 20:52:27','2025-05-07 20:52:27'),(4,10,3,400.00,400.00,'completed','2023-06-29 22:00:00','2023-06-29 22:00:00'),(5,11,3,400.00,400.00,'completed','2023-06-29 22:00:00','2025-05-11 23:08:54'),(6,12,4,380.00,380.00,'completed','2024-06-29 22:00:00','2024-06-29 22:00:00');
/*!40000 ALTER TABLE `debt_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `season_id` int NOT NULL,
  `doc_type` enum('lopd','usoimagenes','dni','otros') COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` text COLLATE utf8mb4_unicode_ci,
  `uploaded_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `player_id` (`player_id`),
  KEY `season_id` (`season_id`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`),
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (1,1,2,'lopd','https://example.com/docs/lopd1.pdf','2025-05-03 23:35:04'),(2,1,2,'usoimagenes','https://example.com/docs/uso1.pdf','2025-05-03 23:35:04'),(3,3,2,'dni','https://example.com/docs/dni3.pdf','2025-05-03 23:35:04'),(67,23,2,'lopd','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/lopd%2F1746464039545-consentimiento_lopd_41520395J.pdf?alt=media&token=a0b469d5-8493-4e7e-9274-7fc42d152fef','2025-05-05 18:54:00'),(68,23,2,'usoimagenes','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/images%2F1746464039546-consentimiento_uso_imagenes_41520395J.pdf?alt=media&token=6f8cd93e-db7e-4b4b-a805-4aab02d30fe0','2025-05-05 18:54:00'),(69,23,2,'dni','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/dni%2F1746464039546-Spanish_ID_card_(front_side).webp.png?alt=media&token=7347249a-bd09-4092-b34c-60875b1b8b10','2025-05-05 18:54:00'),(73,25,2,'lopd','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/lopd%2F1746527795885-consentimiento_lopd_41520395X.pdf?alt=media&token=e6315574-99a1-41bd-8293-23d1ff819928','2025-05-06 12:36:37'),(74,25,2,'usoimagenes','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/images%2F1746527795887-consentimiento_uso_imagenes_41520395X.pdf?alt=media&token=2e61a223-c504-494e-ad5b-f0d2356840e0','2025-05-06 12:36:37'),(75,25,2,'dni','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/dni%2F1746527795887-Spanish_ID_card_(front_side).webp.png?alt=media&token=95bf5e7c-ec16-4395-8596-3cba979ffc54','2025-05-06 12:36:37'),(76,26,2,'lopd','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/lopd%2F1746552410162-consentimiento_lopd_41520395Y.pdf?alt=media&token=7ea23e02-1990-40c5-ade0-19d8ff0daca7','2025-05-06 19:26:51'),(77,26,2,'usoimagenes','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/images%2F1746552410166-consentimiento_uso_imagenes_41520395Y.pdf?alt=media&token=7e496e91-a847-4276-8063-108fa4ada747','2025-05-06 19:26:51'),(78,26,2,'dni','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/dni%2F1746552410166-Spanish_ID_card_(front_side).webp.png?alt=media&token=56024717-361a-436d-913e-0fb088104376','2025-05-06 19:26:51'),(79,27,2,'lopd','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/lopd%2F1746648532254-consentimiento_lopd_67890123V.pdf?alt=media&token=57070ab8-a75e-4054-8f51-efacdaa9678f','2025-05-07 22:08:54'),(80,27,2,'usoimagenes','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/images%2F1746648532255-consentimiento_uso_imagenes_67890123V.pdf?alt=media&token=481dd257-8748-4eb3-a2a7-4c80e87a48fd','2025-05-07 22:08:54'),(81,27,2,'dni','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/dni%2F1746648532255-Spanish_ID_card_(front_side).webp.png?alt=media&token=3307f529-74e3-4eb4-828b-4fa5f42b4153','2025-05-07 22:08:54'),(82,28,2,'lopd','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/lopd%2F1746811704573-consentimiento_lopd_9999999R.pdf?alt=media&token=d7250a2d-bec1-49a3-900e-c01040b2d113','2025-05-09 19:28:26'),(83,28,2,'usoimagenes','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/images%2F1746811704575-consentimiento_uso_imagenes_9999999R.pdf?alt=media&token=ee158a27-c87b-4a91-b158-e57e79230db3','2025-05-09 19:28:26'),(84,28,2,'dni','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/dni%2F1746811704575-dni1.jpg?alt=media&token=92f4c6a0-2c1b-41d6-9d34-8916c29e7132','2025-05-09 19:28:26'),(85,28,2,'lopd','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/lopd%2F1746916851361-consentimiento_lopd_9999999R.pdf?alt=media&token=471338d6-5e3e-4285-848a-8329eb580568','2025-05-11 00:40:53'),(86,28,2,'usoimagenes','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/images%2F1746916851362-consentimiento_uso_imagenes_9999999R.pdf?alt=media&token=b57a2d90-08d6-47ab-9a22-74c2ad790fc6','2025-05-11 00:40:53'),(87,28,2,'dni','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/dni%2F1746916851362-dni1.jpg?alt=media&token=513136b7-085e-4f31-a31d-227d39397b56','2025-05-11 00:40:53');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `form_status`
--

DROP TABLE IF EXISTS `form_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `form_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `season_id` int NOT NULL,
  `opens_at` date NOT NULL,
  `closes_at` date NOT NULL,
  `enabled` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `season_id` (`season_id`),
  CONSTRAINT `form_status_ibfk_1` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `form_status`
--

LOCK TABLES `form_status` WRITE;
/*!40000 ALTER TABLE `form_status` DISABLE KEYS */;
INSERT INTO `form_status` VALUES (1,2,'2024-09-01','2024-12-01',1);
/*!40000 ALTER TABLE `form_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `legal_guardians`
--

DROP TABLE IF EXISTS `legal_guardians`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `legal_guardians` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int DEFAULT NULL,
  `season_id` int DEFAULT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dni` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `relationship` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `player_id` (`player_id`),
  KEY `season_id` (`season_id`),
  CONSTRAINT `legal_guardians_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`),
  CONSTRAINT `legal_guardians_ibfk_2` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `legal_guardians`
--

LOCK TABLES `legal_guardians` WRITE;
/*!40000 ALTER TABLE `legal_guardians` DISABLE KEYS */;
INSERT INTO `legal_guardians` VALUES (1,3,2,'Ana','García','99999999Z','+34 600 123 456','ana@example.com','Madre','2025-05-03 23:35:04');
/*!40000 ALTER TABLE `legal_guardians` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `season_id` int NOT NULL,
  `amount` decimal(8,2) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `stripe_payment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `origin` enum('stripe','manual') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'stripe',
  PRIMARY KEY (`id`),
  KEY `player_id` (`player_id`),
  KEY `season_id` (`season_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,2,200.00,'2024-04-01 00:00:00','stripe_001','completed','stripe'),(2,2,2,0.00,NULL,NULL,'pending','stripe'),(3,3,2,100.00,'2024-04-02 00:00:00','stripe_002','pending','stripe'),(4,4,1,50.00,'2023-04-01 00:00:00','stripe_003','completed','stripe'),(25,23,2,400.00,'2025-05-05 18:54:00','cs_test_a1DOUEPGjTNxUXW5RDHBeh1UksqoKf8nWTHMyhbnYT364CO6PpCvOhTfFs','completed','stripe'),(27,25,2,230.00,'2025-05-06 12:36:37','cs_test_a1wdS75fg137OepuDcQEWJXMZOue0P1Di6LipOiQ7q3qssks4uE13NIoxj','completed','stripe'),(28,26,2,400.00,'2025-05-06 19:26:51','cs_test_a1c35hjtKgaLTwBvOUH1Is9oU0MSardNSor9b42EjxoGME70CbuFnapitc','completed','stripe'),(29,27,2,230.00,'2025-05-07 22:08:54',NULL,'pending','stripe'),(30,28,2,250.00,'2025-05-09 19:28:26','cs_test_a1WJ9Nma5jqj1a6qUeFx7HnKmo3yW42HfLPqpBTGo9IdOjq9R1wkAbZ1K4','completed','stripe'),(31,28,2,250.00,'2025-05-11 00:40:53','cs_test_a1WJ9Nma5jqj1a6qUeFx7HnKmo3yW42HfLPqpBTGo9IdOjq9R1wkAbZ1K4','completed','stripe'),(32,10,3,400.00,'2022-09-15 00:00:00','pi_example_10','completed','stripe'),(33,11,3,200.00,'2022-09-15 00:00:00','pi_example_11','completed','stripe'),(34,11,3,200.00,'2022-12-15 00:00:00','pi_example_12','completed','stripe'),(35,12,4,380.00,'2023-09-20 00:00:00','pi_example_13','completed','stripe');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `dni` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `photo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dni` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
INSERT INTO `players` VALUES (1,'Laura','Ramírez','2012-06-15','12345678A','laura@example.com','+34 600 000 001','2025-05-03 23:35:04',NULL),(2,'Carlos','Gómez','2010-06-13','23456789B','carlos@example.com','+34 600 000 002','2025-05-03 23:35:04',NULL),(3,'Marta','López','2008-06-15','34567890C','marta@example.com','+34 600 000 003','2025-05-03 23:35:04',NULL),(4,'Iván','Martínez','2006-06-15','45678901D','ivan@example.com','+34 600 000 004','2025-05-03 23:35:04',NULL),(5,'Ana','García','2004-06-15','56789012E','ana@example.com','+34 600 000 005','2025-05-03 23:35:04',NULL),(6,'Elena','Noguera','2008-06-15','67890123F','','','2025-05-03 23:35:04','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/photos%2F1746372306646-GoXMMFKWsAAQIvy.jpg?alt=media&token=f212c45b-42a7-4fc7-8c10-6e473025860a'),(7,'Raúl','Torres','2009-04-20','99988877Z',NULL,NULL,'2025-05-04 11:42:34',NULL),(10,'Laura','Ramírez','2010-01-01','12345678C','laura@ejemplo.com','600123456','2022-09-10 00:00:00',NULL),(11,'Carlos','Gómez','2009-05-20','23456789Q','carlos@ejemplo.com','600123457','2022-09-12 00:00:00',NULL),(12,'Ana','Pérez','2008-03-15','34567890S','ana@ejemplo.com','600123458','2022-09-14 00:00:00',NULL),(23,'Miquel Antoni','Capellà Arrom','1988-12-13','41520395J','miqueltoni@gmail.com','666999666','2025-05-05 18:54:00','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/photos%2F1746464039546-Spanish_ID_card_(front_side).webp.png?alt=media&token=55b15d47-217e-4263-8556-dd9e5aa47f01'),(25,'Cristina','Cardenes Baez','1999-12-14','41520395X','miqueltoni@gmail.com','666999666','2025-05-06 12:36:37','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/photos%2F1746527795888-Spanish_ID_card_(front_side).webp.png?alt=media&token=4a9e6d9e-0b1e-4fac-9657-611db1a561c5'),(26,'Joan Mateu','Capellà Arrom','1994-10-06','41520395Y','miqueltoni@gmail.com','666999666','2025-05-06 19:26:51','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/photos%2F1746552410166-Spanish_ID_card_(front_side).webp.png?alt=media&token=45113b11-c7f1-49e9-a183-163fbdcb04b5'),(27,'Benito','Camela','2000-05-07','67890123V','miqueltoni@gmail.com','666999666','2025-05-07 22:08:54','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/photos%2F1746648532256-Spanish_ID_card_(front_side).webp.png?alt=media&token=ca050161-79c5-4f0b-ba14-58d9a4c09e63'),(28,'Miquel Antoni','Capellà Arrom','2025-05-01','9999999R','miqueltoni@gmail.com','666999666','2025-05-09 19:28:26','https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/photos%2F1746916851363-Gorille_des_plaines_de_l\'ouest_%C3%A0_l\'Espace_Zoologique.jpg?alt=media&token=b10a1545-1089-41d0-a347-075fd90ee0c4');
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int DEFAULT NULL,
  `season_id` int DEFAULT NULL,
  `team_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `registered_at` datetime DEFAULT NULL,
  `total_fee` decimal(8,2) DEFAULT NULL,
  `split_payment` tinyint(1) NOT NULL DEFAULT '0',
  `participate_lottery` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `player_id` (`player_id`),
  KEY `season_id` (`season_id`),
  KEY `team_id` (`team_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`),
  CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`),
  CONSTRAINT `registrations_ibfk_3` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`),
  CONSTRAINT `registrations_ibfk_4` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
INSERT INTO `registrations` VALUES (1,1,2,1,2,'2024-03-31 00:00:00',200.00,0,0),(2,2,2,3,3,'2024-03-31 00:00:00',0.00,0,0),(4,4,1,NULL,3,'2023-03-31 00:00:00',200.00,0,0),(5,6,1,NULL,4,'2023-03-31 00:00:00',200.00,0,0),(6,7,1,NULL,2,'2025-05-04 11:42:55',NULL,0,0),(10,10,3,5,2,'2022-09-10 00:00:00',400.00,0,0),(11,11,3,6,3,'2022-09-12 00:00:00',400.00,1,0),(12,12,4,5,2,'2023-09-15 00:00:00',380.00,0,1),(29,23,2,1,5,'2025-05-05 18:54:00',400.00,0,0),(31,25,2,NULL,5,'2025-05-06 12:36:37',230.00,0,1),(32,26,2,8,5,'2025-05-06 19:26:51',400.00,0,0),(33,27,2,NULL,5,'2025-05-07 22:08:54',380.00,1,1),(35,28,2,NULL,5,'2025-05-11 00:40:53',400.00,1,0);
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seasons`
--

DROP TABLE IF EXISTS `seasons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '0',
  `is_locked` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seasons`
--

LOCK TABLES `seasons` WRITE;
/*!40000 ALTER TABLE `seasons` DISABLE KEYS */;
INSERT INTO `seasons` VALUES (1,'Temporada 2023-2024','2023-09-01','2024-06-30',0,1),(2,'Temporada 2024-2025','2024-09-01','2025-06-30',1,0),(3,'Temporada 2021-2022','2021-09-01','2022-06-30',0,0),(4,'Temporada 2022-2023','2022-09-01','2023-06-30',0,0);
/*!40000 ALTER TABLE `seasons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `coach_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `season_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `season_id` (`season_id`),
  CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `teams_ibfk_2` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,'Infantil B','Joan Capó',2,2),(3,'Juvenil Azul','Miguel Ruiz',1,2),(5,'Infantil A','Juan Pérez',2,3),(6,'Cadete B','Marta Gómez',3,4),(8,'Super Team','Miquel',5,2);
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'algaida_volei_club'
--
/*!50003 DROP PROCEDURE IF EXISTS `archive_debts` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `archive_debts`()
BEGIN
    -- Obtener la temporada activa
    DECLARE active_season_id INT;
    SELECT id INTO active_season_id FROM seasons WHERE is_active = 1 LIMIT 1;

    -- Verificar si existe temporada activa
    IF active_season_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No hay temporada activa';
    END IF;

    -- Insertar las deudas en el histórico sin violar ONLY_FULL_GROUP_BY
    INSERT INTO debt_history (player_id, season_id, total_due, total_paid, status)
    SELECT 
        r.player_id, 
        r.season_id, 
        MAX(CASE WHEN r.participate_lottery = 1 THEN 380 ELSE 400 END) AS total_due,
        IFNULL(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) AS total_paid,
        (CASE 
            WHEN IFNULL(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) = MAX(CASE WHEN r.participate_lottery = 1 THEN 380 ELSE 400 END) THEN 'completed'
            WHEN IFNULL(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) > 0 THEN 'partially_paid'
            ELSE 'pending' 
        END) AS status
    FROM registrations r
    LEFT JOIN payments p ON p.player_id = r.player_id AND p.season_id = r.season_id
    WHERE r.season_id = active_season_id AND r.split_payment = 1
    GROUP BY r.player_id, r.season_id;

    -- Actualizar las deudas como saldadas para la temporada activa
    UPDATE registrations 
    SET split_payment = 0 
    WHERE season_id = active_season_id AND split_payment = 1;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-13  6:28:54
