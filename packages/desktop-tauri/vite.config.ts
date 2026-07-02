import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		// WKWebView on macOS resolves localhost to 127.0.0.1; binding ::1 only yields a blank window.
		host: '127.0.0.1',
		port: 5173,
		strictPort: true
	},
	optimizeDeps: {
		include: ['react', 'react-dom', 'react-dom/client']
	}
});