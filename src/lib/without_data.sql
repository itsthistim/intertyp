-- --------------------------------------------------------
-- WITHOUT DATA
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for intertypcms
DROP DATABASE IF EXISTS `intertypcms`;
CREATE DATABASE IF NOT EXISTS `intertypcms` /*!40100 DEFAULT CHARACTER SET utf8mb3 COLLATE utf8mb3_uca1400_ai_ci */;
USE `intertypcms`;

GRANT ALL PRIVILEGES ON intertypcms.* TO 'intertyp'@'%';
FLUSH PRIVILEGES;
COMMIT;

-- Dumping structure for table intertypcms.gallery
DROP TABLE IF EXISTS `gallery`;
CREATE TABLE IF NOT EXISTS `gallery` (
  `gallery_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`gallery_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;

-- Dumping structure for table intertypcms.gallery_image
DROP TABLE IF EXISTS `gallery_image`;
CREATE TABLE IF NOT EXISTS `gallery_image` (
  `gallery_id` int(11) NOT NULL,
  `image_id` int(11) NOT NULL,
  PRIMARY KEY (`gallery_id`,`image_id`),
  KEY `fk_gallery_image_image1_idx` (`image_id`),
  KEY `fk_gallery_image_gallery1_idx` (`gallery_id`),
  CONSTRAINT `fk_gallery_image_gallery1` FOREIGN KEY (`gallery_id`) REFERENCES `gallery` (`gallery_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_gallery_image_image1` FOREIGN KEY (`image_id`) REFERENCES `image` (`image_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;

-- Dumping structure for table intertypcms.image
DROP TABLE IF EXISTS `image`;
CREATE TABLE IF NOT EXISTS `image` (
  `image_id` int(11) NOT NULL AUTO_INCREMENT,
  `url` text NOT NULL,
  `alt` varchar(45) DEFAULT '',
  `width` int(11) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  PRIMARY KEY (`image_id`),
  UNIQUE KEY `url_UNIQUE` (`url`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;


-- Dumping structure for table intertypcms.link
DROP TABLE IF EXISTS `link`;
CREATE TABLE IF NOT EXISTS `link` (
  `link_id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(45) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`link_id`),
  UNIQUE KEY `slug_UNIQUE` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;


-- Dumping structure for table intertypcms.product
DROP TABLE IF EXISTS `product`;
CREATE TABLE IF NOT EXISTS `product` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  `description` text DEFAULT NULL,
  `link_id` int(11) NOT NULL,
  `cover_image_id` int(11) DEFAULT NULL,
  `gallery_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`product_id`,`link_id`),
  KEY `fk_product_image1_idx` (`cover_image_id`),
  KEY `fk_product_link1_idx` (`link_id`),
  KEY `fk_product_gallery1_idx` (`gallery_id`),
  CONSTRAINT `fk_product_gallery1` FOREIGN KEY (`gallery_id`) REFERENCES `gallery` (`gallery_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_product_image1` FOREIGN KEY (`cover_image_id`) REFERENCES `image` (`image_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_product_link1` FOREIGN KEY (`link_id`) REFERENCES `link` (`link_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;


-- Dumping structure for view intertypcms.product_v
DROP VIEW IF EXISTS `product_v`;
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `product_v` (
	`id` INT(11) NOT NULL,
	`title` TEXT NOT NULL COLLATE 'utf8mb3_uca1400_ai_ci',
	`description` TEXT NULL COLLATE 'utf8mb3_uca1400_ai_ci',
	`cover_id` INT(11) NULL,
	`cover_url` TEXT NULL COLLATE 'utf8mb3_uca1400_ai_ci',
	`cover_alt` VARCHAR(1) NULL COLLATE 'utf8mb3_uca1400_ai_ci',
	`cover_width` INT(11) NULL,
	`cover_heigth` INT(11) NULL,
	`link_id` INT(11) NOT NULL,
	`link_slug` VARCHAR(1) NOT NULL COLLATE 'utf8mb3_uca1400_ai_ci',
	`link_name` VARCHAR(1) NULL COLLATE 'utf8mb3_uca1400_ai_ci',
	`gallery_id` INT(11) NULL,
	`gallery_title` VARCHAR(1) NULL COLLATE 'utf8mb3_uca1400_ai_ci'
) ENGINE=MyISAM;

-- Dumping structure for table intertypcms.project
DROP TABLE IF EXISTS `project`;
CREATE TABLE IF NOT EXISTS `project` (
  `project_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  `description` text DEFAULT NULL,
  `link_id` int(11) NOT NULL,
  `cover_image_id` int(11) DEFAULT NULL,
  `gallery_id` int(11) DEFAULT NULL,
  `project_date` datetime DEFAULT NULL,
  PRIMARY KEY (`project_id`,`link_id`),
  UNIQUE KEY `link_UNIQUE` (`link_id`),
  KEY `fk_component_image_idx` (`cover_image_id`),
  KEY `fk_component_link1_idx` (`link_id`),
  KEY `fk_component_gallery1_idx` (`gallery_id`),
  CONSTRAINT `fk_component_gallery1` FOREIGN KEY (`gallery_id`) REFERENCES `gallery` (`gallery_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_component_image` FOREIGN KEY (`cover_image_id`) REFERENCES `image` (`image_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_component_link1` FOREIGN KEY (`link_id`) REFERENCES `link` (`link_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;


-- Dumping structure for view intertypcms.project_v
DROP VIEW IF EXISTS `project_v`;
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `project_v` (
	`id` INT(11) NOT NULL,
	`title` TEXT NOT NULL COLLATE 'utf8mb3_uca1400_ai_ci',
	`description` TEXT NULL COLLATE 'utf8mb3_uca1400_ai_ci',
	`date` DATETIME NULL,
	`cover_id` INT(11) NULL,
	`cover_url` TEXT NULL COLLATE 'utf8mb3_uca1400_ai_ci',
	`cover_alt` VARCHAR(1) NULL COLLATE 'utf8mb3_uca1400_ai_ci',
	`cover_width` INT(11) NULL,
	`cover_heigth` INT(11) NULL,
	`link_id` INT(11) NOT NULL,
	`link_slug` VARCHAR(1) NOT NULL COLLATE 'utf8mb3_uca1400_ai_ci',
	`link_name` VARCHAR(1) NULL COLLATE 'utf8mb3_uca1400_ai_ci',
	`gallery_id` INT(11) NULL,
	`gallery_title` VARCHAR(1) NULL COLLATE 'utf8mb3_uca1400_ai_ci'
) ENGINE=MyISAM;

-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `product_v`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `product_v` AS SELECT p.product_id "id", p.title, p.description, i.image_id "cover_id", i.url "cover_url", i.alt "cover_alt", i.width "cover_width", i.height "cover_heigth", l.link_id, l.slug "link_slug", l.name "link_name", g.gallery_id, g.title "gallery_title"
FROM product p
JOIN link l ON l.link_id = p.link_id
LEFT JOIN image i ON i.image_id = p.cover_image_id
LEFT JOIN gallery g ON g.gallery_id = p.gallery_id ; ;

-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `project_v`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `project_v` AS SELECT p.project_id "id", p.title, p.description, p.project_date "date", i.image_id "cover_id", i.url "cover_url", i.alt "cover_alt", i.width "cover_width", i.height "cover_heigth", l.link_id, l.slug "link_slug", l.name "link_name", g.gallery_id, g.title "gallery_title"
FROM project p
JOIN link l ON l.link_id = p.link_id
LEFT JOIN image i ON i.image_id = p.cover_image_id
LEFT JOIN gallery g ON g.gallery_id = p.gallery_id ; ;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

alter table gallery auto_increment = 1;

alter table gallery_image auto_increment = 1;

alter table image auto_increment = 1;

alter table link auto_increment = 1;

alter table product auto_increment = 1;

alter table project auto_increment = 1;

alter table image alter alt set default "";
