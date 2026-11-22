CREATE DATABASE  IF NOT EXISTS `g2g` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `g2g`;
-- MySQL dump 10.13  Distrib 5.5.16, for Win32 (x86)
--
-- Host: localhost    Database: g2g
-- ------------------------------------------------------
-- Server version	5.5.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `configuration`
--

DROP TABLE IF EXISTS `configuration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `configuration` (
  `key` varchar(45) NOT NULL,
  `value` varchar(45) NOT NULL,
  `activation_date` datetime NOT NULL,
  `deactivation_date` datetime DEFAULT NULL,
  PRIMARY KEY (`key`,`value`,`activation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuration`
--

LOCK TABLES `configuration` WRITE;
/*!40000 ALTER TABLE `configuration` DISABLE KEYS */;
INSERT INTO `configuration` VALUES ('closeTime','2100','0000-00-00 00:00:00',NULL),('defaultDeliveryCharge','7','0000-00-00 00:00:00',NULL),('defaultTaxPercent','10','0000-00-00 00:00:00',NULL),('openTime','2100','0000-00-00 00:00:00',NULL);
/*!40000 ALTER TABLE `configuration` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-03-09 20:55:30

INSERT INTO `g2g`.`user`
(`id`,
`username`,
`password`,
`first_name`,
`last_name`,
`eligible_for_free_delivery`,
`eligible_for_lifetime_free_delivery`,
`status`,
`activation_number`)
VALUES
(
-1,
'System',
'System',
'System',
'Account',
0,
0,
'LOCKED',
0
);

INSERT INTO `g2g`.`configuration` (`key`, `value`, `activation_date`) VALUES ('notificationNumbers', '201006239091<14086463230', '0000-00-00 00:00:00');
INSERT INTO `g2g`.`configuration` (`key`, `value`, `activation_date`) VALUES ('notificationEmails', 'eng.mmustafa84@gmail.com', '0000-00-00 00:00:00');
