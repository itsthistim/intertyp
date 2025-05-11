use intertypcms;

delete from project where project_id > 6;
delete from link where link_id > 6;
delete from gallery_image;
delete from gallery;
delete from image where image_id > 4;


ALTER TABLE gallery_image AUTO_INCREMENT = 0;
ALTER TABLE gallery AUTO_INCREMENT = 0;
ALTER TABLE image AUTO_INCREMENT = 0;
ALTER TABLE link AUTO_INCREMENT = 0;
ALTER TABLE project AUTO_INCREMENT = 0;