import { describe, expect, it } from 'vitest';

import {
	ACCENT_SWATCHES,
	DEFAULT_ACCENT,
	DEFAULT_GLASS_BLUR,
	appearanceVariables,
	normalizeAccent,
	normalizeAccentMode,
	normalizeAppearance,
	normalizeGlassBlur,
	resolveAccent
} from './appearance';

describe('normalizeAccent', () => {
	it('keeps every shipped swatch untouched', () => {
		for (const swatch of ACCENT_SWATCHES) {
			expect(normalizeAccent(swatch)).toBe(swatch);
		}
	});

	it('lowercases and expands shorthand hex', () => {
		expect(normalizeAccent('#D4FF00')).toBe('#d4ff00');
		expect(normalizeAccent('#0F0')).toBe('#00ff00');
	});

	it('falls back for anything that is not a hex colour', () => {
		expect(normalizeAccent('red')).toBe(DEFAULT_ACCENT);
		expect(normalizeAccent('rgb(1,2,3)')).toBe(DEFAULT_ACCENT);
		expect(normalizeAccent(undefined)).toBe(DEFAULT_ACCENT);
		expect(normalizeAccent(42)).toBe(DEFAULT_ACCENT);
	});
});

describe('normalizeGlassBlur', () => {
	it('clamps to the slider range', () => {
		expect(normalizeGlassBlur(-10)).toBe(0);
		expect(normalizeGlassBlur(120)).toBe(40);
	});

	it('snaps to the 2px step', () => {
		expect(normalizeGlassBlur(17)).toBe(18);
		expect(normalizeGlassBlur(15)).toBe(16);
	});

	it('falls back when the value is not a number', () => {
		expect(normalizeGlassBlur('nope')).toBe(DEFAULT_GLASS_BLUR);
		expect(normalizeGlassBlur(Number.NaN)).toBe(DEFAULT_GLASS_BLUR);
	});
});

describe('normalizeAppearance', () => {
	it('treats a missing glow flag as enabled', () => {
		expect(normalizeAppearance({}).backgroundGlow).toBe(true);
		expect(normalizeAppearance({ appearance_background_glow: false }).backgroundGlow).toBe(false);
	});

	it('defaults to circadian, so upgrades from before the mode existed get it', () => {
		expect(normalizeAppearance({}).accentMode).toBe('circadian');
		expect(normalizeAccentMode(undefined)).toBe('circadian');
		expect(normalizeAccentMode('fixed')).toBe('fixed');
		expect(normalizeAccentMode('nonsense')).toBe('circadian');
	});
});

describe('resolveAccent in circadian mode', () => {
	const base = { accentMode: 'circadian' as const, accent: DEFAULT_ACCENT, glassBlur: 20, backgroundGlow: true };

	it('returns a real hex plus a phase label', () => {
		const noon = resolveAccent(base, new Date('2026-07-01T12:00:00Z'));
		expect(noon.accent).toMatch(/^#[0-9a-f]{6}$/i);
		expect(noon.phase).toBeTruthy();
	});

	it('gives a different hue at midnight than at noon', () => {
		const noon = resolveAccent(base, new Date('2026-07-01T12:00:00Z'));
		const midnight = resolveAccent(base, new Date('2026-07-01T00:00:00Z'));
		expect(noon.accent).not.toBe(midnight.accent);
	});

	it('ignores the fixed accent while circadian is active', () => {
		const withLime = resolveAccent({ ...base, accent: '#d4ff00' }, new Date('2026-07-01T12:00:00Z'));
		const withBlue = resolveAccent({ ...base, accent: '#60a5fa' }, new Date('2026-07-01T12:00:00Z'));
		expect(withLime.accent).toBe(withBlue.accent);
	});

	it('honours the pinned swatch in fixed mode', () => {
		const fixed = resolveAccent({ ...base, accentMode: 'fixed', accent: '#60a5fa' });
		expect(fixed.accent).toBe('#60a5fa');
		expect(fixed.phase).toBeUndefined();
	});
});

describe('appearanceVariables', () => {
	it('derives hover and pressed shades from the accent', () => {
		const vars = appearanceVariables({
			accentMode: 'fixed',
			accent: '#d4ff00',
			glassBlur: 20,
			backgroundGlow: true
		});

		expect(vars['--color-accent']).toBe('#d4ff00');
		expect(vars['--color-accent-glow']).toContain('#d4ff00');
		expect(vars['--color-accent-dark']).toContain('#d4ff00');
		expect(vars['--glass-blur']).toBe('20px');
		expect(vars['--ambient-glow-opacity']).toBe('1');
	});

	it('hides the ambient layer when the glow is off', () => {
		const vars = appearanceVariables({
			accentMode: 'fixed',
			accent: DEFAULT_ACCENT,
			glassBlur: 0,
			backgroundGlow: false
		});

		expect(vars['--glass-blur']).toBe('0px');
		expect(vars['--ambient-glow-opacity']).toBe('0');
	});
});
