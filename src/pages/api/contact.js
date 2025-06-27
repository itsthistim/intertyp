import nodemailer from "nodemailer";
import { getSecret } from "astro:env/server";

export async function POST({ request, clientAddress }) {
	const data = await request.formData();
	const name = data.get("name");
	const email = data.get("email");
	const subject = data.get("subject");
	const message = data.get("message");
	const recaptchaToken = data.get("g-recaptcha-response");

	let recaptchaResult;
	try {
		recaptchaResult = await validRecaptchaToken(recaptchaToken, clientAddress);
	} catch (recaptchaError) {
		console.error(recaptchaError);
		return new Response(JSON.stringify({ success: false, message: recaptchaError.message }), { status: 400, headers: { "Content-Type": "application/json" } });
	}

	if (recaptchaResult.success) {
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
		return new Response(JSON.stringify({ success: true, message: "Nachricht erfolgreich gesendet." }), { status: 200, headers: { "Content-Type": "application/json" } });
	}

	return new Response(JSON.stringify({ success: false, message: "reCAPTCHA-Überprüfung fehlgeschlagen." }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
}

async function validRecaptchaToken(recaptchaToken, clientAddress) {
	if (!recaptchaToken) {
		throw new Error("reCAPTCHA token is missing.");
	}

	const params = new URLSearchParams();
	params.append("secret", getSecret("RECAPTCHA_SECRET_KEY"));
	params.append("response", recaptchaToken);
	if (clientAddress) params.append("remoteip", clientAddress);

	const recaptchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: params
	}).catch((error) => {
		console.error("Error verifying reCAPTCHA:", error);
		throw new Error("Failed to verify reCAPTCHA.");
	});

	const recaptchaData = await recaptchaResponse.json();

	if (!recaptchaData.success || recaptchaData.score < 0.5) {
		console.error("reCAPTCHA verification failed:", recaptchaData);
		throw new Error("reCAPTCHA-Überprüfung fehlgeschlagen. Bitte kontaktieren Sie uns direkt, wenn das Problem weiterhin besteht.");
	}

	return recaptchaData;
}
