import { describe, expect, it } from 'vitest';
import { canonicalVersion, isNewerRelease, normalizeVersion, pickLatestRelease } from './updater';

describe('updater', () => {
	it('normalizeVersion strips v prefix', () => {
		expect(normalizeVersion('v2026.7.5')).toBe('2026.7.5');
		expect(normalizeVersion('v26.8.9')).toBe('26.8.9');
	});

	it('canonicalVersion expands short-year CalVer', () => {
		expect(canonicalVersion('v26.8.9')).toBe('2026.8.9');
		expect(canonicalVersion('2026.8.1')).toBe('2026.8.1');
		expect(canonicalVersion('v2.4.2')).toBe('2.4.2');
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

	it('pickLatestRelease prefers 26.8.N over leftover 2026.8.N', () => {
		const releases = [
			{
				tag_name: 'v2026.8.1',
				body: '',
				html_url: 'https://example.com/2026',
				prerelease: false,
				draft: false
			},
			{
				tag_name: 'v26.8.9',
				body: '',
				html_url: 'https://example.com/26',
				prerelease: false,
				draft: false
			}
		];

		expect(pickLatestRelease(releases, false)?.tag_name).toBe('v26.8.9');
	});

	it('isNewerRelease compares CalVer tags', () => {
		expect(isNewerRelease('2026.7.5', 'v2026.7.6')).toBe(true);
		expect(isNewerRelease('2026.7.5', 'v2026.7.5')).toBe(false);
		expect(isNewerRelease('2026.7.5', 'v2026.7.4')).toBe(false);
		expect(isNewerRelease('26.8.9', 'v2026.8.1')).toBe(false);
		expect(isNewerRelease('26.8.9', 'v26.8.10')).toBe(true);
		expect(isNewerRelease('26.8.9', 'v2026.8.10')).toBe(true);
	});
});