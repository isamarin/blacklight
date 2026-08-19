import type { IncomingMessage, ServerResponse } from 'node:http';

const ALLOWED_HOSTS = new Set(['127.0.0.1', 'localhost', 'tauri.localhost']);
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'tauri:']);

export function isAllowedOrigin(origin: string | undefined): boolean {
	if (!origin) return false;

	try {
		const { hostname, protocol } = new URL(origin);
		if (!ALLOWED_PROTOCOLS.has(protocol)) return false;
		return ALLOWED_HOSTS.has(hostname);
	} catch {
		return false;
	}
}

export function applyCors(req: IncomingMessage, res: ServerResponse): void {
	const origin = req.headers.origin;
	if (typeof origin === 'string' && isAllowedOrigin(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin);
		res.setHeader('Access-Control-Allow-Credentials', 'true');
	}

	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'content-type, authorization, trpc-accept, x-trpc-source, x-trpc-batch-mode'
	);
	res.setHeader('Vary', 'Origin');
}

export function handlePreflight(req: IncomingMessage, res: ServerResponse): boolean {
	if (req.method !== 'OPTIONS') return false;

	applyCors(req, res);
	res.writeHead(204);
	res.end();
	return true;
}