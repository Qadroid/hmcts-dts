import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		csrf: {
			checkOrigin: false,
		},
	},
	alias: {
		$components: "src/lib/components",
		$lib: "src/lib"
	},
};

export default config;
