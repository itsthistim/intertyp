import db from "@/lib/db.js";
import { requireBasicAuth, getGallery, getCoverImage, findOrCreateLink, findOrCreateImage, findOrCreateGallery } from "@/lib/util.js";

export async function GET({ request, params }) {
	const slug = new URL(request.url).pathname.replace("/api", "");

	if (!slug) {
		return new Response(JSON.stringify({ error: "Missing product slug" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}

	try {
		const [productRows] = await db.query(`SELECT * FROM product_v WHERE link_slug = ? LIMIT 1`, [slug]);

		if (!productRows.length) {
			return new Response(JSON.stringify({ error: "Product not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" }
			});
		}

		const productRow = productRows[0];

		let product = {
			title: productRow.title,
			description: productRow.description,
			link: {
				slug: productRow.link_slug,
				name: productRow.link_name
			}
		};

		product.cover_image = await getCoverImage(productRow.cover_url, productRow.cover_alt);
		product.gallery = await getGallery(productRow.gallery_id);

		return new Response(JSON.stringify(product), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("Error fetching product:", err);
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
	const { title, description, link, cover_image, gallery } = body;

	// check required fields
	if (!title) {
		return new Response(JSON.stringify({ error: "Missing required fields: title is required." }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
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

	// Basic Auth validation
	const auth = requireBasicAuth(request);
	if (!auth.isValid) {
		return auth.response;
	}

	try {
		// check whether the product already exists
		const [existingProduct] = await db.query(`SELECT * FROM product_v WHERE link_slug = ?`, [slug]);

		if (existingProduct.length > 0) {
			return new Response(
				JSON.stringify({
					error: "Product already exists. Update it using a PUT request."
				}),
				{
					status: 409,
					headers: { "Content-Type": "application/json" }
				}
			);
		}

		// create new product
		let newLink = await findOrCreateLink(link, slug);
		let newCoverImage = await findOrCreateImage(cover_image);
		let newGallery = await findOrCreateGallery(gallery);

		const [newProduct] = await db.query(`INSERT INTO product (title, description, cover_image_id, link_id, gallery_id) VALUES (?, ?, ?, ?, ?) RETURNING product_id`, [
			title,
			description || null,
			newCoverImage?.image_id || null,
			newLink.link_id,
			newGallery?.gallery_id || null
		]);

		// return the created product
		if (newProduct[0].product_id) {
			const [createdProductRows] = await db.query(`SELECT * FROM product_v WHERE id = ?`, [newProduct[0].product_id]);
			if (createdProductRows.length > 0) {
				const createdProduct = createdProductRows[0];
				return new Response(
					JSON.stringify({
						title: createdProduct.title,
						description: createdProduct.description,
						link: {
							slug: createdProduct.link_slug,
							name: createdProduct.link_name
						},
						cover_image: await getCoverImage(createdProduct.cover_url, createdProduct.cover_alt),
						gallery: await getGallery(createdProduct.gallery_id)
					}),
					{
						status: 201,
						headers: { "Content-Type": "application/json" }
					}
				);
			}
		} else {
			return new Response(JSON.stringify({ error: "Failed to create product." }), {
				status: 500,
				headers: { "Content-Type": "application/json" }
			});
		}
	} catch (err) {
		console.error("Error creating product: ", err);
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
		return new Response(JSON.stringify({ error: "Missing product slug" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}

	// Basic Auth validation
	const auth = requireBasicAuth(request);
	if (!auth.isValid) {
		return auth.response;
	}

	try {
		// Check if product exists
		const [existingProduct] = await db.query(`SELECT * FROM product_v WHERE link_slug = ?`, [slug]);

		if (existingProduct.length === 0) {
			return new Response(JSON.stringify({ error: "Product not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" }
			});
		}

		const body = await request.json();
		const { title, description, link, cover_image, gallery } = body;

		// Validate cover_image if provided
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

		const existingProductData = existingProduct[0];
		let linkId = existingProductData.link_id;
		let coverImageId = existingProductData.cover_id;
		let galleryId = existingProductData.gallery_id;

		if (link) {
			let updatedLink = await findOrCreateLink(link, slug);
			linkId = updatedLink.link_id;
		}

		if (cover_image) {
			let updatedCoverImage = await findOrCreateImage(cover_image);
			coverImageId = updatedCoverImage?.image_id || null;
		}

		if (gallery) {
			const oldGalleryId = galleryId;

			let updatedGallery = await findOrCreateGallery(gallery);
			galleryId = updatedGallery?.gallery_id || null;

			if (oldGalleryId && oldGalleryId !== galleryId) {
				// store the old gallery ID for later cleanup
				var oldGalleryToCleanup = oldGalleryId;
			}
		}

		// only update provided fields
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
		// only update if there are fields to update
		if (updateFields.length > 0) {
			updateValues.push(existingProductData.id);
			await db.query(`UPDATE product SET ${updateFields.join(", ")} WHERE product_id = ?`, updateValues);
		}

		// clean up old gallery if it was replaced and not used elsewhere
		if (typeof oldGalleryToCleanup !== "undefined") {
			try {
				// check if the old gallery is still referenced by any products or projects
				const [galleryRefs] = await db.query(
					`
					SELECT COUNT(*) as count FROM (
						SELECT gallery_id FROM product WHERE gallery_id = ?
						UNION ALL
						SELECT gallery_id FROM project WHERE gallery_id = ?
					) refs
				`,
					[oldGalleryToCleanup, oldGalleryToCleanup]
				);

				if (galleryRefs[0].count === 0) {
					// Safe to delete - no references exist
					await db.query(`DELETE FROM gallery_image WHERE gallery_id = ?`, [oldGalleryToCleanup]);
					await db.query(`DELETE FROM gallery WHERE gallery_id = ?`, [oldGalleryToCleanup]);
				}
			} catch (cleanupError) {
				// Log the error but don't fail the entire request
				console.warn(`Warning: Could not clean up old gallery ${oldGalleryToCleanup}: ${cleanupError.message}`);
			}
		}

		const [updatedProductRows] = await db.query(`SELECT * FROM product_v WHERE id = ?`, [existingProductData.id]);
		if (updatedProductRows.length > 0) {
			const updatedProduct = updatedProductRows[0];
			return new Response(
				JSON.stringify({
					title: updatedProduct.title,
					description: updatedProduct.description,
					link: {
						slug: updatedProduct.link_slug,
						name: updatedProduct.link_name
					},
					cover_image: await getCoverImage(updatedProduct.cover_url, updatedProduct.cover_alt),
					gallery: await getGallery(updatedProduct.gallery_id)
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" }
				}
			);
		} else {
			return new Response(JSON.stringify({ error: "Failed to retrieve updated product." }), {
				status: 500,
				headers: { "Content-Type": "application/json" }
			});
		}
	} catch (err) {
		console.error("Error updating product:", err);
		return new Response(JSON.stringify({ error: "Database " + err }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
}

export async function DELETE({ request, params }) {
	const slug = new URL(request.url).pathname.replace("/api", "");

	if (!slug) {
		return new Response(JSON.stringify({ error: "Missing product slug" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}

	// Basic Auth validation
	const auth = requireBasicAuth(request);
	if (!auth.isValid) {
		return auth.response;
	}

	try {
		// Check if product exists and get its data before deletion
		const [productRows] = await db.query(`SELECT * FROM product_v WHERE link_slug = ? LIMIT 1`, [slug]);

		if (!productRows.length) {
			return new Response(JSON.stringify({ error: "Product not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" }
			});
		}

		const productRow = productRows[0];

		// Build the product response with all data before deletion
		let product = {
			title: productRow.title,
			description: productRow.description,
			link: {
				slug: productRow.link_slug,
				name: productRow.link_name
			}
		};

		product.cover_image = await getCoverImage(productRow.cover_url, productRow.cover_alt);
		product.gallery = await getGallery(productRow.gallery_id);

		// Store IDs for cleanup
		const productId = productRow.id;
		const galleryId = productRow.gallery_id;
		const coverImageId = productRow.cover_id;
		const linkId = productRow.link_id;

		// Delete the product first
		await db.query(`DELETE FROM product WHERE product_id = ?`, [productId]);

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

		return new Response(JSON.stringify(product), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("Error deleting product:", err);
		return new Response(JSON.stringify({ error: "Database " + err }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
}
