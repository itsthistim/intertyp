-- --------------------------------------------------------
-- WITH DATA
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;

-- Dumping data for table intertypcms.gallery: ~14 rows (approximately)
DELETE FROM `gallery`;
INSERT INTO `gallery` (`gallery_id`, `title`) VALUES
	(1, 'Referenzen für Architekten'),
	(2, 'Referenzen für Architekten'),
	(4, 'Referenzen für Baufirmen'),
	(5, 'Referenzen für Bildungseinrichtungen'),
	(6, 'Referenzen für Unternehmen'),
	(7, 'Referenzen für den Gesundheitsbereich'),
	(8, 'Referenzen für Unternehmen'),
	(9, 'Referenzen für Hotels & Wellness'),
	(11, NULL),
	(12, NULL),
	(13, NULL),
	(14, NULL),
	(15, NULL),
	(16, NULL);

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

-- Dumping data for table intertypcms.gallery_image: ~110 rows (approximately)
DELETE FROM `gallery_image`;
INSERT INTO `gallery_image` (`gallery_id`, `image_id`) VALUES
	(1, 1),
	(2, 1),
	(4, 1),
	(8, 1),
	(12, 1),
	(15, 1),
	(1, 2),
	(2, 2),
	(4, 2),
	(6, 2),
	(12, 2),
	(15, 2),
	(1, 3),
	(2, 3),
	(4, 3),
	(6, 3),
	(13, 3),
	(1, 4),
	(2, 4),
	(4, 4),
	(9, 4),
	(15, 4),
	(1, 5),
	(2, 5),
	(4, 5),
	(15, 5),
	(2, 7),
	(4, 7),
	(13, 7),
	(4, 8),
	(11, 8),
	(15, 8),
	(4, 9),
	(13, 9),
	(4, 10),
	(6, 10),
	(8, 10),
	(15, 10),
	(7, 11),
	(8, 11),
	(13, 11),
	(5, 12),
	(8, 12),
	(9, 12),
	(5, 13),
	(16, 13),
	(5, 14),
	(16, 14),
	(5, 15),
	(16, 15),
	(5, 16),
	(6, 16),
	(9, 16),
	(12, 16),
	(5, 17),
	(9, 17),
	(11, 17),
	(5, 18),
	(16, 18),
	(5, 19),
	(11, 19),
	(16, 19),
	(6, 20),
	(8, 20),
	(16, 20),
	(6, 21),
	(11, 21),
	(12, 21),
	(6, 22),
	(7, 22),
	(8, 22),
	(13, 22),
	(6, 23),
	(7, 23),
	(12, 23),
	(15, 23),
	(6, 24),
	(7, 24),
	(15, 24),
	(6, 25),
	(8, 25),
	(12, 25),
	(13, 25),
	(6, 26),
	(13, 26),
	(7, 27),
	(8, 27),
	(12, 27),
	(7, 28),
	(7, 29),
	(8, 29),
	(8, 30),
	(9, 30),
	(9, 31),
	(11, 31),
	(11, 32),
	(11, 33),
	(11, 34),
	(11, 35),
	(11, 36),
	(15, 36),
	(14, 37),
	(14, 38),
	(14, 39),
	(14, 40),
	(14, 41),
	(14, 42),
	(14, 43),
	(15, 44),
	(16, 44);

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

