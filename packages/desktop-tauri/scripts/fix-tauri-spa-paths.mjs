import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

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