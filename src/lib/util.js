import db from "@/lib/db.js";
import sizeOf from "image-size";
import path from "node:path";
import fs from "node:fs";
import { Buffer } from "node:buffer";

// #region Auth Helpers

export function requireBasicAuth(request) {
	const authHeader = request.headers.get("authorization");

	if (!authHeader || !authHeader.startsWith("Basic ")) {
		return {
			isValid: false,
			response: new Response(
				JSON.stringify({
					error: "Unauthorized: Missing or invalid authentication header"
				}),
				{
					status: 401,
					headers: {
						"Content-Type": "application/json",
						"WWW-Authenticate": 'Basic realm="API"'
					}
				}
			)
		};
	}

	try {
		const base64Credentials = authHeader.split(" ")[1];
		const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
		const [username, password] = credentials.split(":");

		if (username === import.meta.env.API_USER && password === import.meta.env.API_PASSWORD) {
			return { isValid: true };
		}

		return {
			isValid: false,
			response: new Response(JSON.stringify({ error: "Unauthorized: Invalid credentials" }), {
				status: 401,
				headers: {
					"Content-Type": "application/json",
					"WWW-Authenticate": 'Basic realm="API"'
				}
			})
		};
	} catch (error) {
		return {
			isValid: false,
			response: new Response(
				JSON.stringify({
					error: "Unauthorized: Invalid authentication format"
				}),
				{
					status: 401,
					headers: {
						"Content-Type": "application/json",
						"WWW-Authenticate": 'Basic realm="API"'
					}
				}
			)
		};
	}
}

// #endregion

// #region GET Helpers

