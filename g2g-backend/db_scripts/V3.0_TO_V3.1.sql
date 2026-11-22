CREATE TABLE `area` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `active` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1$$



CREATE TABLE `zip_code` (
  `zip_code` int(5) NOT NULL,
  `area_id` int(11) NOT NULL,
  PRIMARY KEY (`zip_code`),
  KEY `fk_zipcode_area_idx` (`area_id`),
  CONSTRAINT `fk_zipcode_area` FOREIGN KEY (`area_id`) REFERENCES `area` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1$$

