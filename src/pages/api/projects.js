import db from "@/lib/db.js";

export async function GET() {
	try {
		const [rows] = await db.query(`SELECT p.project_id, p.title "project_title", p.description "project_description", p.project_date, i.url "cover_url", i.alt "cover_alt", l.slug "link_slug", l.name "link_name", g.title "gallery_title"
                                     FROM project p
                                     JOIN link l ON l.link_id = p.link_id
                                     LEFT JOIN image i ON i.image_id = p.cover_image_id
                                     LEFT JOIN gallery g ON g.gallery_id = p.gallery_id`);
		return new Response(JSON.stringify(rows), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: "Database " + err }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
}