export async function getImageDimensions(image) {
	if (image.width && image.height) {
		if (image.width !== 0 && image.height !== 0) {
			return image;
		}
	}

	try {
		let dimensions;
		image.url = image.url.replace(/\\\\/g, "/");

		if (image.url.startsWith("/")) {
			const imagePath = path.join(process.cwd(), "public", image.url);
			if (fs.existsSync(imagePath)) {
				const fileBuffer = fs.readFileSync(imagePath);
				dimensions = sizeOf(fileBuffer);
			} else {
				console.warn(`Local image for dimension check not found: ${imagePath} (URL: ${image.url})`);
			}
		} else if (image.url.startsWith("http")) {
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

export async function getGallery(galleryId) {
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

export async function getCoverImage(coverUrl, coverAlt) {
	if (!coverUrl) {
		return {
			url: "/images/placeholder.jpg",
			alt: "Placeholder image",
			width: 800,
			height: 600
		};
	}
	let coverImage = {
		url: coverUrl,
		alt: coverAlt
	};
	coverImage = await getImageDimensions(coverImage);
	return coverImage;
}

export async function findOrCreateLink(link, slug) {
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

export async function findOrCreateImage(image) {
	if (!image || !image?.url) return null;

	let [imageRows] = await db.query(`SELECT * FROM image WHERE url = ?`, [image.url]);
	if (imageRows.length > 0) {
		const existingImage = imageRows[0];
		// Update alt text if provided and different from existing
		if (image.alt && image.alt !== existingImage.alt) {
			try {
				await db.query(`UPDATE image SET alt = ? WHERE url = ?`, [image.alt, image.url]);
				existingImage.alt = image.alt;
			} catch (dbError) {
				console.error(`Error updating image alt text in database for ${image.url}:`, dbError.message);
			}
		}
		return existingImage;
	}

	const [newImageResult] = await db.query(`INSERT INTO image (url, alt) VALUES (?, ?)`, [image.url, image.alt || ""]);
	if (newImageResult.insertId) {
		const [newImageRows] = await db.query(`SELECT * FROM image WHERE image_id = ?`, [newImageResult.insertId]);
		if (newImageRows.length > 0) {
			return newImageRows[0];
		}
	}
	throw new Error("Failed to create or find image");
}

export async function findOrCreateGallery(gallery) {
	if (!gallery) return null;

	if (!Array.isArray(gallery.images) || gallery.images.length === 0) {
		return null;
	}

	const [newGalleryResult] = await db.query(`INSERT INTO gallery (title) VALUES (?)`, [gallery.title]);

	if (newGalleryResult.insertId) {
		const [newGalleryRows] = await db.query(`SELECT * FROM gallery WHERE gallery_id = ?`, [newGalleryResult.insertId]);

		if (newGalleryRows.length > 0) {
			const newGallery = newGalleryRows[0];

			for (const img of gallery.images) {
				try {
					let image = await findOrCreateImage(img);
					const [existingRelation] = await db.query(`SELECT 1 FROM gallery_image WHERE gallery_id = ? AND image_id = ?`, [newGallery.gallery_id, image.image_id]);
					if (existingRelation.length === 0) {
						await db.query(`INSERT INTO gallery_image (gallery_id, image_id) VALUES (?, ?)`, [newGallery.gallery_id, image.image_id]);
					}
				} catch (error) {
					console.warn(`Warning: Could not process image for gallery ${newGallery.gallery_id}:`, error.message);
				}
			}

			return newGallery;
		}
	}
}

// #endregion

// #region PUT Helpers

export function validatePutRequest(body) {
	const { cover_image } = body;

	if (cover_image && !cover_image.url) {
		return {
			isValid: false,
			error: "Cover image URL is required when setting a cover image."
		};
	}

	return { isValid: true };
}

export async function updateProjectLinks(link, slug, existingLinkId) {
	if (!link) return existingLinkId;

	const updatedLink = await findOrCreateLink(link, slug);
	return updatedLink.link_id;
}

export async function updateProjectCoverImage(cover_image, existingCoverImageId) {
	if (!cover_image) return existingCoverImageId;

	const updatedCoverImage = await findOrCreateImage(cover_image);
	return updatedCoverImage?.image_id || null;
}

export async function updateProjectGallery(gallery, existingGalleryId) {
	if (!gallery) return { galleryId: existingGalleryId, oldGalleryToCleanup: null };

	const updatedGallery = await findOrCreateGallery(gallery);
	const newGalleryId = updatedGallery?.gallery_id || null;

	// Return old gallery for cleanup if it changed
	const oldGalleryToCleanup = existingGalleryId && existingGalleryId !== newGalleryId ? existingGalleryId : null;

	return { galleryId: newGalleryId, oldGalleryToCleanup };
}

export function buildUpdateQuery(fields) {
	const { title, description, project_date, link, cover_image, gallery } = fields;
	let updateFields = [];
	let updateValues = [];

	if (title !== undefined) {
		updateFields.push("title = ?");
		updateValues.push(title);
	}
	if (description !== undefined) {
		updateFields.push("description = ?");
		updateValues.push(description);
	}
	if (project_date !== undefined) {
		updateFields.push("project_date = ?");
		updateValues.push(project_date);
	}
	if (link !== undefined) {
		updateFields.push("link_id = ?");
		updateValues.push(fields.linkId);
	}
	if (cover_image !== undefined) {
		updateFields.push("cover_image_id = ?");
		updateValues.push(fields.coverImageId);
	}
	if (gallery !== undefined) {
		updateFields.push("gallery_id = ?");
		updateValues.push(fields.galleryId);
	}

	return { updateFields, updateValues };
}

export async function cleanupOldGallery(oldGalleryId) {
	if (!oldGalleryId) return;

	try {
		// Check if the old gallery is still referenced by any products or projects
		const [galleryRefs] = await db.query(
			`
			SELECT COUNT(*) as count FROM (
				SELECT gallery_id FROM product WHERE gallery_id = ?
				UNION ALL
				SELECT gallery_id FROM project WHERE gallery_id = ?
			) refs
		`,
			[oldGalleryId, oldGalleryId]
		);

		if (galleryRefs[0].count === 0) {
			// Safe to delete - no references exist
			await db.query(`DELETE FROM gallery_image WHERE gallery_id = ?`, [oldGalleryId]);
			await db.query(`DELETE FROM gallery WHERE gallery_id = ?`, [oldGalleryId]);
		}
	} catch (cleanupError) {
		// Log the error but don't fail the entire request
		console.warn(`Warning: Could not clean up old gallery ${oldGalleryId}:`, cleanupError.message);
	}
}

// #endregion

export async function formatProjectResponse(projectData) {
	return {
		title: projectData.title,
		description: projectData.description,
		project_date: projectData.date,
		link: {
			slug: projectData.link_slug,
			name: projectData.link_name
		},
		cover_image: await getCoverImage(projectData.cover_url, projectData.cover_alt),
		gallery: await getGallery(projectData.gallery_id)
	};
}

// #region Security Helpers
export function sanitizeInput(str) {
	if (!str) return "";
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
// #endregion
