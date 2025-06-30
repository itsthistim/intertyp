import db from "@/lib/db.js";

export async function GET() {
	let products = [];

	try {
		const [productRows] = await db.query(`SELECT * FROM product`);

		products = await Promise.all(
			productRows.map(async (productRow) => {
				let product = {
					title: productRow.title,
					description: productRow.description
				};

				const [linkRows] = await db.query(`SELECT slug, name "alt" FROM link WHERE link_id = ?`, [productRow.link_id]);
				product.link = linkRows[0];

				const [coverImageRows] = await db.query(`SELECT url, alt, width, height FROM image WHERE image_id = ?`, [productRow.cover_image_id]);
				if (coverImageRows.length > 0) {
					product.cover_image = coverImageRows[0];
				} else {
					// Use placeholder image when no cover image is set
					product.cover_image = {
						url: "/images/placeholder.jpg",
						alt: "Placeholder image",
						width: 800,
						height: 600
					};
				}

				const [galleryRows] = await db.query(`SELECT * FROM gallery WHERE gallery_id = ?`, [productRow.gallery_id]);

				if (galleryRows.length > 0) {
					product.gallery = {};
					product.gallery.title = galleryRows[0].title;
					product.gallery.images = [];

					const [galleryImages] = await db.query(`SELECT * FROM gallery_image WHERE gallery_id = ?`, [productRow.gallery_id]);

					if (galleryImages.length > 0) {
						product.gallery.images = await Promise.all(
							galleryImages.map(async (galleryImage) => {
								const [imageRows] = await db.query(`SELECT url, alt, width, height FROM image WHERE image_id = ?`, [galleryImage.image_id]);
								return imageRows[0];
							})
						);
					}
				} else {
					product.gallery = null;
				}

				return product;
			})
		);

		return new Response(JSON.stringify(products), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("Error fetching products:", err);
		return new Response(JSON.stringify({ error: "Database " + err }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
}