-- Dumping data for table intertypcms.image: ~43 rows (approximately)
DELETE FROM `image`;
INSERT INTO `image` (`image_id`, `url`, `alt`, `width`, `height`) VALUES
	(1, '/images/altenheim-peuerbach.jpg', 'Altenheim Peuerbach', 1024, 768),
	(2, '/images/industriellenvereinigung.jpg', 'Hauseck Industriellenvereinigung', 200, 200),
	(3, '/images/türenbeschriftung-LKUF.jpg', 'Türenbeschriftung LKUF', 1180, 2560),
	(4, '/images/stadtoase-kolping.jpg', 'Stadtoase Kolping', 864, 864),
	(5, '/images/seniorenzentrum-pichling.jpg', 'Seniorenzentrum Pichling', 2300, 1920),
	(7, '/images/welcome-beschriftung-glas-front.png', 'Glas Front Welcome Beschriftung', 4032, 3024),
	(8, '/images/pylon-ISG.jpg', 'Pylon ISG', 480, 640),
	(9, '/images/glaswand-folierung.jpg', 'Glaswand Folierung', 2304, 1296),
	(10, '/images/pylon-firmenschilder.jpg', 'Firmenschilder Pylon', 898, 1600),
	(11, '/images/Kindergarten-Krabbelstube.jpg', 'Kindergarten Krabbelstube', 1600, 900),
	(12, '/images/bildung-wegweiser.jpg', 'Wegweiser', 576, 768),
	(13, '/images/Magnettafel.jpg', 'Magnettafel', 432, 768),
	(14, '/images/magnete.jpg', 'Magnete', 432, 768),
	(15, '/images/pokale.jpg', 'Pokale', 1024, 577),
	(16, '/images/garderobe.jpg', 'Wandbeschriftungen', 2560, 1180),
	(17, '/images/toiletten.jpg', 'Toilettenbeschilderung', 1024, 768),
	(18, '/images/Schaukasten.jpg', 'Schaukasten', 2560, 1440),
	(19, '/images/bürgermeisterschildchen.jpg', 'Türschilder', 400, 320),
	(20, '/images/österreichkarte.jpg', 'Österreichkarte', 1600, 900),
	(21, '/images/firmen-green-finance.jpg', 'Green Finance', 2048, 1536),
	(22, '/images/bodenbeschriftung-augen-hno.jpg', 'Bodenbeschriftung Augen HNO', 2560, 1920),
	(23, '/images/Cella-Apotheke-scaled.jpg', 'Cella Apotheke', 2560, 1440),
	(24, '/images/MC3-kleiner-pylon.jpg', 'Pylon MC3', 1536, 2048),
	(25, '/images/berufs-feuerwehr-linz.jpg', 'Berufs Feuerwehr Linz', 576, 768),
	(26, '/images/lionfit.jpg', 'Lionfit', 1920, 2560),
	(27, '/images/gesundheit-physio.jpg', 'Wandbeschriftung Physiotherapie', 2560, 1920),
	(28, '/images/lageplan-mc3.png', 'Lageplan MC3', 1434, 979),
	(29, '/images/Linz_Med_Uni_Campus_III-4967.jpg', 'Linz Med Uni Campus 3', 6048, 4024),
	(30, '/images/stiegenhaus-EG.jpg', 'Stiegenhaus EG', 1440, 2560),
	(31, '/images/hotel-rezeption-frühstück.jpg', 'Hotel Rezeption Frühstück', 1024, 768),
	(32, '/images/Verkehrszeichen-Holz.jpg', 'Verkehrszeichen Holz', 605, 907),
	(33, '/images/verkehrsspiegel.jpg', 'Verkehrsspiegel', 1024, 768),
	(34, '/images/verkehrsspiegel-2.jpg', 'Verkehrsspiegel', 576, 768),
	(35, '/images/einfahrt-verboten-schild.jpg', 'Einfahrt Verboten Schild', 576, 768),
	(36, '/images/schild-eingang-kapelle.jpg', '', 576, 768),
	(37, '/images/stempel-printy.png', 'Stempel Printy', 236, 240),
	(38, '/images/stempel-griff-stativ.png', 'Stempel Griff Stativ', 127, 152),
	(39, '/images/stempel-trodat-datum.png', 'Stempel Trodat Datum', 137, 135),
	(40, '/images/stempelbeispiel-printy-stempel.jpg', 'Stempelbeispiel Printy Stempel', 724, 1024),
	(41, '/images/stempelbeispiel-griff-stempel.jpg', 'Stempelbeispiel Griff Stempel', 724, 1024),
	(42, '/images/stempelbeispiel-trodat-datum-stempel.jpg', 'Stempelbeispiel Trodat Datum Stempel', 724, 1024),
	(43, '/images/stempelbeispiel-trodat-stativ-stempel.jpg', 'Stempelbeispiel Trodat Stativ Stempel', 724, 1024),
	(44, '/images/Klapprahmen.jpg', 'Klapprahmen', 1440, 2560);

