import db from "@/lib/db.js";
import sizeOf from "image-size";
import path from "node:path";
import fs from "node:fs";
import { Buffer } from "node:buffer";

// #region GET Helpers

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

async function getCoverImage(coverUrl, coverAlt) {
	if (!coverUrl) return null;
	let coverImage = {
		url: coverUrl,
		alt: coverAlt
	};
	coverImage = await getImageDimensions(coverImage);
	return coverImage;
}

async function findOrCreateLink(link, slug) {
	let [linkRows] = await db.query(`SELECT * FROM link WHERE slug = ?`, [slug]);
	if (linkRows.length > 0) {
		return linkRows[0];
	}

	const [newLinkResult] = await db.query(`INSERT INTO link (slug, name) VALUES (?, ?)`, [slug, link?.name || null]);
	if (newLinkResult.insertId) {
		const [newLinkRows] = await db.query(`SELECT * FROM link WHERE link_id = ?`, [newLinkResult.insertId]);
		if (newLinkRows.length > 0) {
			return newLinkRows[0];
		}
	}
	throw new Error("Failed to create or find link");
}

// #endregion

// #region POST Helpers

async function findOrCreateImage(image) {
	if (!image || !image?.url) return null;

	let [imageRows] = await db.query(`SELECT * FROM image WHERE url = ?`, [image.url]);
	if (imageRows.length > 0) {
		return imageRows[0];
	}

	const [newImageResult] = await db.query(`INSERT INTO image (url, alt) VALUES (?, ?)`, [image.url, image.alt]);
	if (newImageResult.insertId) {
		const [newImageRows] = await db.query(`SELECT * FROM image WHERE image_id = ?`, [newImageResult.insertId]);
		if (newImageRows.length > 0) {
			return newImageRows[0];
		}
	}
	throw new Error("Failed to create or find image");
}

async function findOrCreateGallery(gallery) {
	if (!gallery) return null;

	if (!Array.isArray(gallery.images) || gallery.images.length === 0) {
		return null;
	}

	const [newGalleryResult] = await db.query(`INSERT INTO gallery (title) VALUES (?)`, [gallery.title]);

	if (newGalleryResult.insertId) {
		const [newGalleryRows] = await db.query(`SELECT * FROM gallery WHERE gallery_id = ?`, [newGalleryResult.insertId]);

		if (newGalleryRows.length > 0) {
			const newGallery = newGalleryRows[0];

			await Promise.all(
				gallery.images.map(async (img) => {
					let image = await findOrCreateImage(img);
					await db.query(`INSERT INTO gallery_image (gallery_id, image_id) VALUES (?, ?)`, [newGallery.gallery_id, image.image_id]);
				})
			);

			return newGallery;
		}
	}
}

// #endregion

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
	const { title, description, project_date, link, cover_image, gallery } = body;

	// check required fields
	if (!title) {
		return new Response(JSON.stringify({ error: "Missing required fields: title and link.slug are required." }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}

	if (cover_image && !cover_image.url) {
		return new Response(JSON.stringify({ error: "Cover image URL is required when setting a cover image." }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}

	try {
		// check wheter the project already exists
		const [existingProject] = await db.query(`SELECT * FROM project_v WHERE link_slug = ?`, [slug]);

		if (existingProject.length > 0) {
			return new Response(JSON.stringify({ error: "Project already exists. Update it using a PUT request." }), {
				status: 409,
				headers: { "Content-Type": "application/json" }
			});
		}

		// create new project
		let newLink = await findOrCreateLink(link, slug);
		let newCoverImage = await findOrCreateImage(cover_image);
		let newGallery = await findOrCreateGallery(gallery);

		const [newProject] = await db.query(`INSERT INTO project (title, description, project_date, cover_image_id, link_id, gallery_id) VALUES (?, ?, ?, ?, ?, ?) RETURNING project_id`, [
			title,
			description || null,
			project_date || null,
			newCoverImage?.image_id || null,
			newLink.link_id,
			newGallery?.gallery_id || null
		]);

		// return the created project
		if (newProject[0].project_id) {
			const [createdProjectRows] = await db.query(`SELECT * FROM project_v WHERE id = ?`, [newProject[0].project_id]);
			if (createdProjectRows.length > 0) {
				const createdProject = createdProjectRows[0];
				return new Response(
					JSON.stringify({
						title: createdProject.title,
						description: createdProject.description,
						project_date: createdProject.project_date,
						link: {
							slug: createdProject.link_slug,
							name: createdProject.link_name
						},
						cover_image: await getCoverImage(createdProject.cover_url, createdProject.cover_alt),
						gallery: await getGallery(createdProject.gallery_id)
					}),
					{
						status: 201,
						headers: { "Content-Type": "application/json" }
					}
				);
			}
		} else {
			return new Response(JSON.stringify({ error: "Failed to create project." }), {
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

export async function PUT({ request, params }) {
	return new Response(JSON.stringify({ error: "Not yet implemented" }), {
		status: 501,
		headers: { "Content-Type": "application/json" }
	});
}

export async function DELETE({ request, params }) {
	return new Response(JSON.stringify({ error: "Not yet implemented" }), {
		status: 501,
		headers: { "Content-Type": "application/json" }
	});
}
