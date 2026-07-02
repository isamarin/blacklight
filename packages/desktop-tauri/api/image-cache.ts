import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

export type ImagePreset = 'tile' | 'cover' | 'icon' | 'poster';

type PresetConfig = {
	width: number;
	height: number;
	fit: 'cover' | 'contain';
	quality: number;
};

export const IMAGE_PRESETS: Record<ImagePreset, PresetConfig> = {
	tile: { width: 280, height: 280, fit: 'cover', quality: 82 },
	cover: { width: 360, height: 360, fit: 'cover', quality: 82 },
	icon: { width: 128, height: 128, fit: 'contain', quality: 85 },
	poster: { width: 320, height: 480, fit: 'cover', quality: 82 }
};

const FETCH_TIMEOUT_MS = 15_000;
const CACHE_CONTROL = 'public, max-age=31536000, immutable';
const inFlight = new Map<string, Promise<string>>();

function isImagePreset(value: string): value is ImagePreset {
	return value in IMAGE_PRESETS;
}

export function normalizeRemoteUrl(raw: string): string | null {
	const trimmed = raw.trim();
	if (!trimmed) return null;

	try {
		if (trimmed.startsWith('//')) {
			return new URL(`https:${trimmed}`).toString();
		}
		return new URL(trimmed).toString();
	} catch {
		return null;
	}
}

export function isAllowedImageUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== 'https:') return false;

		const host = parsed.hostname.toLowerCase();
		return (
			host.endsWith('.xboxlive.com') ||
			host.endsWith('.xbox.com') ||
			host.endsWith('.microsoft.com') ||
			host.endsWith('.microsoftstore.com') ||
			host.endsWith('.windows.net') ||
			host.endsWith('.azureedge.net') ||
			host.endsWith('.akamaized.net') ||
			host.includes('xbox') ||
			host.includes('microsoft')
		);
	} catch {
		return false;
	}
}

export function buildCacheBaseName(url: string, preset: ImagePreset): string {
	return crypto.createHash('sha256').update(`${preset}:${url}`).digest('hex');
}

export function buildCacheFileName(url: string, preset: ImagePreset, extension = 'webp'): string {
	return `${buildCacheBaseName(url, preset)}.${extension}`;
}

export function parseMediaRequest(
	req: IncomingMessage
): { url: string; preset: ImagePreset } | { error: string; status: number } {
	const requestUrl = new URL(req.url ?? '/', 'http://127.0.0.1');
	const remoteUrl = normalizeRemoteUrl(requestUrl.searchParams.get('url') ?? '');
	const presetParam = requestUrl.searchParams.get('preset') ?? 'tile';

	if (!remoteUrl) {
		return { error: 'Missing or invalid url', status: 400 };
	}

	if (!isAllowedImageUrl(remoteUrl)) {
		return { error: 'URL host is not allowed', status: 403 };
	}

	if (!isImagePreset(presetParam)) {
		return { error: 'Invalid preset', status: 400 };
	}

	return { url: remoteUrl, preset: presetParam };
}

function looksLikeImage(buffer: Buffer): boolean {
	if (buffer.length < 12) return false;

	if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
	if (buffer.toString('ascii', 0, 8) === '\x89PNG\r\n\x1a\n') return true;
	if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
		return true;
	}
	if (buffer.toString('ascii', 0, 6) === 'GIF87a' || buffer.toString('ascii', 0, 6) === 'GIF89a') {
		return true;
	}

	return false;
}

function detectImageFormat(buffer: Buffer): { extension: string; contentType: string } {
	if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
		return { extension: 'jpg', contentType: 'image/jpeg' };
	}
	if (buffer.toString('ascii', 0, 8) === '\x89PNG\r\n\x1a\n') {
		return { extension: 'png', contentType: 'image/png' };
	}
	if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
		return { extension: 'webp', contentType: 'image/webp' };
	}
	if (buffer.toString('ascii', 0, 6) === 'GIF87a' || buffer.toString('ascii', 0, 6) === 'GIF89a') {
		return { extension: 'gif', contentType: 'image/gif' };
	}

	return { extension: 'img', contentType: 'application/octet-stream' };
}

function contentTypeForPath(filePath: string): string {
	switch (path.extname(filePath).toLowerCase()) {
		case '.webp':
			return 'image/webp';
		case '.jpg':
		case '.jpeg':
			return 'image/jpeg';
		case '.png':
			return 'image/png';
		case '.gif':
			return 'image/gif';
		default:
			return 'application/octet-stream';
	}
}

