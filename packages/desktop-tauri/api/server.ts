import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { appRouter } from '@blacklight/platform';
import { applyCors, handlePreflight } from './cors.js';
import { handleMediaRequest } from './image-cache.js';
import { parseSidecarSettings, resolveApiPort } from './port.js';
import pkg from '../package.json';

function resolveDataDir(): string {
	return process.env.BLACKLIGHT_DATA_DIR ?? path.join(os.homedir(), '.blacklight');
}

function loadPort(): number {
	const dataDir = resolveDataDir();
	try {
		const raw = fs.readFileSync(path.join(dataDir, 'sidecar-settings.json'), 'utf8');
		return resolveApiPort({ settings: parseSidecarSettings(raw) });
	} catch {
		return resolveApiPort({});
	}
}

const trpcHandler = createHTTPHandler({
	router: appRouter,
	createContext: () => ({}),
	basePath: '/trpc/'
});

const port = process.env.BLACKLIGHT_PORT ? Number(process.env.BLACKLIGHT_PORT) : loadPort();
const imageCacheDir = path.join(resolveDataDir(), 'image-cache');

const server = http.createServer((req, res) => {
	applyCors(req, res);
	if (handlePreflight(req, res)) return;

	const url = req.url?.split('?')[0] ?? '/';

	if (url === '/health') {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(
			JSON.stringify({
				ok: true,
				service: 'blacklight-api',
				running: true,
				version: pkg.version,
				media: true
			})
		);
		return;
	}

	if (url === '/trpc' || url.startsWith('/trpc/')) {
		trpcHandler(req, res);
		return;
	}

	if (url === '/media') {
		void handleMediaRequest(req, res, imageCacheDir);
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