import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';

function fixTauriSpaPaths(): Plugin {
	return {
		name: 'fix-tauri-spa-paths',
		apply: 'build',
		closeBundle() {
			const indexPath = join(process.cwd(), 'build', 'index.html');
			let html = readFileSync(indexPath, 'utf8');

			html = html
				.replaceAll('href="/_app/', 'href="./_app/')
				.replaceAll('import("/_app/', 'import("./_app/')
				.replace(
					/__sveltekit_\w+ = \{\s*base: ""\s*\};/,
					"__sveltekit_tauri = {\n\t\t\t\tbase: new URL('.', location).pathname.slice(0, -1)\n\t\t\t};"
				);

			writeFileSync(indexPath, html);
		}
	};
}

const host = process.env.TAURI_DEV_HOST ?? '127.0.0.1';
const port = Number(process.env.TAURI_DEV_PORT ?? 5173);
const hmrPort = Number(process.env.TAURI_DEV_HMR_PORT ?? 1421);

export default defineConfig({
	base: './',
	plugins: [tailwindcss(), sveltekit(), fixTauriSpaPaths()],
	clearScreen: false,
	server: {
		host,
		port,
		strictPort: true,
		hmr: {
			protocol: 'ws',
			host,
			port: hmrPort
		},
		watch: {
			ignored: ['**/src-tauri/**']
		}
	},
	envPrefix: ['VITE_', 'TAURI_'],
	optimizeDeps: {
		include: ['react', 'react-dom', 'react-dom/client']
	}
});