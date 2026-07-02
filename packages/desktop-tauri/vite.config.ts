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
				.replaceAll('style="display: contents"', 'id="svelte-app" style="height: 100%"')
				.replace(
					/(__sveltekit_\w+ = \{\s*)base: ""(\s*\};)/,
					"$1base: new URL('.', location).pathname.slice(0, -1)$2"
				)
				.replace(
					/(\)\.then\(\(\[kit, app\]\) => \{\s*kit\.start\(app, element\);\s*\}\);)/,
					`).then(([kit, app]) => {
						kit.start(app, element);
					}).catch((error) => {
						const showBootError = (message) => {
							const el = document.getElementById('boot-error');
							if (!el) return;
							el.style.display = 'block';
							el.textContent = String(message);
						};
						showBootError(error);
						console.error('Blacklight failed to start', error);
					});`
				);

			writeFileSync(indexPath, html);
		}
	};
}

const host = process.env.TAURI_DEV_HOST ?? '127.0.0.1';
const port = Number(process.env.TAURI_DEV_PORT ?? 5173);
const previewPort = Number(process.env.TAURI_DEV_PREVIEW_PORT ?? 4173);
const apiPort = Number(process.env.BLACKLIGHT_PORT ?? 9003);
const hmrPort = Number(process.env.TAURI_DEV_HMR_PORT ?? 1421);
const apiOrigin = `http://127.0.0.1:${apiPort}`;

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
	preview: {
		host,
		port: previewPort,
		strictPort: true,
		proxy: {
			'/trpc': { target: apiOrigin, changeOrigin: true },
			'/health': { target: apiOrigin, changeOrigin: true }
		}
	},
	envPrefix: ['VITE_', 'TAURI_'],
	optimizeDeps: {
		include: ['react', 'react-dom', 'react-dom/client']
	}
});