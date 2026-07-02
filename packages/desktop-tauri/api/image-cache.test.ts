import { describe, expect, it } from 'vitest';

import {
	buildCacheBaseName,
	buildCacheFileName,
	isAllowedImageUrl,
	normalizeRemoteUrl,
	parseMediaRequest
} from './image-cache.js';

describe('image-cache', () => {
	it('normalizes protocol-relative URLs', () => {
		expect(normalizeRemoteUrl('//images-eds.xboxlive.com/tile.jpg')).toBe(
			'https://images-eds.xboxlive.com/tile.jpg'
		);
	});

	it('allows Xbox and Microsoft image hosts', () => {
		expect(isAllowedImageUrl('https://images-eds.xboxlive.com/tile.jpg')).toBe(true);
		expect(isAllowedImageUrl('https://store-images.s-microsoft.com/image.png')).toBe(true);
		expect(isAllowedImageUrl('https://evil.example.com/image.jpg')).toBe(false);
		expect(isAllowedImageUrl('http://images-eds.xboxlive.com/tile.jpg')).toBe(false);
	});

	it('builds stable cache file names', () => {
		const first = buildCacheBaseName('https://example.xboxlive.com/a.png', 'tile');
		const second = buildCacheBaseName('https://example.xboxlive.com/a.png', 'tile');
		const other = buildCacheBaseName('https://example.xboxlive.com/a.png', 'icon');

		expect(first).toBe(second);
		expect(first).not.toBe(other);
		expect(buildCacheFileName('https://example.xboxlive.com/a.png', 'tile')).toBe(`${first}.webp`);
	});

	it('parses media requests', () => {
		const parsed = parseMediaRequest({
			url: '/media?url=https%3A%2F%2Fimages-eds.xboxlive.com%2Ftile.jpg&preset=cover'
		} as import('node:http').IncomingMessage);

		expect(parsed).toEqual({
			url: 'https://images-eds.xboxlive.com/tile.jpg',
			preset: 'cover'
		});
	});

	it('rejects invalid media requests', () => {
		expect(
			parseMediaRequest({
				url: '/media?url=https%3A%2F%2Fevil.example.com%2Fa.jpg'
			} as import('node:http').IncomingMessage)
		).toMatchObject({ status: 403 });

		expect(
			parseMediaRequest({
				url: '/media?preset=tile'
			} as import('node:http').IncomingMessage)
		).toMatchObject({ status: 400 });
	});
});