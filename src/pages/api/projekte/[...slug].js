import db from "@/lib/db.js";
import sizeOf from "image-size";
import path from "node:path";
import fs from "node:fs";
import { Buffer } from "node:buffer";

// #region Auth Helpers

function requireBasicAuth(request) {
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
	if (!coverUrl) {
		// Use placeholder image when no cover image is set
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

	// Create the gallery first
	const [newGalleryResult] = await db.query(`INSERT INTO gallery (title) VALUES (?)`, [gallery.title]);

	if (newGalleryResult.insertId) {
		const [newGalleryRows] = await db.query(`SELECT * FROM gallery WHERE gallery_id = ?`, [newGalleryResult.insertId]);

		if (newGalleryRows.length > 0) {
			const newGallery = newGalleryRows[0];

			// Process images and handle potential duplicates
			for (const img of gallery.images) {
				try {
					let image = await findOrCreateImage(img);
					// Check if this gallery-image combination already exists
					const [existingRelation] = await db.query(`SELECT 1 FROM gallery_image WHERE gallery_id = ? AND image_id = ?`, [newGallery.gallery_id, image.image_id]);

					// Only insert if the relation doesn't exist
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

function validatePutRequest(body) {
	const { cover_image } = body;

	if (cover_image && !cover_image.url) {
		return {
			isValid: false,
			error: "Cover image URL is required when setting a cover image."
		};
	}

	return { isValid: true };
}

async function updateProjectLinks(link, slug, existingLinkId) {
	if (!link) return existingLinkId;

	const updatedLink = await findOrCreateLink(link, slug);
	return updatedLink.link_id;
}

async function updateProjectCoverImage(cover_image, existingCoverImageId) {
	if (!cover_image) return existingCoverImageId;

	const updatedCoverImage = await findOrCreateImage(cover_image);
	return updatedCoverImage?.image_id || null;
}

async function updateProjectGallery(gallery, existingGalleryId) {
	if (!gallery) return { galleryId: existingGalleryId, oldGalleryToCleanup: null };

	const updatedGallery = await findOrCreateGallery(gallery);
	const newGalleryId = updatedGallery?.gallery_id || null;

	// Return old gallery for cleanup if it changed
	const oldGalleryToCleanup = existingGalleryId && existingGalleryId !== newGalleryId ? existingGalleryId : null;

	return { galleryId: newGalleryId, oldGalleryToCleanup };
}

function buildUpdateQuery(fields) {
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

async function cleanupOldGallery(oldGalleryId) {
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

async function formatProjectResponse(projectData) {
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
			project_date: projectRow.date,
			link: {
				slug: projectRow.link_slug,
				name: projectRow.link_name
			},
			cover_image: await getCoverImage(projectRow.cover_url, projectRow.cover_alt),
			gallery: await getGallery(projectRow.gallery_id)
		};

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
	// Check for Basic Auth
	const authCheck = requireBasicAuth(request);
	if (!authCheck.isValid) {
		return authCheck.response;
	}

	const slug = new URL(request.url).pathname.replace("/api", "");

	const body = await request.json();
	const { title, description, project_date, link, cover_image, gallery } = body;

	// check required fields
	if (!title) {
		return new Response(
			JSON.stringify({
				error: "Missing required fields: title and link.slug are required."
			}),
			{
				status: 400,
				headers: { "Content-Type": "application/json" }
			}
		);
	}

	if (cover_image && !cover_image.url) {
		return new Response(
			JSON.stringify({
				error: "Cover image URL is required when setting a cover image."
			}),
			{
				status: 400,
				headers: { "Content-Type": "application/json" }
			}
		);
	}

	try {
		// check wheter the project already exists
		const [existingProject] = await db.query(`SELECT * FROM project_v WHERE link_slug = ?`, [slug]);

		if (existingProject.length > 0) {
			return new Response(
				JSON.stringify({
					error: "Project already exists. Update it using a PUT request."
				}),
				{
					status: 409,
					headers: { "Content-Type": "application/json" }
				}
			);
		}

		// create new project
		let newLink = await findOrCreateLink(link, slug);
		let newCoverImage = await findOrCreateImage(cover_image);
		let newGallery = await findOrCreateGallery(gallery);

		const [newProject] = await db.query(`INSERT INTO project (title, description, project_date, cover_image_id, link_id, gallery_id) VALUES (?, ?, ?, ?, ?, ?)`, [
			title,
			description || null,
			project_date || null,
			newCoverImage?.image_id || null,
			newLink.link_id,
			newGallery?.gallery_id || null
		]);

		// return the created project
		if (newProject.insertId) {
			const [createdProjectRows] = await db.query(`SELECT * FROM project_v WHERE id = ?`, [newProject.insertId]);
			if (createdProjectRows.length > 0) {
				const createdProject = createdProjectRows[0];
				return new Response(
					JSON.stringify({
						title: createdProject.title,
						description: createdProject.description,
						project_date: createdProject.date,
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
	// Check for Basic Auth
	const authCheck = requireBasicAuth(request);
	if (!authCheck.isValid) {
		return authCheck.response;
	}

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

		// Validate request
		const validation = validatePutRequest(body);
		if (!validation.isValid) {
			return new Response(JSON.stringify({ error: validation.error }), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}

		const existingProjectData = existingProject[0];

		// Update related entities
		const linkId = await updateProjectLinks(link, slug, existingProjectData.link_id);
		const coverImageId = await updateProjectCoverImage(cover_image, existingProjectData.cover_id);
		const { galleryId, oldGalleryToCleanup } = await updateProjectGallery(gallery, existingProjectData.gallery_id);

		// Build and execute update query
		const updateData = { ...body, linkId, coverImageId, galleryId };
		const { updateFields, updateValues } = buildUpdateQuery(updateData);

		if (updateFields.length > 0) {
			updateValues.push(existingProjectData.id);
			await db.query(`UPDATE project SET ${updateFields.join(", ")} WHERE project_id = ?`, updateValues);
		}

		// Clean up old gallery if it was replaced
		await cleanupOldGallery(oldGalleryToCleanup);

		// Return the updated project
		const [updatedProjectRows] = await db.query(`SELECT * FROM project_v WHERE id = ?`, [existingProjectData.id]);
		if (updatedProjectRows.length > 0) {
			const updatedProject = updatedProjectRows[0];
			const responseData = await formatProjectResponse(updatedProject);

			return new Response(JSON.stringify(responseData), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
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
	// Check for Basic Auth
	const authCheck = requireBasicAuth(request);
	if (!authCheck.isValid) {
		return authCheck.response;
	}

	const slug = new URL(request.url).pathname.replace("/api", "");

	if (!slug) {
		return new Response(JSON.stringify({ error: "Missing project slug" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}

	try {
		// Check if project exists and get its data before deletion
		const [projectRows] = await db.query(`SELECT * FROM project_v WHERE link_slug = ? LIMIT 1`, [slug]);

		if (!projectRows.length) {
			return new Response(JSON.stringify({ error: "Project not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" }
			});
		}

		const projectRow = projectRows[0];

		// Build the project response with all data before deletion
		const project = await formatProjectResponse(projectRow);

		// Store IDs for cleanup
		const projectId = projectRow.id;
		const galleryId = projectRow.gallery_id;
		const coverImageId = projectRow.cover_id;
		const linkId = projectRow.link_id;

		// Delete the project first
		await db.query(`DELETE FROM project WHERE project_id = ?`, [projectId]);

		// Clean up gallery if it exists and is not used elsewhere
		if (galleryId) {
			try {
				const [galleryRefs] = await db.query(
					`
					SELECT COUNT(*) as count FROM (
						SELECT gallery_id FROM product WHERE gallery_id = ?
						UNION ALL
						SELECT gallery_id FROM project WHERE gallery_id = ?
					) refs
				`,
					[galleryId, galleryId]
				);

				if (galleryRefs[0].count === 0) {
					// Safe to delete - no references exist
					await db.query(`DELETE FROM gallery_image WHERE gallery_id = ?`, [galleryId]);
					await db.query(`DELETE FROM gallery WHERE gallery_id = ?`, [galleryId]);
				}
			} catch (cleanupError) {
				// Log the error but don't fail the entire request
				console.warn(`Warning: Could not clean up gallery ${galleryId}: ${cleanupError.message}`);
			}
		}

		// Clean up cover image if it exists and is not used elsewhere
		if (coverImageId) {
			try {
				const [imageRefs] = await db.query(
					`
					SELECT COUNT(*) as count FROM (
						SELECT cover_image_id as image_id FROM product WHERE cover_image_id = ?
						UNION ALL
						SELECT cover_image_id as image_id FROM project WHERE cover_image_id = ?
						UNION ALL
						SELECT image_id FROM gallery_image WHERE image_id = ?
					) refs
				`,
					[coverImageId, coverImageId, coverImageId]
				);

				if (imageRefs[0].count === 0) {
					// Safe to delete - no references exist
					await db.query(`DELETE FROM image WHERE image_id = ?`, [coverImageId]);
				}
			} catch (cleanupError) {
				// Log the error but don't fail the entire request
				console.warn(`Warning: Could not clean up cover image ${coverImageId}: ${cleanupError.message}`);
			}
		}

		// Clean up link if it exists and is not used elsewhere
		if (linkId) {
			try {
				const [linkRefs] = await db.query(
					`
					SELECT COUNT(*) as count FROM (
						SELECT link_id FROM product WHERE link_id = ?
						UNION ALL
						SELECT link_id FROM project WHERE link_id = ?
					) refs
				`,
					[linkId, linkId]
				);

				if (linkRefs[0].count === 0) {
					// Safe to delete - no references exist
					await db.query(`DELETE FROM link WHERE link_id = ?`, [linkId]);
				}
			} catch (cleanupError) {
				// Log the error but don't fail the entire request
				console.warn(`Warning: Could not clean up link ${linkId}: ${cleanupError.message}`);
			}
		}

		return new Response(JSON.stringify(project), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("Error deleting project:", err);
		return new Response(JSON.stringify({ error: "Database " + err }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
}
