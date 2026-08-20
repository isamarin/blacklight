import { describe, expect, it } from 'vitest';

import {
	ACCENT_SWATCHES,
	DEFAULT_ACCENT,
	DEFAULT_GLASS_BLUR,
	appearanceVariables,
	normalizeAccent,
	normalizeAppearance,
	normalizeGlassBlur
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
});

describe('appearanceVariables', () => {
	it('derives hover and pressed shades from the accent', () => {
		const vars = appearanceVariables({
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
			accent: DEFAULT_ACCENT,
			glassBlur: 0,
			backgroundGlow: false
		});

		expect(vars['--glass-blur']).toBe('0px');
		expect(vars['--ambient-glow-opacity']).toBe('0');
	});
});
