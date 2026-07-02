import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { appRouter } from '@blacklight/platform';

function loadPort(): number {
	const dataDir = process.env.BLACKLIGHT_DATA_DIR ?? path.join(os.homedir(), '.blacklight');
	try {
		const raw = fs.readFileSync(path.join(dataDir, 'sidecar-settings.json'), 'utf8');
		const parsed = JSON.parse(raw) as { webui_port?: number };
		const port = Number(parsed.webui_port);
		return port >= 1024 && port <= 65535 ? port : 9003;
	} catch {
		return 9003;
	}
}

const trpcHandler = createHTTPHandler({
	router: appRouter,
	createContext: () => ({}),
	basePath: '/trpc/'
});

const port = process.env.BLACKLIGHT_PORT ? Number(process.env.BLACKLIGHT_PORT) : loadPort();

const server = http.createServer((req, res) => {
	const url = req.url?.split('?')[0] ?? '/';

	if (url === '/health') {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ ok: true, service: 'blacklight-api' }));
		return;
	}

	if (url === '/trpc' || url.startsWith('/trpc/')) {
		trpcHandler(req, res);
		return;
	}

	res.writeHead(404, { 'Content-Type': 'text/plain' });
	res.end('Not found');
});

server.listen(port, '127.0.0.1', () => {
	console.log(`[blacklight-api] tRPC http://127.0.0.1:${port}/trpc`);
});

function shutdown() {
	server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);