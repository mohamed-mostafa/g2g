CREATE  TABLE `g2g`.`delivery_person_session` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `start_time` DATETIME NOT NULL ,
  `planned_end_time` DATETIME NOT NULL ,
  `planned_duration` INT NOT NULL ,
  `actual_end_time` DATETIME NULL ,
  `start_lng` DECIMAL NULL ,
  `start_lat` DOUBLE NULL ,
  `delivery_person_id` INT NOT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `dp_idx` (`delivery_person_id` ASC) ,
  CONSTRAINT `dp`
    FOREIGN KEY (`delivery_person_id` )
    REFERENCES `g2g`.`delivery_person` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

ALTER TABLE `g2g`.`order` ADD COLUMN `restaurant_street_address` VARCHAR(500) NOT NULL  AFTER `delivery_user_email` , ADD COLUMN `restaurant_city` VARCHAR(45) NOT NULL  AFTER `restaurant_street_address` , ADD COLUMN `restaurant_zip_code` VARCHAR(45) NOT NULL  AFTER `restaurant_city` ;

update g2g.order o left join g2g.restaurant r on  o.restaurant_id = r.id
set o.restaurant_street_address = r.street_address,	o.restaurant_city = r.city,	o.restaurant_zip_code = r.zip_code;

	
CREATE  TABLE `g2g`.`promotion` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `promotion_code` VARCHAR(45) NOT NULL ,
  `name` VARCHAR(100) NOT NULL ,
  `customer_message` VARCHAR(100) NOT NULL ,
  `value_discount_percent` INT NOT NULL DEFAULT 0 ,
  `delivery_charge_discount_percent` VARCHAR(45) NOT NULL DEFAULT 0 ,
  PRIMARY KEY (`id`) );
  
  ALTER TABLE `g2g`.`promotion` ADD COLUMN `active` TINYINT NOT NULL DEFAULT 1  AFTER `delivery_charge_discount_percent` ;
  ALTER TABLE `g2g`.`promotion` ADD COLUMN `validity_date` DATETIME NOT NULL AFTER `delivery_charge_discount_percent` ;
  ALTER TABLE `g2g`.`promotion` ADD COLUMN `minimum_order_value` DECIMAL(10,2) NOT NULL  AFTER `validity_date`;

  ALTER TABLE `g2g`.`promotion` ADD UNIQUE INDEX `promotion_code_unique_idx` (`promotion_code` ASC) ;
  
  ALTER TABLE `g2g`.`order` ADD COLUMN `promotion_id` INT NULL  AFTER `delivery_person_id` ;

  CREATE  TABLE `g2g`.`user_promotion` (
  `user_id` INT NOT NULL ,
  `promotion_id` INT NOT NULL ,
  `consumed` TINYINT NOT NULL DEFAULT 0 ,
  PRIMARY KEY (`user_id`, `promotion_id`) ,
  INDEX `user_fk_idx` (`user_id` ASC) ,
  CONSTRAINT `promotion_fk`
    FOREIGN KEY (`promotion_id` )
    REFERENCES `g2g`.`promotion` (`id` )
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `user_fk`
    FOREIGN KEY (`user_id` )
    REFERENCES `g2g`.`user` (`id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE);