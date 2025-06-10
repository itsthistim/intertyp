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

		// Extract user agent and IP address for recaptcha validation
		const userAgent = request.headers.get("user-agent") || "";
		const userIpAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";

		if (await validRecaptchaToken(recaptchaToken, userAgent, userIpAddress)) {
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

async function validRecaptchaToken(recaptchaToken, userAgent, userIpAddress) {
	if (!recaptchaToken) {
		console.warn("No reCAPTCHA token provided. Failing silently.");
		return false;
	}

	// Prepare form data for POST
	const params = new URLSearchParams();
	params.append("secret", getSecret("RECAPTCHA_SECRET_KEY"));
	params.append("response", recaptchaToken);
	if (userIpAddress) params.append("remoteip", userIpAddress);

	const recaptchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: params
	});

	const recaptchaData = await recaptchaResponse.json();
	console.info("reCAPTCHA data:", recaptchaData, "userAgent:", userAgent, "userIpAddress:", userIpAddress);

	if (!recaptchaData.success || recaptchaData.score < 0.5) {
		console.warn("reCAPTCHA verification failed or score too low. Failing silently.", recaptchaData);
		return false;
	}

	console.info("reCAPTCHA verification successful with score:", recaptchaData.score);
	return true;
}
