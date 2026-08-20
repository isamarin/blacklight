/**
 * Runtime appearance: accent colour, glass blur and ambient glow.
 *
 * The whole stylesheet is written against `--color-accent` / `--glass-blur`,
 * so switching a theme is a matter of re-declaring those three custom
 * properties on the document element — no class swapping, no reload.
 */
import { sampleLightHue } from '@igrs/circahue';

export const ACCENT_SWATCHES = ['#d4ff00', '#107c10', '#60a5fa', '#c084fc'] as const;

/** Fixed-mode fallback: the design canvas lime. */
export const DEFAULT_ACCENT = '#d4ff00';

/**
 * `circadian` derives the accent from clock time, season and latitude via
 * @igrs/circahue; `fixed` pins it to `appearance_accent`.
 */
export type AccentMode = 'circadian' | 'fixed';
export const DEFAULT_ACCENT_MODE: AccentMode = 'circadian';

/** Moscow, matching circahue's own default. */
export const DEFAULT_LATITUDE = 55.75;

export const MIN_GLASS_BLUR = 0;
export const MAX_GLASS_BLUR = 40;
export const GLASS_BLUR_STEP = 2;
export const DEFAULT_GLASS_BLUR = 20;

export type Appearance = {
	accentMode: AccentMode;
	accent: string;
	glassBlur: number;
	backgroundGlow: boolean;
};

export type ResolvedAccent = {
	accent: string;
	dark: string;
	glow: string;
	/** Only set in circadian mode — e.g. "Zenith". */
	phase?: string;
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

export function normalizeAccentMode(value: unknown): AccentMode {
	return value === 'fixed' ? 'fixed' : DEFAULT_ACCENT_MODE;
}

export function normalizeGlassBlur(value: unknown): number {
	const numeric = typeof value === 'number' ? value : Number(value);
	if (!Number.isFinite(numeric)) return DEFAULT_GLASS_BLUR;

	const snapped = Math.round(numeric / GLASS_BLUR_STEP) * GLASS_BLUR_STEP;
	return Math.min(MAX_GLASS_BLUR, Math.max(MIN_GLASS_BLUR, snapped));
}

export function normalizeAppearance(source: {
	appearance_accent_mode?: unknown;
	appearance_accent?: unknown;
	appearance_glass_blur?: unknown;
	appearance_background_glow?: unknown;
}): Appearance {
	return {
		accentMode: normalizeAccentMode(source.appearance_accent_mode),
		accent: normalizeAccent(source.appearance_accent),
		glassBlur: normalizeGlassBlur(source.appearance_glass_blur),
		backgroundGlow: source.appearance_background_glow !== false
	};
}

function runtimeTimeZone(): string | undefined {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
	} catch {
		return undefined;
	}
}

/**
 * Fixed mode has no hover/pressed shades of its own, so derive them the way
 * circahue derives its own — `color-mix` keeps it in the browser's colour
 * space rather than baking hexes per swatch.
 */
function derivedShades(accent: string): ResolvedAccent {
	return {
		accent,
		dark: `color-mix(in srgb, ${accent} 82%, #000)`,
		glow: `color-mix(in srgb, ${accent} 76%, #fff)`
	};
}

export function resolveAccent(appearance: Appearance, at?: Date): ResolvedAccent {
	if (appearance.accentMode !== 'circadian') {
		return derivedShades(normalizeAccent(appearance.accent));
	}

	try {
		const snapshot = sampleLightHue({
			at: at ?? new Date(),
			timeZone: runtimeTimeZone(),
			latitude: DEFAULT_LATITUDE
		});

		return {
			accent: snapshot.accent.hex,
			dark: snapshot.accentDim,
			glow: snapshot.accentHover,
			phase: snapshot.phaseLabel
		};
	} catch {
		// Never let a clock/Intl edge case leave the UI unstyled.
		return derivedShades(normalizeAccent(appearance.accent));
	}
}

export function appearanceVariables(
	appearance: Appearance,
	at?: Date
): Record<string, string> {
	const resolved = resolveAccent(appearance, at);

	return {
		'--color-accent': resolved.accent,
		'--color-accent-dark': resolved.dark,
		'--color-accent-glow': resolved.glow,
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
