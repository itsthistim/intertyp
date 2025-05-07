import db from "@/lib/db.js";

export async function GET() {
	const [rows] = await db.query("SELECT * FROM project");
	return new Response(JSON.stringify(rows));
}
