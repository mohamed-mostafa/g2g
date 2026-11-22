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
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `address` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `street_address_1` varchar(128) NOT NULL,
  `street_address_2` varchar(128) DEFAULT NULL,
  `state` varchar(45) NOT NULL,
  `city` varchar(45) NOT NULL,
  `zip_code` varchar(45) NOT NULL,
  `address_details` varchar(1024) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_address_user1_idx` (`user_id`),
  CONSTRAINT `fk_address_user1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
-- Table structure for table `delivery_person`
--

DROP TABLE IF EXISTS `delivery_person`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `delivery_person` (
  `id` int(11) NOT NULL,
  `username` varchar(45) NOT NULL,
  `password` text NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `active` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status` varchar(45) NOT NULL,
  `placed_at` datetime NOT NULL,
  `picked_up_at` datetime DEFAULT NULL,
  `delivered_At` datetime DEFAULT NULL,
  `value` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) NOT NULL,
  `discounts` decimal(10,2) NOT NULL,
  `delivery_charge` decimal(10,2) NOT NULL,
  `total_without_tips` decimal(10,2) NOT NULL,
  `tips_percent` int(11) NOT NULL,
  `tips_amount` decimal(10,2) NOT NULL,
  `total_with_tips` decimal(10,2) NOT NULL,
  `delivery_street_address_1` varchar(128) NOT NULL,
  `delivery_street_address_2` varchar(128) DEFAULT NULL,
  `delivery_city` varchar(45) NOT NULL,
  `delivery_state` varchar(45) NOT NULL,
  `delivery_zip_code` varchar(45) NOT NULL,
  `delivery_address_details` varchar(1024) DEFAULT NULL,
  `delivery_user_full_name` varchar(90) NOT NULL,
  `delivery_user_phone` varchar(45) NOT NULL,
  `delivery_user_email` varchar(45) NOT NULL,
  `payment_token_id` varchar(1024) NOT NULL,
  `payment_charge_id` varchar(1024) NOT NULL,
  `user_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `delivery_person_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_order_user1_idx` (`user_id`),
  KEY `fk_order_delivery_person1_idx` (`delivery_person_id`),
  KEY `fk_order_restaurant_idx` (`restaurant_id`),
  CONSTRAINT `fk_order_delivery_person1` FOREIGN KEY (`delivery_person_id`) REFERENCES `delivery_person` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_order_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_order_user1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `order_item`
--

DROP TABLE IF EXISTS `order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_item` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `special_instructions` varchar(1024) DEFAULT NULL,
  `sides` varchar(2048) DEFAULT NULL COMMENT 'Delimieter separated names of sides',
  `restaurant_menu_category_item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_order_item_order1_idx` (`order_id`),
  KEY `fk_order_item_menu_category_item_idx` (`restaurant_menu_category_item_id`),
  CONSTRAINT `fk_order_item_menu_category_item` FOREIGN KEY (`restaurant_menu_category_item_id`) REFERENCES `restaurant_menu_category_item` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_order_item_order1` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `restaurant`
--

DROP TABLE IF EXISTS `restaurant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `restaurant` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `location` varchar(45) DEFAULT NULL,
  `cuisine` varchar(45) DEFAULT NULL,
  `logo` longtext,
  `street_address` varchar(500) NOT NULL,
  `city` varchar(45) NOT NULL,
  `state` varchar(45) NOT NULL,
  `zip_code` varchar(45) NOT NULL,
  `partner` tinyint(1) NOT NULL DEFAULT '0',
  `delivery_charge` decimal(10,2) DEFAULT NULL,
  `active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `restaurant_menu_category`
--

DROP TABLE IF EXISTS `restaurant_menu_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `restaurant_menu_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `active` tinyint(4) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_menu_category_restaurant_idx` (`restaurant_id`),
  CONSTRAINT `fk_menu_category_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `restaurant_menu_category_item`
--

DROP TABLE IF EXISTS `restaurant_menu_category_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `restaurant_menu_category_item` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `description` varchar(256) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `active` tinyint(1) NOT NULL,
  `restaurant_menu_category_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_menu_category_item_menu_category1_idx` (`restaurant_menu_category_id`),
  CONSTRAINT `fk_menu_category_item_menu_category1` FOREIGN KEY (`restaurant_menu_category_id`) REFERENCES `restaurant_menu_category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `restaurant_menu_category_item_side_group`
--

DROP TABLE IF EXISTS `restaurant_menu_category_item_side_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `restaurant_menu_category_item_side_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `maximum_allowed_items` int(11) NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `restaurant_menu_category_item_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_side_item_idx` (`restaurant_menu_category_item_id`),
  KEY `fk_restaurant_menu_category_item_idx` (`restaurant_menu_category_item_id`),
  CONSTRAINT `fk_restaurant_menu_category_item` FOREIGN KEY (`restaurant_menu_category_item_id`) REFERENCES `restaurant_menu_category_item` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `restaurant_zip_code`
--

DROP TABLE IF EXISTS `restaurant_zip_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `restaurant_zip_code` (
  `restaurant_id` int(11) NOT NULL,
  `zip_code` varchar(45) NOT NULL,
  PRIMARY KEY (`restaurant_id`,`zip_code`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `side_group_item`
--

DROP TABLE IF EXISTS `side_group_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `side_group_item` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `description` varchar(45) DEFAULT NULL,
  `active` tinyint(4) NOT NULL DEFAULT '1',
  `restaurant_menu_category_item_side_group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_side_menu_id_idx` (`restaurant_menu_category_item_side_group_id`),
  CONSTRAINT `fk_side_menu_id` FOREIGN KEY (`restaurant_menu_category_item_side_group_id`) REFERENCES `restaurant_menu_category_item_side_group` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `password` text NOT NULL,
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `phone` varchar(45) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_message`
--

DROP TABLE IF EXISTS `user_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject` varchar(128) DEFAULT NULL,
  `message` varchar(2048) DEFAULT NULL,
  `message_time` datetime NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_message_user_idx` (`user_id`),
  CONSTRAINT `fk_message_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-03-09 20:54:58


ALTER TABLE `g2g`.`user` ADD COLUMN `registration_date` DATETIME NOT NULL  AFTER `activation_number` ;
