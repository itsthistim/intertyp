import db from "@/lib/db.js";
import sizeOf from "image-size";
import path from "node:path";
import fs from "node:fs";
import { Buffer } from "node:buffer";

async function getImageDimensions(image) {
	// check if image is already defined with dimensions
	if (image.width && image.height) {
		if (image.width !== 0 && image.height !== 0) {
			return image;
		}
	}

	try {
		let dimensions;
		image.url = image.url.replace(/\\\\/g, "/"); // normalize backslashes to forward slashes

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

			// save dimensions to the database
			try {
				await db.query(`UPDATE image SET width = ?, height = ? WHERE url = ?`, [image.width, image.height, image.url]);
			} catch (dbError) {
				console.error(`Error updating image dimensions in database for ${image.url}:`, dbError.message);
			}
		} else {
			image.width = image.width || 0;
			image.height = image.height || 0;
		}
	} catch (e) {
		console.error(`Error getting dimensions for ${image.url}:`, e.message);
		image.width = image.width || 0;
		image.height = image.height || 0;
	}

	return image;
}

async function getGallery(galleryId) {
	if (!galleryId) return null;

	const [galleryRows] = await db.query(`SELECT * FROM gallery WHERE gallery_id = ?`, [galleryId]);
	if (galleryRows.length === 0) {
		return null;
	}

	const gallery = {
		title: galleryRows[0].title,
		images: []
	};

	const [galleryImageRows] = await db.query(`SELECT * FROM gallery_image WHERE gallery_id = ?`, [galleryId]);
	if (galleryImageRows.length > 0) {
		gallery.images = await Promise.all(
			galleryImageRows.map(async (galleryImage) => {
				const [imageRows] = await db.query(`SELECT url, alt, width, height FROM image WHERE image_id = ?`, [galleryImage.image_id]);
				let image = imageRows[0];
				return await getImageDimensions(image);
			})
		);
	}

	return gallery;
}

async function findOrCreateLink(path, title) {
	let [linkRows] = await db.query(`SELECT link_id FROM link WHERE slug = ?`, [path]);
	if (linkRows.length > 0) {
		return linkRows[0].link_id;
	}

	const [newLinkResult] = await db.query(`INSERT INTO link (slug, name) VALUES (?, ?)`, [path, title]);
	if (newLinkResult.insertId) {
		const [newLinkRows] = await db.query(`SELECT link_id FROM link WHERE link_id = ?`, [newLinkResult.insertId]);
		if (newLinkRows.length > 0) {
			return newLinkRows[0].link_id;
		}
	}
	throw new Error("Failed to create or find link");
}

async function findOrCreateImage(imageUrl, imageAlt) {
	if (!imageUrl) return null;

	let [imageRows] = await db.query(`SELECT image_id FROM image WHERE url = ?`, [imageUrl]);
	if (imageRows.length > 0) {
		return imageRows[0].image_id;
	}

	const [newImageResult] = await db.query(`INSERT INTO image (url, alt) VALUES (?, ?)`, [imageUrl, imageAlt]);
	if (newImageResult.insertId) {
		const [newImageRows] = await db.query(`SELECT image_id FROM image WHERE image_id = ?`, [newImageResult.insertId]);
		if (newImageRows.length > 0) {
			return newImageRows[0].image_id;
		}
	}
	throw new Error("Failed to create or find image");
}

async function getCoverImage(coverUrl, coverAlt) {
	if (!coverUrl) return null;
	let coverImage = {
		url: coverUrl,
		alt: coverAlt
	};
	coverImage = await getImageDimensions(coverImage);
	return coverImage;
}

export async function GET({ request, params }) {
	const slug = new URL(request.url).pathname.replace("/api", "");

	if (!slug) {
		return new Response(JSON.stringify({ error: "Missing project slug" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}

	try {
		const [projectRows] = await db.query(`SELECT * FROM project_v WHERE link_slug = ? LIMIT 1`, [slug]);

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
			project_date: projectRow.project_date,
			link: {
				slug: projectRow.link_slug,
				name: projectRow.link_name
			}
		};

		project.cover_image = await getCoverImage(projectRow.cover_url, projectRow.cover_alt);
		project.gallery = await getGallery(projectRow.gallery_id);

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
	const slug = new URL(request.url).pathname.replace("/api", "");

	const body = await request.json();
	const { title, description, project_date, cover_image, gallery } = body;

	// check required fields
	if (!title || !link) {
		return new Response(JSON.stringify({ error: "Missing required fields" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}

	try {
		// check wheter the project already exists
		const [existingProject] = await db.query(
			`SELECT p.project_id, p.title "project_title", p.description "project_description", p.project_date, i.url "cover_url", i.alt "cover_alt", l.slug "link_slug", l.name "link_name", g.title "gallery_title"
			   FROM project p
			   JOIN link l ON l.link_id = p.link_id
			   LEFT JOIN image i ON i.image_id = p.cover_image_id
			   LEFT JOIN gallery g ON g.gallery_id = p.gallery_id
			  WHERE l.slug = ?
			  LIMIT 1`,
			[slug]
		);

		if (existingProject.length > 0) {
			return new Response(JSON.stringify({ error: "Project already exists. Update it using a PUT request." }), {
				status: 409,
				headers: { "Content-Type": "application/json" }
			});
		}

		const linkId = await findOrCreateLink(slug, title);

		let coverImageId = null;
		if (cover_image) {
			coverImageId = await findOrCreateImage(cover_image.url, cover_image.alt);
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
