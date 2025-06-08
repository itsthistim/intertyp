import nodemailer from "nodemailer";
import { getSecret } from "astro:env/server";

export async function POST({ request }) {
	try {
		const data = await request.formData();
		const name = data.get("name");
		const email = data.get("email");
		const subject = data.get("subject");
		const message = data.get("message");

		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: getSecret("GMAIL_USER"),
				pass: getSecret("GMAIL_PASS")
			}
		});

		const info = await transporter.sendMail({
			from: `"${name}" <${email}>`,
			to: getSecret("GMAIL_USER"),
			subject: subject,
			html: `<p>Nachricht von <strong>${name}</strong> (<a href="mailto:${email}">${email}</a>):</p><br /><p>${message}</p>`
		});

		console.log("Message sent:", info.messageId);

		return new Response(JSON.stringify({ success: true, message: "Nachricht erfolgreich gesendet." }), { status: 200, headers: { "Content-Type": "application/json" } });
	} catch (e) {
		console.error(e);
		return new Response(JSON.stringify({ success: false, message: "Fehler beim Senden der Nachricht." }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
}
