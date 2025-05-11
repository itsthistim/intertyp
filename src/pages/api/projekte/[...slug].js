import db from "@/lib/db.js";

export async function GET({ request, params }) {
	const path = new URL(request.url).pathname.replace("/api", "");

	try {
		const [rows] = await db.query(
			`SELECT p.project_id, p.title "project_title", p.description "project_description", p.project_date, i.url "cover_url", i.alt "cover_alt", l.slug "link_slug", l.name "link_name", g.title "gallery_title"
                                     FROM project p
                                     JOIN link l ON l.link_id = p.link_id
                                     LEFT JOIN image i ON i.image_id = p.cover_image_id
                                     LEFT JOIN gallery g ON g.gallery_id = p.gallery_id
																		 WHERE l.slug = ?
																		 LIMIT 1`,
			[path]
		);

		if (rows.length === 0) {
			return new Response(JSON.stringify({ error: "No project found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" }
			});
		}

		return new Response(JSON.stringify(rows), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: "Database " + err }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
}

/**
 * POST /api/projekte/<slug>
 * Creates a new project in the database if it doesn't exist yet.
 * Following fields are required:
 * {string} title - The title of the project
 * {string} description - The description of the project
 * {date} project_date - The date of the project (Optional)
 * {string} cover_image_url - The URL of the cover image
 * {string} gallery_id - The ID of the gallery that belongs to the project
 * {[string]} gallery.images - The URLs of the images that belong to the project
 *
 * If the url to the cover image already exists in the database, it will be used as the cover image for the project.
 * If no cover image is provided, the project will be created without a cover image.
 *
 * If the gallery_id is provided and the gallery exists, the project will be created with the specified gallery. Any images in gallery.images will be added to the gallery if their URLs do not already exist in the database.
 * If the gallery_id is provided, but the gallery does not exist yet, a new gallery will be created with all the images in gallery.images.
 * If the gallery_id is not provided, the project will be created without a gallery and gallery.images will be ignored.
 */
export async function POST({ request, params }) {
	const path = new URL(request.url).pathname.replace("/api", "");

	const body = await request.json();
	const { title, description, project_date, cover_image, gallery } = body;

	console.log("Request body: ", body);

	if (!title || !description) {
		return new Response(JSON.stringify({ error: "Missing required fields" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}

	try {
		console.log("Check if project already exists with path: ", path);
		const [existingProject] = await db.query(
			`SELECT p.project_id, p.title "project_title", p.description "project_description", p.project_date, i.url "cover_url", i.alt "cover_alt", l.slug "link_slug", l.name "link_name", g.title "gallery_title"
			   FROM project p
			   JOIN link l ON l.link_id = p.link_id
			   LEFT JOIN image i ON i.image_id = p.cover_image_id
			   LEFT JOIN gallery g ON g.gallery_id = p.gallery_id
			  WHERE l.slug = ?
			  LIMIT 1`,
			[path]
		);

		if (existingProject.length > 0) {
			return new Response(JSON.stringify({ error: "Project already exists. Update it using a PUT request." }), {
				status: 409,
				headers: { "Content-Type": "application/json" }
			});
		}

		console.log("Project does not exist. Creating new project.");
		console.log("Check if link already exists with path: ", path);
		let [link] = await db.query(`SELECT link_id FROM link WHERE slug = ?`, [path]);

		if (link.length === 0) {
			console.log("Link does not exist. Creating new link.");
			const [newLink] = await db.query(`INSERT INTO link (slug, name) VALUES (?, ?)`, [path, title]);

			if (newLink.insertId) {
				console.log("New link created: ", newLink.insertId);
				[link] = await db.query(`SELECT * FROM link WHERE link_id = ?`, [newLink.insertId]);
				if (link.length > 0) {
					link = link[0];
					console.log("Using newly created link: ", link);
				} else {
					return new Response(JSON.stringify({ error: "Failed to create link" }), {
						status: 500,
						headers: { "Content-Type": "application/json" }
					});
				}
			} else {
				return new Response(JSON.stringify({ error: "Failed to create link" }), {
					status: 500,
					headers: { "Content-Type": "application/json" }
				});
			}
		} else {
			console.log("Link already exists. Using existing link ID: ", link[0].link_id);
		}

		const linkId = link.link_id;

		let coverImageId;
		if (cover_image) {
			console.log("Check if cover image already exists! ", cover_image);
			const [image] = await db.query(`SELECT image_id FROM image WHERE url = ?`, [cover_image.url]);
			if (image.length > 0) {
				console.log("Cover image already exists. Using existing image ID: ", image[0].image_id);
				coverImageId = image[0].image_id;
			} else {
				console.log("Cover image does not exist. Creating new cover image.");
				const [newCoverImage] = await db.query(`INSERT INTO image (url, alt) VALUES (?, ?)`, [cover_image.url, cover_image.alt]);

				let newCoverImageId = newCoverImage.insertId;

				if (newCoverImageId) {
					const [newCoverImage] = await db.query(`SELECT * FROM image WHERE image_id = ?`, [newCoverImageId]);
					console.log("Using newly created cover image: ", newCoverImage[0]);
					coverImageId = newCoverImage[0].image_id;
				}
			}
		}

		let galleryId;
		if (gallery) {
			console.log("Check if gallery already exists with id: ", gallery.gallery_id);
			const [dbGallery] = await db.query(`SELECT gallery_id FROM gallery WHERE gallery_id = ?`, [gallery.gallery_id]);
			if (dbGallery.length > 0) {
				console.log("Gallery already exists. Using existing gallery ID: ", dbGallery[0].gallery_id);
				galleryId = dbGallery[0].gallery_id;
			}

			if (!galleryId) {
				console.log("Gallery does not exist. Creating new gallery.");
				const [createGallery] = await db.query(`INSERT INTO gallery (title) VALUES (?)`, [title]);
				const newGalleryId = createGallery.insertId;

				if (newGalleryId) {
					const [newGallery] = await db.query(`SELECT * FROM gallery WHERE gallery_id = ?`, [newGalleryId]);
					console.log("Using newly created gallery: ", newGallery[0]);
					galleryId = newGallery[0].gallery_id;
				} else {
					return new Response(JSON.stringify({ error: "Failed to create gallery" }), {
						status: 500,
						headers: { "Content-Type": "application/json" }
					});
				}
			}

			if (gallery.images.length > 0) {
				console.log("Adding images to gallery: ", galleryId);
				for (const cImage of gallery.images) {
					console.log("Check if image already exists with url: ", cImage.url);
					const [image] = await db.query(`SELECT image_id FROM image WHERE url = ?`, [cImage.url]);
					if (image.length === 0) {
						console.log("Image does not exist. Creating new image.", cImage);
						const [createImage] = await db.query(`INSERT INTO image (url, alt) VALUES (?, ?)`, [cImage.url, cImage.alt]);
						const newImageId = createImage.insertId;
						if (newImageId) {
							const [newImage] = await db.query(`SELECT * FROM image WHERE image_id = ?`, [newImageId]);
							console.log("Using newly created image: ", newImage[0]);
							await db.query(`INSERT INTO gallery_image (gallery_id, image_id) VALUES (?, ?)`, [galleryId, newImage[0].image_id]);
						}
					} else {
						console.log("Image already exists. Using existing image ID: ", image[0].image_id);
						await db.query(`INSERT INTO gallery_image (gallery_id, image_id) VALUES (?, ?)`, [galleryId, image[0].image_id]);
					}
				}
			}
		}

		console.log(`Creating new project with cover image <${coverImageId}>, link <${linkId}> and gallery <${galleryId}>`);
		const [newProject] = await db.query(`INSERT INTO project (title, description, project_date, cover_image_id, link_id, gallery_id) VALUES (?, ?, ?, ?, ?, ?) RETURNING project_id`, [
			title,
			description,
			project_date,
			coverImageId,
			linkId,
			galleryId
		]);

		if (newProject.length > 0) {
			return new Response(JSON.stringify(newProject), {
				status: 201,
				headers: { "Content-Type": "application/json" }
			});
		} else {
			return new Response(JSON.stringify({ error: "Failed to create project" }), {
				status: 500,
				headers: { "Content-Type": "application/json" }
			});
		}
	} catch (err) {
		console.error("Error creating project: ", err);
		return new Response(JSON.stringify({ error: "Database " + err }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
}
