import { describe, expect, it } from 'vitest';
import { isNewerRelease, normalizeVersion, pickLatestRelease } from './updater';

describe('updater', () => {
	it('normalizeVersion strips v prefix', () => {
		expect(normalizeVersion('v2026.7.5')).toBe('2026.7.5');
	});

	it('pickLatestRelease skips drafts and matches prerelease flag', () => {
		const releases = [
			{
				tag_name: 'v2026.7.6',
				body: '',
				html_url: 'https://example.com/6',
				prerelease: false,
				draft: true
			},
			{
				tag_name: 'v2026.7.5',
				body: '',
				html_url: 'https://example.com/5',
				prerelease: false,
				draft: false
			},
			{
				tag_name: 'v2026.7.4-beta.1',
				body: '',
				html_url: 'https://example.com/beta',
				prerelease: true,
				draft: false
			}
		];

		expect(pickLatestRelease(releases, false)?.tag_name).toBe('v2026.7.5');
		expect(pickLatestRelease(releases, true)?.tag_name).toBe('v2026.7.4-beta.1');
	});

	it('isNewerRelease compares CalVer tags', () => {
		expect(isNewerRelease('2026.7.5', 'v2026.7.6')).toBe(true);
		expect(isNewerRelease('2026.7.5', 'v2026.7.5')).toBe(false);
		expect(isNewerRelease('2026.7.5', 'v2026.7.4')).toBe(false);
	});
});