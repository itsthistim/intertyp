delete from project;

delete from link;

delete from gallery_image;

delete from image;

delete from gallery;

--

ALTER TABLE gallery_image AUTO_INCREMENT = 0;
ALTER TABLE gallery AUTO_INCREMENT = 0;
ALTER TABLE image AUTO_INCREMENT = 0;
ALTER TABLE link AUTO_INCREMENT = 0;
ALTER TABLE project AUTO_INCREMENT = 0;

--

insert into image (url, alt)
values ('http://localhost:4321/assets/images/hotels/1.jpg', 'Eurotherme 1');

insert into image (url, alt)
values ('http://localhost:4321/assets/images/hotels/2.jpg', 'Eurotherme 2');

insert into image (url, alt)
values ('http://localhost:4321/assets/images/hotels/3.jpg', 'Eurotherme 3');

insert into image (url, alt)
values ('http://localhost:4321/assets/images/hotels/4.jpg', 'Eurotherme 4');

insert into image (url, alt)
values ('http://localhost:4321/assets/images/gov/1.jpg', 'Gericht 1');

--

insert into gallery (title)
values ('Hotels & Wellness');

insert into gallery (title)
values ('Öffentliche Gebäude');


--

insert into gallery_image
values (1, 1);

insert into gallery_image
values (1, 2);

insert into gallery_image
values (1, 3);

insert into gallery_image
values (1, 4);

insert into gallery_image
values (2, 5);

--


insert into link (name, slug)
values ('Gemeinden & öffentliche Gebäude', '/projekte/gemeinden');

insert into link (name, slug)
values ('Hotels & Wellness', '/projekte/hotels');

--

insert into project (title, description, project_date, cover_image_id, link_id, gallery_id)
values ('Gemeinden und öffentliche Gebäude',
		'Öffentliche Gebäude und Einrichtungen benötigen durchdachte Beschilderungen für eine klare Orientierung. Wir haben Gemeinden mit individuell gestalteten Beschilderungen, Infotafeln und Fassadenbeschriftungen ausgestattet. Ob Rathäuser, Gemeindezentren oder andere kommunale Einrichtungen – unsere langlebigen Lösungen verbinden Funktionalität mit ansprechendem Design.',
		'2019-03-27 00:00:00', 5, 1, 2);

insert into project (title, description, project_date, cover_image_id, link_id, gallery_id)
values ('Hotels und Wellness',
		'Ein stimmiges Design und eine klare Beschriftung tragen maßgeblich zur Atmosphäre eines Hotels oder einer Wellnesseinrichtung bei. Ob dezente Wegweiser, stilvolle Außenbeschriftungen, hochwertige Folierungen – wir haben bereits zahlreiche Hotels und Thermen mit durchdachten Lösungen ausgestattet. Lassen Sie sich von unseren Projekten inspirieren und entdecken Sie, wie Beschriftung und Design perfekt zusammenspielen, um Ihren Gästen ein unvergessliches Erlebnis zu bieten!',
		'2022-07-19 00:00:00', 1, 2, 1);