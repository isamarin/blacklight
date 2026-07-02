import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const host = process.env.TAURI_DEV_HOST ?? '127.0.0.1';
const port = Number(process.env.TAURI_DEV_PORT ?? 5173);
const hmrPort = Number(process.env.TAURI_DEV_HMR_PORT ?? 1421);

export default defineConfig({
	base: './',
	plugins: [tailwindcss(), sveltekit()],
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