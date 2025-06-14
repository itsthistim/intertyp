import db from "@/lib/db.js";

export async function GET() {
	let projects = [];

	try {
		const [projectRows] = await db.query(`SELECT * FROM project`);

		projects = await Promise.all(
			projectRows.map(async (projectRow) => {
				let project = {
					title: projectRow.title,
					description: projectRow.description,
					project_date: projectRow.project_date
				};

				const [linkRows] = await db.query(`SELECT slug, name "alt" FROM link WHERE link_id = ?`, [projectRow.link_id]);
				project.link = linkRows[0];

				const [coverImageRows] = await db.query(`SELECT url, alt, width, height FROM image WHERE image_id = ?`, [projectRow.cover_image_id]);
				project.cover_image = coverImageRows[0];

				const [galleryRows] = await db.query(`SELECT * FROM gallery WHERE gallery_id = ?`, [projectRow.gallery_id]);

				if (galleryRows.length > 0) {
					project.gallery = {};
					project.gallery.title = galleryRows[0].title;
					project.gallery.images = [];

					const [galleryImages] = await db.query(`SELECT * FROM gallery_image WHERE gallery_id = ?`, [projectRow.gallery_id]);

					if (galleryImages.length > 0) {
						project.gallery.images = await Promise.all(
							galleryImages.map(async (galleryImage) => {
								const [imageRows] = await db.query(`SELECT url, alt, width, height FROM image WHERE image_id = ?`, [galleryImage.image_id]);
								return imageRows[0];
							})
						);
					}
				} else {
					project.gallery = null;
				}

				return project;
			})
		);

		return new Response(JSON.stringify(projects), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("Error fetching projects:", err);
		return new Response(JSON.stringify({ error: "Database " + err }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
}

export async function POST() {
	return new Response(JSON.stringify({ error: "Missing project slug" }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
}

export async function PUT() {
	return new Response(JSON.stringify({ error: "Missing project slug" }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
}

export async function DELETE() {
	return new Response(JSON.stringify({ error: "Missing project slug" }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
}
