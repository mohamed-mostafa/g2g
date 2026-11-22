CREATE TABLE `g2g`.`user_plan` (
  `name` varchar(64) NOT NULL,
  `first_time_delivery_charge` decimal(10,2) NOT NULL DEFAULT '4',
  `delivery_charge` decimal(10,2) NOT NULL DEFAULT '7',
  `is_default` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`name`)
);

CREATE  TABLE `g2g`.`user_profile` (
  `user_id` INT NOT NULL ,
  `eligible_for_free_delivery` tinyint(4) NOT NULL DEFAULT '1',
  `eligible_for_lifetime_free_delivery` tinyint(4) NOT NULL DEFAULT '0',
  `plan` varchar(64) NOT NULL,
  PRIMARY KEY (`user_id`) ,
  INDEX `fk_user_profile_user_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_user_profile_user`
    FOREIGN KEY (`user_id` )
    REFERENCES `g2g`.`user` (`id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    CONSTRAINT `fk_user_profile_user_plan`
    FOREIGN KEY (`plan` )
    REFERENCES `g2g`.`user_plan` (`name` )
    ON DELETE RESTRICT
    ON UPDATE CASCADE);
   
-- Description for plans
ALTER TABLE `g2g`.`user_plan` ADD COLUMN `description` VARCHAR(256) NOT NULL  AFTER `name` ;

-- total ordders count for profiles
ALTER TABLE `g2g`.`user_profile` ADD COLUMN `total_orders_count` INT NOT NULL DEFAULT 0  AFTER `eligible_for_lifetime_free_delivery` ;

-- insert the default plan
INSERT INTO g2g.user_plan values ('NIGHT OWL', 'Night Owls are charged $4 for their first order, and $7 for the next orders.', 4, 7, 1);

-- insert a user profile for every user, copying the eligibility columns, setting the total orders count to initially zero, and assigning the default plan
INSERT INTO g2g.user_profile (select id, eligible_for_free_delivery, eligible_for_lifetime_free_delivery, 0, 'NIGHT OWL' from g2g.user);

-- updaging the total orders count for all users
UPDATE g2g.user_profile SET g2g.user_profile.total_orders_count = count(*) from g2g.order where g2g.order.user_id = g2g.user_profile.user_id AND g2g.order.status NOT IN ('REFUNDED', 'REFUNDED_ARCHIVED');


-- insert the anonymous user (and its plan), used for messages
INSERT INTO `g2g`.`user` (`id`, `username`, `password`, `first_name`, `last_name`, `status`, `activation_number`, `registration_date`) VALUES (-2, 'Anonymous', 'Anonymous', 'Anonymous', 'Account', 'LOCKED', 0, '2015-01-01');
INSERT INTO g2g.user_profile (select id, 0, 0, 0, 'NIGHT OWL' from g2g.user where id = -2);


ALTER TABLE `g2g`.`order` ADD INDEX `order_status_idx` (`status` ASC) ;
ALTER TABLE `g2g`.`restaurant` ADD INDEX `restaurant_zip_code_idx` (`zip_code` ASC) ;
ALTER TABLE `g2g`.`user` ADD INDEX `user_username_idx` (`username` ASC) , ADD INDEX `user_status_idx` (`status` ASC) , ADD INDEX `user_registration_date_idx` (`registration_date` ASC) ;

-- NEXT ARE NOT YET DEPLOYED TO PRODUCTION
-- remove the 2 eligibility columns from the user table
UPDATE g2g.configuration SET g2g.configuration.value = 'Feel free to browse the menus, but you can only place orders when our go getters are owning the streets, like every night, 10PM to 4AM' WHERE g2g.configuration.key =  'offlineMessage'
ALTER TABLE `g2g`.`user` DROP COLUMN `eligible_for_lifetime_free_delivery` , DROP COLUMN `eligible_for_free_delivery` ;