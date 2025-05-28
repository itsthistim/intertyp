import db from "@/lib/db.js";
import sizeOf from "image-size";
import path from "node:path";
import fs from "node:fs";
import { Buffer } from "node:buffer";

export async function GET({ request, params }) {
	const slug = new URL(request.url).pathname.replace("/api", "");

	if (!slug) {
		return new Response(JSON.stringify({ error: "Missing project slug" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}

	try {
		const [projectRows] = await db.query(`SELECT * FROM project p JOIN link l ON p.link_id = l.link_id WHERE l.slug = ? LIMIT 1`, [slug]);
		if (!projectRows.length) {
			return new Response(JSON.stringify({ error: "Project not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" }
			});
		}

		const projectRow = projectRows[0];

		let project = {
			title: projectRow.title,
			description: projectRow.description,
			project_date: projectRow.project_date
		};

		const [linkRows] = await db.query(`SELECT slug, name FROM link WHERE link_id = ?`, [projectRow.link_id]);
		project.link = linkRows[0];

		const [coverImageRows] = await db.query(`SELECT url, alt, width, height FROM image WHERE image_id = ?`, [projectRow.cover_image_id]);
		project.cover_image = coverImageRows[0];

		const [galleryRows] = await db.query(`SELECT * FROM gallery WHERE gallery_id = ?`, [projectRow.gallery_id]);
		if (galleryRows.length > 0) {
			project.gallery = {};
			project.gallery.title = galleryRows[0].title;
			const [galleryImages] = await db.query(`SELECT * FROM gallery_image WHERE gallery_id = ?`, [projectRow.gallery_id]);
			if (galleryImages.length > 0) {
				project.gallery.images = await Promise.all(
					galleryImages.map(async (galleryImage) => {
						const [imageRows] = await db.query(`SELECT url, alt, width, height FROM image WHERE image_id = ?`, [galleryImage.image_id]);
						let image = imageRows[0];

						if (image && image.url && (!image.width || !image.height || image.width === 0 || image.height === 0)) {
							try {
								let dimensions;
								image.url = image.url.replace(/\\/g, "/");

								if (image.url.startsWith("/")) {
									// handle local images
									const imagePath = path.join(process.cwd(), "public", image.url);
									if (fs.existsSync(imagePath)) {
										const fileBuffer = fs.readFileSync(imagePath);
										dimensions = sizeOf(fileBuffer);
									} else {
										console.warn(`Local image for dimension check not found: ${imagePath} (URL: ${image.url})`);
									}
								} else if (image.url.startsWith("http")) {
									// handle remote images
									const response = await fetch(image.url);
									if (response.ok) {
										const arrayBuffer = await response.arrayBuffer();
										const buffer = Buffer.from(arrayBuffer);
										dimensions = sizeOf(buffer);
									} else {
										console.warn(`Failed to fetch remote image for dimension check: ${image.url}, status: ${response.status}`);
									}
								}

								if (dimensions) {
									image.width = dimensions.width;
									image.height = dimensions.height;
								} else if (!image.width || image.width === 0) {
									image.width = 0;
									image.height = 0;
								}
							} catch (e) {
								console.error(`Error getting dimensions for ${image.url}:`, e.message);
								if (image && (image.width === undefined || image.width === null)) image.width = 0;
								if (image && (image.height === undefined || image.height === null)) image.height = 0;
							}
						} else if (image && (!image.width || !image.height)) {
							if (image.width === undefined || image.width === null) image.width = 0;
							if (image.height === undefined || image.height === null) image.height = 0;
						}
						return image;
					})
				);
			} else {
				project.gallery.images = [];
			}
		} else {
			project.gallery = null;
		}

		return new Response(JSON.stringify(project), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("Error fetching project:", err);
		return new Response(JSON.stringify({ error: "Database " + err }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
}

export async function POST({ request, params }) {
	const path = new URL(request.url).pathname.replace("/api", "");

	const body = await request.json();
	const { title, description, project_date, cover_image, gallery } = body;

	if (!title || !description) {
		return new Response(JSON.stringify({ error: "Missing required fields" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}

	try {
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

		let [link] = await db.query(`SELECT link_id FROM link WHERE slug = ?`, [path]);

		if (link.length === 0) {
			const [newLink] = await db.query(`INSERT INTO link (slug, name) VALUES (?, ?)`, [path, title]);

			if (newLink.insertId) {
				[link] = await db.query(`SELECT * FROM link WHERE link_id = ?`, [newLink.insertId]);
				if (link.length > 0) {
					link = link[0];
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
		}

		const linkId = link.link_id;

		let coverImageId;
		if (cover_image) {
			const [image] = await db.query(`SELECT image_id FROM image WHERE url = ?`, [cover_image.url]);
			if (image.length > 0) {
				coverImageId = image[0].image_id;
			} else {
				const [newCoverImage] = await db.query(`INSERT INTO image (url, alt) VALUES (?, ?)`, [cover_image.url, cover_image.alt]);

				let newCoverImageId = newCoverImage.insertId;

				if (newCoverImageId) {
					const [newCoverImage] = await db.query(`SELECT * FROM image WHERE image_id = ?`, [newCoverImageId]);
					coverImageId = newCoverImage[0].image_id;
				}
			}
		}

		let galleryId;
		if (gallery) {
			const [dbGallery] = await db.query(`SELECT gallery_id FROM gallery WHERE gallery_id = ?`, [gallery.gallery_id]);
			if (dbGallery.length > 0) {
				galleryId = dbGallery[0].gallery_id;
			}

			if (!galleryId) {
				const [createGallery] = await db.query(`INSERT INTO gallery (title) VALUES (?)`, [title]);
				const newGalleryId = createGallery.insertId;

				if (newGalleryId) {
					const [newGallery] = await db.query(`SELECT * FROM gallery WHERE gallery_id = ?`, [newGalleryId]);
					galleryId = newGallery[0].gallery_id;
				} else {
					return new Response(JSON.stringify({ error: "Failed to create gallery" }), {
						status: 500,
						headers: { "Content-Type": "application/json" }
					});
				}
			}

			if (gallery.images.length > 0) {
				for (const cImage of gallery.images) {
					const [image] = await db.query(`SELECT image_id FROM image WHERE url = ?`, [cImage.url]);
					if (image.length === 0) {
						const [createImage] = await db.query(`INSERT INTO image (url, alt) VALUES (?, ?)`, [cImage.url, cImage.alt]);
						const newImageId = createImage.insertId;
						if (newImageId) {
							const [newImage] = await db.query(`SELECT * FROM image WHERE image_id = ?`, [newImageId]);
							await db.query(`INSERT INTO gallery_image (gallery_id, image_id) VALUES (?, ?)`, [galleryId, newImage[0].image_id]);
						}
					} else {
						await db.query(`INSERT INTO gallery_image (gallery_id, image_id) VALUES (?, ?)`, [galleryId, image[0].image_id]);
					}
				}
			}
		}

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
