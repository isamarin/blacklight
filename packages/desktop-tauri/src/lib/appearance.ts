/**
 * Runtime appearance: accent colour, glass blur and ambient glow.
 *
 * The whole stylesheet is written against `--color-accent` / `--glass-blur`,
 * so switching a theme is a matter of re-declaring those three custom
 * properties on the document element — no class swapping, no reload.
 */

export const ACCENT_SWATCHES = ['#d4ff00', '#107c10', '#60a5fa', '#c084fc'] as const;

/**
 * Xbox green. The lime `#d4ff00` from the design canvas ships as the first
 * swatch rather than the default — see the note in `app.css`.
 */
export const DEFAULT_ACCENT = '#107c10';

export const MIN_GLASS_BLUR = 0;
export const MAX_GLASS_BLUR = 40;
export const GLASS_BLUR_STEP = 2;
export const DEFAULT_GLASS_BLUR = 20;

export type Appearance = {
	accent: string;
	glassBlur: number;
	backgroundGlow: boolean;
};

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeAccent(value: unknown): string {
	if (typeof value !== 'string') return DEFAULT_ACCENT;

	const trimmed = value.trim().toLowerCase();
	if (!HEX_COLOR.test(trimmed)) return DEFAULT_ACCENT;

	if (trimmed.length === 4) {
		const [, r, g, b] = trimmed;
		return `#${r}${r}${g}${g}${b}${b}`;
	}

	return trimmed;
}

export function normalizeGlassBlur(value: unknown): number {
	const numeric = typeof value === 'number' ? value : Number(value);
	if (!Number.isFinite(numeric)) return DEFAULT_GLASS_BLUR;

	const snapped = Math.round(numeric / GLASS_BLUR_STEP) * GLASS_BLUR_STEP;
	return Math.min(MAX_GLASS_BLUR, Math.max(MIN_GLASS_BLUR, snapped));
}

export function normalizeAppearance(source: {
	appearance_accent?: unknown;
	appearance_glass_blur?: unknown;
	appearance_background_glow?: unknown;
}): Appearance {
	return {
		accent: normalizeAccent(source.appearance_accent),
		glassBlur: normalizeGlassBlur(source.appearance_glass_blur),
		backgroundGlow: source.appearance_background_glow !== false
	};
}

/**
 * `--color-accent-dark` / `--color-accent-glow` were hand-picked hexes back
 * when the accent was fixed. Derive them so every swatch gets a matching
 * pressed and hover shade.
 */
export function accentVariables(accent: string): Record<string, string> {
	const normalized = normalizeAccent(accent);

	return {
		'--color-accent': normalized,
		'--color-accent-dark': `color-mix(in srgb, ${normalized} 82%, #000)`,
		'--color-accent-glow': `color-mix(in srgb, ${normalized} 76%, #fff)`
	};
}

export function appearanceVariables(appearance: Appearance): Record<string, string> {
	return {
		...accentVariables(appearance.accent),
		'--glass-blur': `${normalizeGlassBlur(appearance.glassBlur)}px`,
		'--ambient-glow-opacity': appearance.backgroundGlow ? '1' : '0'
	};
}

export function applyAppearance(appearance: Appearance, target?: HTMLElement): void {
	const root = target ?? (typeof document === 'undefined' ? null : document.documentElement);
	if (!root) return;

	for (const [name, value] of Object.entries(appearanceVariables(appearance))) {
		root.style.setProperty(name, value);
	}
}
