import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

import ttf2woff2 from "ttf2woff2";

const fontsDir = "./public/fonts";

async function convertFonts() {
	try {
		const files = readdirSync(fontsDir);
		let convertedCount = 0;

		for (const file of files) {
			const filePath = join(fontsDir, file);

			if (statSync(filePath).isDirectory() || !file.toLowerCase().endsWith(".ttf")) {
				continue;
			}

			try {
				console.log(`Converting ${file} to WOFF2...`);

				const input = readFileSync(filePath);
				const output = ttf2woff2(input);

				const outputPath = join(fontsDir, file.replace(".ttf", ".woff2"));
				writeFileSync(outputPath, output);

				console.log(`✓ Converted ${file} to ${file.replace(".ttf", ".woff2")}`);
				convertedCount++;
			} catch (err) {
				console.error(`Error converting ${file}:`, err);
			}
		}

		console.log(`\nConversion complete!`);
		console.log(`${convertedCount} fonts converted to WOFF2 format`);
	} catch (err) {
		console.error(`Error accessing directory ${fontsDir}:`, err);
	}
}

convertFonts();