-- Dumping structure for table intertypcms.link
DROP TABLE IF EXISTS `link`;
CREATE TABLE IF NOT EXISTS `link` (
  `link_id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(45) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`link_id`),
  UNIQUE KEY `slug_UNIQUE` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;

-- Dumping data for table intertypcms.link: ~13 rows (approximately)
DELETE FROM `link`;
INSERT INTO `link` (`link_id`, `slug`, `name`) VALUES
	(1, '/projekte/architekten', 'Architekten'),
	(3, '/projekte/baufirmen', 'Baufirmen'),
	(4, '/projekte/bildung', 'Bildung'),
	(5, '/projekte/firmen', 'Firmen'),
	(6, '/projekte/gesundheit', 'Gesundheitsbereich'),
	(7, '/projekte/%C3%B6ffentliche-geb%C3%A4ude', 'Öffentliche Gebäude'),
	(8, '/projekte/hotels', 'Hotels & Wellness'),
	(10, '/produkte/schilder', 'Schilder'),
	(11, '/produkte/buchstaben', 'Buchstaben'),
	(12, '/produkte/folien', 'Folien'),
	(13, '/produkte/stempel', 'Stempel'),
	(14, '/produkte/aussenbeschilderung', 'Außenbeschilderung'),
	(15, '/produkte/sonstiges', 'Sonstiges');

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

-- Dumping data for table intertypcms.product: ~6 rows (approximately)
DELETE FROM `product`;
INSERT INTO `product` (`product_id`, `title`, `description`, `link_id`, `cover_image_id`, `gallery_id`) VALUES
	(1, 'Schilder', 'Von Firmenschildern bis zu Informations- und Hinweisschildern – wir bieten maßgeschneiderte Lösungen für Innen- und Außenbereiche.', 10, 32, 11),
	(2, 'Buchstaben', 'Ob einzelne Buchstaben oder komplette Schriftzüge – wir fertigen hochwertige Buchstaben und Einzelbuchstaben aus verschiedenen Materialien für eine prägnante Beschriftung auf jeder Oberfläche.', 11, 23, 12),
	(3, 'Folien', 'Vielseitig einsetzbar und individuell gestaltbar – unsere Folien bieten Schutz, Sichtschutz oder dekorative Gestaltung für unterschiedlichste Anwendungen.', 12, 7, 13),
	(4, 'Stempel', 'Individuelle Stempel für Büro, Unternehmen oder den privaten Gebrauch – präzise, langlebig und in verschiedenen Ausführungen erhältlich.', 13, 37, 14),
	(5, 'Außenbeschilderung', 'Präsentieren Sie Ihr Unternehmen sichtbar und wirkungsvoll – mit Leuchtwerbung, Pylonen und großflächigen Außenbeschriftungen. In der heutigen schnelllebigen Welt ist der erste Eindruck entscheidend. Um sich von der Konkurrenz abzuheben und die Aufmerksamkeit potenzieller Kunden zu gewinnen, braucht Ihr Unternehmen eine Präsenz, die nicht zu übersehen ist. Genau hier kommen moderne Werbelösungen ins Spiel, die Ihre Marke ins rechte Licht rücken und eine nachhaltige Wirkung erzielen.', 14, 5, 15),
	(6, 'Sonstiges', 'Ob Magnettafeln, Klapprahmen, Schaukästen oder Verkehrsspiegel – hier finden Sie praktische und funktionale Produkte für verschiedenste Einsatzzwecke.', 15, 15, 16);

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

-- Dumping data for table intertypcms.project: ~7 rows (approximately)
DELETE FROM `project`;
INSERT INTO `project` (`project_id`, `title`, `description`, `link_id`, `cover_image_id`, `gallery_id`, `project_date`) VALUES
	(1, 'Architekten', 'Wir sind Ihr Partner für präzise und hochwertige Beschriftungs-, Beschilderungs- und Folienlösungen in Architekturprojekten. Von klaren Leitsystemen bis zur stilvollen Außenbeschriftung – wir setzen Konzepte professionell um und unterstützen Architekten bei der perfekten Umsetzung ihrer Planungen. Entdecken Sie unsere realisierten Projekte!', 1, 1, 2, NULL),
	(3, 'Baufirmen', 'Unsere langjährige Erfahrung im Bereich Folierung und Objektbeschriftung macht uns zum verlässlichen Partner für Baufirmen. Wir haben zahlreiche Projekte erfolgreich begleitet – von Baustellenbeschilderungen über Objektbeschriftungen bis hin zu hochwertigen Fenster- und Fassadenfolierungen.', 3, 5, 4, NULL),
	(4, 'Bildungseinrichtungen', 'Moderne Beschriftungen und langlebige Folierungen tragen zur Struktur und Gestaltung von Schulen bei. Wir haben zahlreiche Bildungseinrichtungen mit Türschildern, Fassadenbeschriftungen und dekorativen Folien ausgestattet. Unsere Lösungen sind funktional, hochwertig und individuell angepasst.', 4, 11, 5, NULL),
	(5, 'Firmen', 'Jedes Unternehmen braucht eine starke Außenwirkung. Wir haben zahlreiche Firmen mit individuellen Lösungen unterstützt. Ob Schilder, Fassadenbeschriftungen oder Glasfolierungen – wir unterstützen Unternehmen dabei, ihre Räumlichkeiten professionell zu gestalten. Mit hochwertigen Materialien und präziser Umsetzung sorgen wir für eine klare, professionelle Gestaltung.', 5, 20, 6, NULL),
	(6, 'Gesundheitsbereich', 'Klare Orientierung und ansprechende Gestaltung spielen im Gesundheitsbereich eine zentrale Rolle. Mit hochwertigen Beschriftungen, Leitsystemen und Glasfolierungen haben wir Arztpraxen, Kliniken und Ordinationen ausgestattet. Ob Informationsschilder, Türbeschriftungen oder Sichtschutzfolien – unsere Lösungen sind funktional, langlebig und individuell angepasst.', 6, 27, 7, NULL),
	(7, 'Öffentliche Gebäude', 'Öffentliche Gebäude und Einrichtungen benötigen durchdachte Beschilderungen für eine klare Orientierung. Wir haben Gemeinden mit individuell gestalteten Beschilderungen, Infotafeln und Fassadenbeschriftungen ausgestattet. Ob Rathäuser, Gemeindezentren oder andere kommunale Einrichtungen – unsere langlebigen Lösungen verbinden Funktionalität mit ansprechendem Design.', 7, 1, 8, NULL),
	(8, 'Hotels & Wellness', 'Ein stimmiges Design und eine klare Beschriftung tragen maßgeblich zur Atmosphäre eines Hotels oder einer Wellnesseinrichtung bei. Ob dezente Wegweiser, stilvolle Außenbeschriftungen, hochwertige Folierungen – wir haben bereits zahlreiche Hotels und Thermen mit durchdachten Lösungen ausgestattet. Lassen Sie sich von unseren Projekten inspirieren und entdecken Sie, wie Beschriftung und Design perfekt zusammenspielen, um Ihren Gästen ein unvergessliches Erlebnis zu bieten!', 8, 4, 9, NULL);

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
