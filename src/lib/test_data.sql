-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.6.2-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
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

-- Dumping structure for table intertypcms.gallery
DROP TABLE IF EXISTS `gallery`;
CREATE TABLE IF NOT EXISTS `gallery` (
  `gallery_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`gallery_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;

-- Dumping data for table intertypcms.gallery: ~2 rows (approximately)
DELETE FROM `gallery`;
INSERT INTO `gallery` (`gallery_id`, `title`) VALUES
	(1, NULL),
	(2, NULL);

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

-- Dumping data for table intertypcms.gallery_image: ~9 rows (approximately)
DELETE FROM `gallery_image`;
INSERT INTO `gallery_image` (`gallery_id`, `image_id`) VALUES
	(1, 1),
	(1, 2),
	(1, 3),
	(1, 4),
	(1, 5),
	(2, 6),
	(2, 7),
	(2, 8),
	(2, 9);

-- Dumping structure for table intertypcms.image
DROP TABLE IF EXISTS `image`;
CREATE TABLE IF NOT EXISTS `image` (
  `image_id` int(11) NOT NULL AUTO_INCREMENT,
  `url` text NOT NULL,
  `alt` varchar(45) DEFAULT NULL,
  `width` int(11) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  PRIMARY KEY (`image_id`),
  UNIQUE KEY `url_UNIQUE` (`url`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;

-- Dumping data for table intertypcms.image: ~9 rows (approximately)
DELETE FROM `image`;
INSERT INTO `image` (`image_id`, `url`, `alt`, `width`, `height`) VALUES
	(1, 'https://www.intertyp.at/wp-content/uploads/2025/02/DSC03520.jpg', 'Alten- und Pflegeheim Peuerbach', 1024, 768),
	(2, 'https://www.intertyp.at/wp-content/uploads/2025/02/RIMG0102-scaled-e1740124491589.jpg', 'Seniorenzentrum Pichling', 2300, 1920),
	(3, 'https://www.intertyp.at/wp-content/uploads/2025/02/Kindergarten-Krabbelstube.jpg', 'Krabbelstube', 1600, 900),
	(4, 'https://www.intertyp.at/wp-content/uploads/2025/02/IMGP2794-scaled.jpg', 'Physiotherapie', 2560, 1920),
	(5, 'https://www.intertyp.at/wp-content/uploads/2025/02/Dani-Ajdin-1.4-2.jpg', 'Stadtoase Kolping', 864, 864),
	(6, 'https://www.intertyp.at/wp-content/uploads/2025/02/DSC08661.jpg', 'Rezeption & Frühstück', 1024, 768),
	(7, 'https://www.intertyp.at/wp-content/uploads/2025/02/IMG_2313.jpg', 'Toiletten', 1024, 768),
	(8, 'https://www.intertyp.at/wp-content/uploads/2025/02/20241029_105211-scaled.jpg', 'EG', 1440, 2560),
	(9, 'https://www.intertyp.at/wp-content/uploads/2025/02/Ralf-Ria-25.6-1.jpg', 'Richtungsweiser', 576, 768);

-- Dumping structure for table intertypcms.link
DROP TABLE IF EXISTS `link`;
CREATE TABLE IF NOT EXISTS `link` (
  `link_id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(45) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`link_id`),
  UNIQUE KEY `slug_UNIQUE` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;

-- Dumping data for table intertypcms.link: ~20 rows (approximately)
DELETE FROM `link`;
INSERT INTO `link` (`link_id`, `slug`, `name`) VALUES
	(1, '/projekte/architekten', 'Architekten & Bau'),
	(2, '/projekte/baufirmen', 'Baufirmen'),
	(3, '/projekte/feuerwehr', 'Feuerwehr'),
	(4, '/projekte/gemeinden', 'Gemeinden und öffentliche Gebäude'),
	(5, '/projekte/genossenschaften', 'Genossenschaften'),
	(6, '/projekte/gesundheit', 'Gesundheitsbereich'),
	(7, '/projekte/bildung', 'Bildung'),
	(8, '/projekte/wellness', 'Hotels & Wellness'),
	(9, '/projekte/firmen', 'Firmen'),
	(10, '/produkte/aussenbeschriftung', 'Außenbeschriftung'),
	(11, '/produkte/buchstaben', 'Buchstaben'),
	(12, '/produkte/digidruck', 'Digi Druck'),
	(13, '/produkte/folien', 'Folien'),
	(14, '/produkte/objektbeschriftung', 'Objektbeschriftung'),
	(15, '/produkte/pokale', 'Pokale'),
	(16, '/produkte/schilder', 'Schilder'),
	(17, '/produkte/sonstiges', 'Sonstiges'),
	(18, '/produkte/stempel', 'Stempel'),
	(19, '/produkte/taktile', 'Taktile'),
	(20, '/produkte/verkehr', 'Verkehr');

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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;

-- Dumping data for table intertypcms.product: ~11 rows (approximately)
DELETE FROM `product`;
INSERT INTO `product` (`product_id`, `title`, `description`, `link_id`, `cover_image_id`, `gallery_id`) VALUES
	(1, 'Außenbeschilderung', 'Präsentieren Sie Ihr Unternehmen sichtbar und wirkungsvoll – mit Leuchtwerbung, Pylone und großflächigen Außenbeschriftungen.', 10, 2, 2),
	(2, 'Buchstaben', 'Ob einzelne Buchstaben oder komplette Schriftzüge – wir fertigen hochwertige Buchstaben und Einzelbuchstaben aus verschiedenen Materialien für eine prägnante Beschriftung auf jeder Oberfläche.', 11, 2, 2),
	(3, 'Digi Druck', 'Hochwertige Drucklösungen für verschiedenste Anwendungen – von Schildern bis zu individuellen Aufklebern.', 12, 2, 2),
	(4, 'Folien', 'Vielseitig einsetzbar und individuell gestaltbar – unsere Folien bieten Schutz, Sichtschutz oder dekorative Gestaltung für unterschiedlichste Anwendungen.', 13, 2, 2),
	(5, 'Objektbeschriftung', 'Ob Gebäude, Räume oder Türen – mit professioneller Objektbeschriftung sorgen wir für eine klare und ansprechende Kennzeichnung.', 14, 2, 2),
	(6, 'Pokale', 'Auszeichnung mit Stil – unsere hochwertigen Pokale und Trophäen sind individuell gestaltbar und perfekt für Ehrungen und Wettbewerbe. Finden Sie das passende Modell!', 15, 2, 2),
	(7, 'Schilder', 'Von Firmenschildern bis zu Informations- und Hinweisschildern – wir bieten maßgeschneiderte Lösungen für Innen- und Außenbereiche.', 16, 2, 2),
	(8, 'Sonstiges', 'Ob Magnettafeln, Klapprahmen, Schaukästen oder Verkehrsspiegel – hier finden Sie praktische und funktionale Produkte für verschiedenste Einsatzzwecke.', 17, 2, 2),
	(9, 'Stempel', 'Individuelle Stempel für Büro, Unternehmen oder den privaten Gebrauch – präzise, langlebig und in verschiedenen Ausführungen erhältlich.', 18, 2, 2),
	(10, 'Taktile', 'Barrierefreie Orientierung mit tastbaren Schildern und taktilen Beschriftungen – ideal für öffentliche Einrichtungen, Unternehmen und Wohnanlagen.', 19, 2, 2),
	(11, 'Verkehr', 'Von Verkehrsschildern bis zu Spiegeln – wir bieten eine große Auswahl an Produkten für sichere und gut sichtbare Verkehrskennzeichnungen.', 20, 2, 2);

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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;

-- Dumping data for table intertypcms.project: ~9 rows (approximately)
DELETE FROM `project`;
INSERT INTO `project` (`project_id`, `title`, `description`, `link_id`, `cover_image_id`, `gallery_id`, `project_date`) VALUES
	(1, 'Architekten', 'Wir sind Ihr Partner für präzise und hochwertige Beschriftungs-, Beschilderungs- und Folienlösungen in Architekturprojekten. Von klaren Leitsystemen bis zur stilvollen Außenbeschriftung – wir setzen Konzepte professionell um und unterstützen Architekten bei der perfekten Umsetzung ihrer Planungen. Entdecken Sie unsere realisierten Projekte!', 1, 1, 2, NULL),
	(2, 'Baufirmen', 'Unsere langjährige Erfahrung im Bereich Folierung und Objektbeschriftung macht uns zum verlässlichen Partner für Baufirmen. Wir haben zahlreiche Projekte erfolgreich begleitet – von Baustellenbeschilderungen über Objektbeschriftungen bis hin zu hochwertigen Fenster- und Fassadenfolierungen.', 2, 5, 1, NULL),
	(3, 'Bildung', 'Moderne Beschriftungen und langlebige Folierungen tragen zur Struktur und Gestaltung von Schulen bei. Wir haben zahlreiche Bildungseinrichtungen mit Türschildern, Fassadenbeschriftungen und dekorativen Folien ausgestattet. Unsere Lösungen sind funktional, hochwertig und individuell angepasst.', 7, 3, 1, NULL),
	(4, 'Gesundheitsbereich', 'Klare Orientierung und ansprechende Gestaltung spielen im Gesundheitsbereich eine zentrale Rolle. Mit hochwertigen Beschriftungen, Leitsystemen und Glasfolierungen haben wir Arztpraxen, Kliniken und Ordinationen ausgestattet. Ob Informationsschilder, Türbeschriftungen oder Sichtschutzfolien – unsere Lösungen sind funktional, langlebig und individuell angepasst.', 6, 4, 1, NULL),
	(5, 'Wellness & Hotels', 'Ein stimmiges Design und eine klare Beschriftung tragen maßgeblich zur Atmosphäre eines Hotels oder einer Wellnesseinrichtung bei. Ob dezente Wegweiser, stilvolle Außenbeschriftungen, hochwertige Folierungen – wir haben bereits zahlreiche Hotels und Thermen mit durchdachten Lösungen ausgestattet. Lassen Sie sich von unseren Projekten inspirieren und entdecken Sie, wie Beschriftung und Design perfekt zusammenspielen, um Ihren Gästen ein unvergessliches Erlebnis zu bieten!', 8, 6, 1, NULL),
	(6, 'Gemeinden und öffentliche Gebäude', 'Öffentliche Gebäude und Einrichtungen benötigen durchdachte Beschilderungen für eine klare Orientierung. Wir haben Gemeinden mit individuell gestalteten Beschilderungen, Infotafeln und Fassadenbeschriftungen ausgestattet. Ob Rathäuser, Gemeindezentren oder andere kommunale Einrichtungen – unsere langlebigen Lösungen verbinden Funktionalität mit ansprechendem Design.', 4, 4, 2, NULL),
	(7, 'Feuerwehr', 'Feuerwachen benötigen eine klare Kennzeichnung – sowohl im Außenbereich als auch in den Innenräumen. Wir haben verschiedene Projekte mit Fassadenbeschriftungen, Tür- und Raumkennzeichnungen sowie großflächigen Logos umgesetzt. Unsere langlebigen und robusten Lösungen sorgen für eine professionelle Gestaltung.', 3, 3, 1, NULL),
	(8, 'Genossenschaften', 'Unsere langjährige Erfahrung in der Beschriftung und Folierung von Wohnbauprojekten macht uns zum verlässlichen Partner für Genossenschaften. Wir haben zahlreiche Projekte erfolgreich umgesetzt – von Gebäude- und Wohnanlagenbeschriftungen bis hin zu hochwertigen Glas- und Fassadenfolierungen.', 5, 1, 1, NULL),
	(9, 'Firmen', 'Jedes Unternehmen braucht eine starke Außenwirkung. Wir haben zahlreiche Firmen mit individuellen Lösungen unterstützt. Ob Schilder, Fassadenbeschriftungen oder Glasfolierungen – wir unterstützen Unternehmen dabei, ihre Räumlichkeiten professionell zu gestalten. Mit hochwertigen Materialien und präziser Umsetzung sorgen wir für eine klare, professionelle Gestaltung.', 9, 1, 1, NULL);

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
LEFT JOIN gallery g ON g.gallery_id = p.gallery_id ;

-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `project_v`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `project_v` AS SELECT p.project_id "id", p.title, p.description, p.project_date "date", i.image_id "cover_id", i.url "cover_url", i.alt "cover_alt", i.width "cover_width", i.height "cover_heigth", l.link_id, l.slug "link_slug", l.name "link_name", g.gallery_id, g.title "gallery_title"
FROM project p
JOIN link l ON l.link_id = p.link_id
LEFT JOIN image i ON i.image_id = p.cover_image_id
LEFT JOIN gallery g ON g.gallery_id = p.gallery_id ;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
