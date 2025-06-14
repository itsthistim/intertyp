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
	const slug = new URL(request.url).pathname.replace("/api", "");

	if (!slug) {
		return new Response(JSON.stringify({ error: "Missing project slug" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}

	try {
		// Check if project exists
		const [existingProject] = await db.query(`SELECT * FROM project_v WHERE link_slug = ?`, [slug]);

		if (existingProject.length === 0) {
			return new Response(JSON.stringify({ error: "Project not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" }
			});
		}

		const body = await request.json();
		const { title, description, project_date, link, cover_image, gallery } = body;

		// Validate cover_image if provided
		if (cover_image && !cover_image.url) {
			return new Response(JSON.stringify({ error: "Cover image URL is required when setting a cover image." }), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}

		const existingProjectData = existingProject[0];
		let linkId = existingProjectData.link_id;
		let coverImageId = existingProjectData.cover_id;
		let galleryId = existingProjectData.gallery_id;

		// Update link if provided
		if (link) {
			let updatedLink = await findOrCreateLink(link, slug);
			linkId = updatedLink.link_id;
		}

		// Update cover image if provided
		if (cover_image) {
			let updatedCoverImage = await findOrCreateImage(cover_image);
			coverImageId = updatedCoverImage?.image_id || null;
		}
		// Update gallery if provided
		if (gallery) {
			const oldGalleryId = galleryId;

			// Create new gallery first
			let updatedGallery = await findOrCreateGallery(gallery);
			galleryId = updatedGallery?.gallery_id || null;

			// Clean up old gallery after project is updated (if it's not shared)
			if (oldGalleryId && oldGalleryId !== galleryId) {
				// We'll clean this up after the project update to avoid foreign key constraint issues
				// Store the old gallery ID for later cleanup
				var oldGalleryToCleanup = oldGalleryId;
			}
		}

		// Build update query dynamically for only provided fields
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
			updateValues.push(linkId);
		}
		if (cover_image !== undefined) {
			updateFields.push("cover_image_id = ?");
			updateValues.push(coverImageId);
		}
		if (gallery !== undefined) {
			updateFields.push("gallery_id = ?");
			updateValues.push(galleryId);
		}
		// Only update if there are fields to update
		if (updateFields.length > 0) {
			updateValues.push(existingProjectData.id);
			await db.query(`UPDATE project SET ${updateFields.join(", ")} WHERE project_id = ?`, updateValues);
		}

		// Clean up old gallery if it was replaced and not used elsewhere
		if (typeof oldGalleryToCleanup !== 'undefined') {
			try {
				// Check if the old gallery is still referenced by any products or projects
				const [galleryRefs] = await db.query(`
					SELECT COUNT(*) as count FROM (
						SELECT gallery_id FROM product WHERE gallery_id = ?
						UNION ALL
						SELECT gallery_id FROM project WHERE gallery_id = ?
					) refs
				`, [oldGalleryToCleanup, oldGalleryToCleanup]);

				if (galleryRefs[0].count === 0) {
					// Safe to delete - no references exist
					await db.query(`DELETE FROM gallery_image WHERE gallery_id = ?`, [oldGalleryToCleanup]);
					await db.query(`DELETE FROM gallery WHERE gallery_id = ?`, [oldGalleryToCleanup]);
				}
			} catch (cleanupError) {
				// Log the error but don't fail the entire request
				console.warn(`Warning: Could not clean up old gallery ${oldGalleryToCleanup}:`, cleanupError.message);
			}
		}

		// Return the updated project
		const [updatedProjectRows] = await db.query(`SELECT * FROM project_v WHERE id = ?`, [existingProjectData.id]);
		if (updatedProjectRows.length > 0) {
			const updatedProject = updatedProjectRows[0];
			return new Response(
				JSON.stringify({
					title: updatedProject.title,
					description: updatedProject.description,
					project_date: updatedProject.date,
					link: {
						slug: updatedProject.link_slug,
						name: updatedProject.link_name
					},
					cover_image: await getCoverImage(updatedProject.cover_url, updatedProject.cover_alt),
					gallery: await getGallery(updatedProject.gallery_id)
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" }
				}
			);
		} else {
			return new Response(JSON.stringify({ error: "Failed to retrieve updated project." }), {
				status: 500,
				headers: { "Content-Type": "application/json" }
			});
		}
	} catch (err) {
		console.error("Error updating project:", err);
		return new Response(JSON.stringify({ error: "Database " + err }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
}

export async function DELETE({ request, params }) {
	return new Response(JSON.stringify({ error: "Not yet implemented" }), {
		status: 501,
		headers: { "Content-Type": "application/json" }
	});
}