async function fetchRemoteImage(url: string): Promise<Buffer> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

	try {
		const response = await fetch(url, {
			signal: controller.signal,
			headers: {
				Accept: 'image/*,*/*;q=0.8',
				'User-Agent': 'Mozilla/5.0 (compatible; Blacklight/1.0)',
				Referer: 'https://www.xbox.com/'
			},
			redirect: 'follow'
		});

		if (!response.ok) {
			throw new Error(`Upstream responded with ${response.status}`);
		}

		const arrayBuffer = await response.arrayBuffer();
		if (!arrayBuffer.byteLength) {
			throw new Error('Empty image response');
		}

		const buffer = Buffer.from(arrayBuffer);
		if (!looksLikeImage(buffer)) {
			const contentType = response.headers.get('content-type') ?? 'unknown';
			throw new Error(`Unexpected image payload (${contentType})`);
		}

		return buffer;
	} finally {
		clearTimeout(timeout);
	}
}

async function transformImage(
	buffer: Buffer,
	preset: ImagePreset
): Promise<{ buffer: Buffer; extension: string }> {
	try {
		const sharp = (await import('sharp')).default;
		const config = IMAGE_PRESETS[preset];
		const transformed = await sharp(buffer)
			.rotate()
			.resize(config.width, config.height, {
				fit: config.fit,
				withoutEnlargement: true,
				background: { r: 0, g: 0, b: 0, alpha: 0 }
			})
			.webp({ quality: config.quality, effort: 4 })
			.toBuffer();

		return { buffer: transformed, extension: 'webp' };
	} catch {
		return { buffer, ...detectImageFormat(buffer) };
	}
}

async function findCachedFile(
	cacheDir: string,
	url: string,
	preset: ImagePreset
): Promise<string | null> {
	const baseName = buildCacheBaseName(url, preset);
	const prefix = `${baseName}.`;

	try {
		const entries = await fsp.readdir(cacheDir);
		const match = entries.find((entry) => entry.startsWith(prefix));
		return match ? path.join(cacheDir, match) : null;
	} catch {
		return null;
	}
}

async function ensureCachedImage(
	cacheDir: string,
	remoteUrl: string,
	preset: ImagePreset
): Promise<string> {
	const existing = await findCachedFile(cacheDir, remoteUrl, preset);
	if (existing) {
		return existing;
	}

	const key = `${preset}:${remoteUrl}`;
	const pending = inFlight.get(key);
	if (pending) {
		return pending;
	}

	const task = (async () => {
		await fsp.mkdir(cacheDir, { recursive: true });
		const remote = await fetchRemoteImage(remoteUrl);
		const transformed = await transformImage(remote, preset);
		const filePath = path.join(
			cacheDir,
			buildCacheFileName(remoteUrl, preset, transformed.extension)
		);
		const tempPath = `${filePath}.${process.pid}.tmp`;

		try {
			await fsp.writeFile(tempPath, transformed.buffer);
			await fsp.rename(tempPath, filePath);
			return filePath;
		} catch (error) {
			await fsp.rm(tempPath, { force: true });
			throw error;
		} finally {
			inFlight.delete(key);
		}
	})();

	inFlight.set(key, task);
	return task;
}

export async function handleMediaRequest(
	req: IncomingMessage,
	res: ServerResponse,
	cacheDir: string
): Promise<void> {
	if (req.method !== 'GET' && req.method !== 'HEAD') {
		res.writeHead(405, { 'Content-Type': 'text/plain' });
		res.end('Method not allowed');
		return;
	}

	const parsed = parseMediaRequest(req);
	if ('error' in parsed) {
		res.writeHead(parsed.status, { 'Content-Type': 'text/plain' });
		res.end(parsed.error);
		return;
	}

	try {
		const filePath = await ensureCachedImage(cacheDir, parsed.url, parsed.preset);
		const stat = await fsp.stat(filePath);

		res.writeHead(200, {
			'Content-Type': contentTypeForPath(filePath),
			'Content-Length': stat.size,
			'Cache-Control': CACHE_CONTROL
		});

		if (req.method === 'HEAD') {
			res.end();
			return;
		}

		fs.createReadStream(filePath).pipe(res);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Image cache failed';
		res.writeHead(502, { 'Content-Type': 'text/plain' });
		res.end(message);
	}
}