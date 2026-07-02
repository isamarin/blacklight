import { describe, expect, it } from 'vitest';
import { buildStreamConfig, parseStreamRoute } from './stream';

describe('stream helpers', () => {
	it('parseStreamRoute detects cloud routes', () => {
		expect(parseStreamRoute('xcloud_title-id')).toEqual({
			type: 'cloud',
			id: 'title-id'
		});
	});

	it('parseStreamRoute treats other ids as home console ids', () => {
		expect(parseStreamRoute('F000000000000001')).toEqual({
			type: 'home',
			id: 'F000000000000001'
		});
	});

	it('buildStreamConfig selects host by stream type', () => {
		expect(buildStreamConfig('title', 'cloud', 'en-US', 720)).toEqual({
			id: 'title',
			type: 'cloud',
			language: 'en-US',
			host: 'https://uks.core.gssv-play-prod.xboxlive.com',
			resolution: 720
		});

		expect(buildStreamConfig('F000000000000001', 'home', 'ru-RU', 1080)).toEqual({
			id: 'F000000000000001',
			type: 'home',
			language: 'ru-RU',
			host: 'https://uks.core.gssv-play-prodxhome.xboxlive.com',
			resolution: 1080
		});
	});
});