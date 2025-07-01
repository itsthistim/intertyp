import db from "@/lib/db.js";
import {
	requireBasicAuth,
	getGallery,
	getCoverImage,
	findOrCreateLink,
	findOrCreateImage,
	findOrCreateGallery,
	formatProjectResponse,
	validatePutRequest,
	updateProjectLinks,
	updateProjectCoverImage,
	updateProjectGallery,
	buildUpdateQuery,
	cleanupOldGallery
} from "@/lib/util.js";

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
