import { afterEach, describe, expect, it } from 'vitest';

import { cachedMediaUrl, normalizeMediaUrl } from './media-cache';

describe('media-cache', () => {
	afterEach(() => {
		delete (globalThis as { window?: Window }).window;
	});

	it('normalizes protocol-relative URLs', () => {
		expect(normalizeMediaUrl('//images-eds.xboxlive.com/tile.jpg')).toBe(
			'https://images-eds.xboxlive.com/tile.jpg'
		);
	});

	it('builds cached media URLs through the dev proxy origin', () => {
		(globalThis as { window: Window }).window = {
			location: {
				hostname: '127.0.0.1',
				port: '5173',
				origin: 'http://127.0.0.1:5173'
			}
		} as Window;

		const url = cachedMediaUrl('//images-eds.xboxlive.com/tile.jpg', 'tile');
		expect(url).toContain('http://127.0.0.1:5173/media?');
		expect(url).toContain('preset=tile');
		expect(url).toContain(encodeURIComponent('https://images-eds.xboxlive.com/tile.jpg'));
	});
});