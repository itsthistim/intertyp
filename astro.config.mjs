// @ts-check
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import node from "@astrojs/node";
import path from "path";

// https://astro.build/config
export default defineConfig({
	output: "server",
	adapter: node({
		mode: "standalone"
	}),
	integrations: [icon()],
	devToolbar: {
		enabled: false
	},
	vite: {
		resolve: {
			alias: {
				"@": path.resolve("./src")
			}
		}
	}
});
