import nodemailer from "nodemailer";
import { getSecret } from "astro:env/server";

export async function POST({ request }) {
	try {
		const data = await request.formData();
		const name = data.get("name");
		const email = data.get("email");
		const subject = data.get("subject");
		const message = data.get("message");
		const recaptchaToken = data.get("g-recaptcha-response");

		if (validRecaptchaToken(recaptchaToken)) {
			const transporter = nodemailer.createTransport({
				service: "gmail",
				auth: {
					user: getSecret("GMAIL_USER"),
					pass: getSecret("GMAIL_APP_PASS")
				}
			});

			await transporter.sendMail({
				from: `"${name}" <${email}>`,
				to: getSecret("GMAIL_USER"),
				subject: subject,
				html: `<p>Nachricht von <strong>${name}</strong> (<a href="mailto:${email}">${email}</a>):</p>
						<br />
						<p>${message}</p>`
			});
		}

		return new Response(JSON.stringify({ success: true, message: "Nachricht erfolgreich gesendet." }), { status: 200, headers: { "Content-Type": "application/json" } });
	} catch (e) {
		console.error(e);
		return new Response(JSON.stringify({ success: false, message: "Fehler beim Senden der Nachricht." }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
}

async function validRecaptchaToken() {
	if (!recaptchaToken) {
		return new Response(JSON.stringify({ success: false, message: "reCAPTCHA fehlgeschlagen. Versuchen Sie es später erneut oder kontaktieren Sie stempel@intertyp.at" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}

	const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${getSecret("RECAPTCHA_SECRET_KEY")}&response=${recaptchaToken}`, {
		method: "POST"
	});

	const recaptchaData = await recaptchaResponse.json();
	console.info("reCAPTCHA data:", recaptchaData);

	if (!recaptchaData.success || recaptchaData.score < 0.5) {
		console.log("reCAPTCHA verification failed or score too low. Failing silently.", recaptchaData);
		return false;
	}

	return true;
}
