-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema intertypcms
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `intertypcms` ;

-- -----------------------------------------------------
-- Schema intertypcms
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `intertypcms` DEFAULT CHARACTER SET utf8 ;
USE `intertypcms` ;

-- -----------------------------------------------------
-- Table `intertypcms`.`image`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `intertypcms`.`image` ;

CREATE TABLE IF NOT EXISTS `intertypcms`.`image` (
  `image_id` INT NOT NULL AUTO_INCREMENT,
  `url` TEXT NOT NULL,
  `alt` VARCHAR(45) NULL,
  `width` INT NULL,
  `height` INT NULL,
  PRIMARY KEY (`image_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `intertypcms`.`link`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `intertypcms`.`link` ;

CREATE TABLE IF NOT EXISTS `intertypcms`.`link` (
  `link_id` INT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(45) NOT NULL,
  `name` VARCHAR(45) NULL,
  PRIMARY KEY (`link_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `intertypcms`.`gallery`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `intertypcms`.`gallery` ;

CREATE TABLE IF NOT EXISTS `intertypcms`.`gallery` (
  `gallery_id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(45) NULL,
  PRIMARY KEY (`gallery_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `intertypcms`.`project`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `intertypcms`.`project` ;

CREATE TABLE IF NOT EXISTS `intertypcms`.`project` (
  `project_id` INT NOT NULL AUTO_INCREMENT,
  `title` TEXT NOT NULL,
  `description` TEXT NULL,
  `project_date` DATETIME NULL,
  `link_id` INT NOT NULL,
  `cover_image_id` INT NULL,
  `gallery_id` INT NULL,
  PRIMARY KEY (`project_id`, `link_id`),
  INDEX `fk_component_image_idx` (`cover_image_id` ASC) VISIBLE,
  INDEX `fk_component_link1_idx` (`link_id` ASC) VISIBLE,
  INDEX `fk_component_gallery1_idx` (`gallery_id` ASC) VISIBLE,
  UNIQUE INDEX `link_UNIQUE` (`link_id` ASC) VISIBLE,
  CONSTRAINT `fk_component_image`
    FOREIGN KEY (`cover_image_id`)
    REFERENCES `intertypcms`.`image` (`image_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_component_link1`
    FOREIGN KEY (`link_id`)
    REFERENCES `intertypcms`.`link` (`link_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_component_gallery1`
    FOREIGN KEY (`gallery_id`)
    REFERENCES `intertypcms`.`gallery` (`gallery_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `intertypcms`.`gallery_image`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `intertypcms`.`gallery_image` ;

CREATE TABLE IF NOT EXISTS `intertypcms`.`gallery_image` (
  `gallery_id` INT NOT NULL,
  `image_id` INT NOT NULL,
  PRIMARY KEY (`gallery_id`, `image_id`),
  INDEX `fk_gallery_image_image1_idx` (`image_id` ASC) VISIBLE,
  INDEX `fk_gallery_image_gallery1_idx` (`gallery_id` ASC) VISIBLE,
  CONSTRAINT `fk_gallery_image_gallery1`
    FOREIGN KEY (`gallery_id`)
    REFERENCES `intertypcms`.`gallery` (`gallery_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_gallery_image_image1`
    FOREIGN KEY (`image_id`)
    REFERENCES `intertypcms`.`image` (`image_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `intertypcms`.`product`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `intertypcms`.`product` ;

CREATE TABLE IF NOT EXISTS `intertypcms`.`product` (
  `product_id` INT NOT NULL AUTO_INCREMENT,
  `name` TEXT NOT NULL,
  `description` TEXT NULL,
  `link_id` INT NOT NULL,
  `cover_image_id` INT NULL,
  `gallery_id` INT NULL,
  PRIMARY KEY (`product_id`, `link_id`),
  INDEX `fk_product_image1_idx` (`cover_image_id` ASC) VISIBLE,
  INDEX `fk_product_link1_idx` (`link_id` ASC) VISIBLE,
  INDEX `fk_product_gallery1_idx` (`gallery_id` ASC) VISIBLE,
  CONSTRAINT `fk_product_image1`
    FOREIGN KEY (`cover_image_id`)
    REFERENCES `intertypcms`.`image` (`image_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_product_link1`
    FOREIGN KEY (`link_id`)
    REFERENCES `intertypcms`.`link` (`link_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_product_gallery1`
    FOREIGN KEY (`gallery_id`)
    REFERENCES `intertypcms`.`gallery` (`gallery_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `intertypcms` ;

-- -----------------------------------------------------
-- Placeholder table for view `intertypcms`.`project_v`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `intertypcms`.`project_v` (`"id"` INT, `title` INT, `description` INT, `"date"` INT, `"cover_url"` INT, `"cover_alt"` INT, `"link"` INT, `"link_name"` INT, `"gallery_id"` INT, `"gallery_title"` INT);

-- -----------------------------------------------------
-- Placeholder table for view `intertypcms`.`product_v`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `intertypcms`.`product_v` (`"id"` INT, `name` INT, `description` INT, `"cover_url"` INT, `"cover_alt"` INT, `"link"` INT, `"link_name"` INT, `"gallery_id"` INT, `"gallery_title"` INT);

-- -----------------------------------------------------
-- View `intertypcms`.`project_v`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `intertypcms`.`project_v`;
DROP VIEW IF EXISTS `intertypcms`.`project_v` ;
USE `intertypcms`;
CREATE OR REPLACE VIEW project_v AS
SELECT p.project_id "id", p.title, p.description, p.project_date "date", i.url "cover_url", i.alt "cover_alt", l.slug "link", l.name "link_name", g.gallery_id "gallery_id", g.title "gallery_title"
FROM project p
JOIN link l ON l.link_id = p.link_id
LEFT JOIN image i ON i.image_id = p.cover_image_id
LEFT JOIN gallery g ON g.gallery_id = p.gallery_id;

-- -----------------------------------------------------
-- View `intertypcms`.`product_v`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `intertypcms`.`product_v`;
DROP VIEW IF EXISTS `intertypcms`.`product_v` ;
USE `intertypcms`;
CREATE OR REPLACE VIEW product_v as
select p.product_id "id", p.name, p.description, i.url "cover_url", i.alt "cover_alt", l.slug "link", l.name "link_name", g.gallery_id "gallery_id", g.title "gallery_title"
 from product p
 JOIN link l ON l.link_id = p.link_id
LEFT JOIN image i ON i.image_id = p.cover_image_id
LEFT JOIN gallery g ON g.gallery_id = p.gallery_id;

-- -----------------------------------------------------
-- Data for table `intertypcms`.`image`
-- -----------------------------------------------------
START TRANSACTION;
USE `intertypcms`;
INSERT INTO `intertypcms`.`image` (`image_id`, `url`, `alt`, `width`, `height`) VALUES (DEFAULT, 'https://www.intertyp.at/wp-content/uploads/2025/02/DSC03520.jpg', NULL, NULL, NULL);
INSERT INTO `intertypcms`.`image` (`image_id`, `url`, `alt`, `width`, `height`) VALUES (DEFAULT, 'https://www.intertyp.at/wp-content/uploads/2025/02/RIMG0102-scaled-e1740124491589.jpg', NULL, NULL, NULL);
INSERT INTO `intertypcms`.`image` (`image_id`, `url`, `alt`, `width`, `height`) VALUES (DEFAULT, 'https://www.intertyp.at/wp-content/uploads/2025/02/Kindergarten-Krabbelstube.jpg', NULL, NULL, NULL);
INSERT INTO `intertypcms`.`image` (`image_id`, `url`, `alt`, `width`, `height`) VALUES (DEFAULT, 'https://www.intertyp.at/wp-content/uploads/2025/02/IMGP2794-scaled.jpg', NULL, NULL, NULL);

COMMIT;


-- -----------------------------------------------------
-- Data for table `intertypcms`.`link`
-- -----------------------------------------------------
START TRANSACTION;
USE `intertypcms`;
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/projekte/architekten', 'Architekten & Bau');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/projekte/baufirmen', 'Baufirmen');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/projekte/feuerwehr', 'Feuerwehr');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/projekte/gemeinden', 'Gemeinden und öffentliche Gebäude');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/projekte/genossenschaften', 'Genossenschaften');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/projekte/gesundheit', 'Gesundheitsbereich');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/projekte/bildung', 'Bildung');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/projekte/wellness', 'Hotels & Wellness');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/projekte/firmen', 'Firmen');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/produkte/aussenbeschriftung', 'Außenbeschriftung');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/produkte/buchstaben', 'Buchstaben');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/produkte/digidruck', 'Digi Druck');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/produkte/folien', 'Folien');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/produkte/objektbeschriftung', 'Objektbeschriftung');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/produkte/pokale', 'Pokale');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/produkte/schilder', 'Schilder');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/produkte/sonstiges', 'Sonstiges');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/produkte/stempel', 'Stempel');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/produkte/taktile', 'Taktile');
INSERT INTO `intertypcms`.`link` (`link_id`, `slug`, `name`) VALUES (DEFAULT, '/produkte/verkehr', 'Verkehr');

COMMIT;


-- -----------------------------------------------------
-- Data for table `intertypcms`.`gallery`
-- -----------------------------------------------------
START TRANSACTION;
USE `intertypcms`;
INSERT INTO `intertypcms`.`gallery` (`gallery_id`, `title`) VALUES (1, NULL);

COMMIT;


-- -----------------------------------------------------
-- Data for table `intertypcms`.`project`
-- -----------------------------------------------------
START TRANSACTION;
USE `intertypcms`;
INSERT INTO `intertypcms`.`project` (`project_id`, `title`, `description`, `project_date`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Architekten', 'Wir sind Ihr Partner für präzise und hochwertige Beschriftungs-, Beschilderungs- und Folienlösungen in Architekturprojekten. Von klaren Leitsystemen bis zur stilvollen Außenbeschriftung – wir setzen Konzepte professionell um und unterstützen Architekten bei der perfekten Umsetzung ihrer Planungen. Entdecken Sie unsere realisierten Projekte!', NULL, 1, 1, 1);
INSERT INTO `intertypcms`.`project` (`project_id`, `title`, `description`, `project_date`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Baufirmen', 'Unsere langjährige Erfahrung im Bereich Folierung und Objektbeschriftung macht uns zum verlässlichen Partner für Baufirmen. Wir haben zahlreiche Projekte erfolgreich begleitet – von Baustellenbeschilderungen über Objektbeschriftungen bis hin zu hochwertigen Fenster- und Fassadenfolierungen.', NULL, 2, 1, 1);
INSERT INTO `intertypcms`.`project` (`project_id`, `title`, `description`, `project_date`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Feuerwehr', 'Feuerwachen benötigen eine klare Kennzeichnung – sowohl im Außenbereich als auch in den Innenräumen. Wir haben verschiedene Projekte mit Fassadenbeschriftungen, Tür- und Raumkennzeichnungen sowie großflächigen Logos umgesetzt. Unsere langlebigen und robusten Lösungen sorgen für eine professionelle Gestaltung.', NULL, 3, 1, 1);
INSERT INTO `intertypcms`.`project` (`project_id`, `title`, `description`, `project_date`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Gemeinden und öffentliche Gebäude', 'Öffentliche Gebäude und Einrichtungen benötigen durchdachte Beschilderungen für eine klare Orientierung. Wir haben Gemeinden mit individuell gestalteten Beschilderungen, Infotafeln und Fassadenbeschriftungen ausgestattet. Ob Rathäuser, Gemeindezentren oder andere kommunale Einrichtungen – unsere langlebigen Lösungen verbinden Funktionalität mit ansprechendem Design.', NULL, 4, 1, 1);
INSERT INTO `intertypcms`.`project` (`project_id`, `title`, `description`, `project_date`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Genossenschaften', 'Unsere langjährige Erfahrung in der Beschriftung und Folierung von Wohnbauprojekten macht uns zum verlässlichen Partner für Genossenschaften. Wir haben zahlreiche Projekte erfolgreich umgesetzt – von Gebäude- und Wohnanlagenbeschriftungen bis hin zu hochwertigen Glas- und Fassadenfolierungen.', NULL, 5, 1, 1);
INSERT INTO `intertypcms`.`project` (`project_id`, `title`, `description`, `project_date`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Gesundheitsbereich', 'Klare Orientierung und ansprechende Gestaltung spielen im Gesundheitsbereich eine zentrale Rolle. Mit hochwertigen Beschriftungen, Leitsystemen und Glasfolierungen haben wir Arztpraxen, Kliniken und Ordinationen ausgestattet. Ob Informationsschilder, Türbeschriftungen oder Sichtschutzfolien – unsere Lösungen sind funktional, langlebig und individuell angepasst.', NULL, 6, 1, 1);
INSERT INTO `intertypcms`.`project` (`project_id`, `title`, `description`, `project_date`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Bildung', 'Moderne Beschriftungen und langlebige Folierungen tragen zur Struktur und Gestaltung von Schulen bei. Wir haben zahlreiche Bildungseinrichtungen mit Türschildern, Fassadenbeschriftungen und dekorativen Folien ausgestattet. Unsere Lösungen sind funktional, hochwertig und individuell angepasst.', NULL, 7, 1, 1);
INSERT INTO `intertypcms`.`project` (`project_id`, `title`, `description`, `project_date`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Wellness & Hotels', 'Ein stimmiges Design und eine klare Beschriftung tragen maßgeblich zur Atmosphäre eines Hotels oder einer Wellnesseinrichtung bei. Ob dezente Wegweiser, stilvolle Außenbeschriftungen, hochwertige Folierungen – wir haben bereits zahlreiche Hotels und Thermen mit durchdachten Lösungen ausgestattet. Lassen Sie sich von unseren Projekten inspirieren und entdecken Sie, wie Beschriftung und Design perfekt zusammenspielen, um Ihren Gästen ein unvergessliches Erlebnis zu bieten!', NULL, 8, 1, 1);
INSERT INTO `intertypcms`.`project` (`project_id`, `title`, `description`, `project_date`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Firmen', 'Jedes Unternehmen braucht eine starke Außenwirkung. Wir haben zahlreiche Firmen mit individuellen Lösungen unterstützt. Ob Schilder, Fassadenbeschriftungen oder Glasfolierungen – wir unterstützen Unternehmen dabei, ihre Räumlichkeiten professionell zu gestalten. Mit hochwertigen Materialien und präziser Umsetzung sorgen wir für eine klare, professionelle Gestaltung.', NULL, 9, 1, 1);

COMMIT;


-- -----------------------------------------------------
-- Data for table `intertypcms`.`gallery_image`
-- -----------------------------------------------------
START TRANSACTION;
USE `intertypcms`;
INSERT INTO `intertypcms`.`gallery_image` (`gallery_id`, `image_id`) VALUES (1, 1);
INSERT INTO `intertypcms`.`gallery_image` (`gallery_id`, `image_id`) VALUES (1, 2);
INSERT INTO `intertypcms`.`gallery_image` (`gallery_id`, `image_id`) VALUES (1, 3);
INSERT INTO `intertypcms`.`gallery_image` (`gallery_id`, `image_id`) VALUES (1, 4);

COMMIT;


-- -----------------------------------------------------
-- Data for table `intertypcms`.`product`
-- -----------------------------------------------------
START TRANSACTION;
USE `intertypcms`;
INSERT INTO `intertypcms`.`product` (`product_id`, `name`, `description`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Außenbeschilderung', 'Präsentieren Sie Ihr Unternehmen sichtbar und wirkungsvoll – mit Leuchtwerbung, Pylone und großflächigen Außenbeschriftungen.', 10, 2, 2);
INSERT INTO `intertypcms`.`product` (`product_id`, `name`, `description`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Buchstaben', 'Ob einzelne Buchstaben oder komplette Schriftzüge – wir fertigen hochwertige Buchstaben und Einzelbuchstaben aus verschiedenen Materialien für eine prägnante Beschriftung auf jeder Oberfläche.', 11, 2, 2);
INSERT INTO `intertypcms`.`product` (`product_id`, `name`, `description`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Digi Druck', 'Hochwertige Drucklösungen für verschiedenste Anwendungen – von Schildern bis zu individuellen Aufklebern.', 12, 2, 2);
INSERT INTO `intertypcms`.`product` (`product_id`, `name`, `description`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Folien', 'Vielseitig einsetzbar und individuell gestaltbar – unsere Folien bieten Schutz, Sichtschutz oder dekorative Gestaltung für unterschiedlichste Anwendungen.', 13, 2, 2);
INSERT INTO `intertypcms`.`product` (`product_id`, `name`, `description`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Objektbeschriftung', 'Ob Gebäude, Räume oder Türen – mit professioneller Objektbeschriftung sorgen wir für eine klare und ansprechende Kennzeichnung.', 14, 2, 2);
INSERT INTO `intertypcms`.`product` (`product_id`, `name`, `description`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Pokale', 'Auszeichnung mit Stil – unsere hochwertigen Pokale und Trophäen sind individuell gestaltbar und perfekt für Ehrungen und Wettbewerbe. Finden Sie das passende Modell!', 15, 2, 2);
INSERT INTO `intertypcms`.`product` (`product_id`, `name`, `description`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Schilder', 'Von Firmenschildern bis zu Informations- und Hinweisschildern – wir bieten maßgeschneiderte Lösungen für Innen- und Außenbereiche.', 16, 2, 2);
INSERT INTO `intertypcms`.`product` (`product_id`, `name`, `description`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Sonstiges', 'Ob Magnettafeln, Klapprahmen, Schaukästen oder Verkehrsspiegel – hier finden Sie praktische und funktionale Produkte für verschiedenste Einsatzzwecke.', 17, 2, 2);
INSERT INTO `intertypcms`.`product` (`product_id`, `name`, `description`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Stempel', 'Individuelle Stempel für Büro, Unternehmen oder den privaten Gebrauch – präzise, langlebig und in verschiedenen Ausführungen erhältlich.', 18, 2, 2);
INSERT INTO `intertypcms`.`product` (`product_id`, `name`, `description`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Taktile', 'Barrierefreie Orientierung mit tastbaren Schildern und taktilen Beschriftungen – ideal für öffentliche Einrichtungen, Unternehmen und Wohnanlagen.', 19, 2, 2);
INSERT INTO `intertypcms`.`product` (`product_id`, `name`, `description`, `link_id`, `cover_image_id`, `gallery_id`) VALUES (DEFAULT, 'Verkehr', 'Von Verkehrsschildern bis zu Spiegeln – wir bieten eine große Auswahl an Produkten für sichere und gut sichtbare Verkehrskennzeichnungen.', 20, 2, 2);

COMMIT;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
