<script lang="ts">
	import { t } from '$lib/i18n';
	import { onMount } from 'svelte';
	import {
		ACCENT_SWATCHES,
		GLASS_BLUR_STEP,
		MAX_GLASS_BLUR,
		MIN_GLASS_BLUR,
		normalizeAccent,
		normalizeAccentMode,
		normalizeAppearance,
		normalizeGlassBlur,
		resolveAccent
	} from '$lib/appearance';
	import { getSettings, setSettings } from '$lib/stores/settings.svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import SettingsSidebar from '$lib/components/settings/SettingsSidebar.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	const settings = $derived(getSettings());
	const accentMode = $derived(normalizeAccentMode(settings.appearance_accent_mode));
	const accent = $derived(normalizeAccent(settings.appearance_accent));

	// Re-sampled on a timer so the swatch preview tracks the drifting hue.
	let now = $state(new Date());
	onMount(() => {
		const timer = setInterval(() => (now = new Date()), 60_000);
		return () => clearInterval(timer);
	});

	const circadian = $derived(
		resolveAccent({ ...normalizeAppearance(settings), accentMode: 'circadian' }, now)
	);
	const glassBlur = $derived(normalizeGlassBlur(settings.appearance_glass_blur));
	const glowOn = $derived(settings.appearance_background_glow !== false);

	const blurLabel = $derived(
		glassBlur === MIN_GLASS_BLUR ? t('settings.appearance.glassOff') : `${glassBlur} px`
	);

	function pickAccent(value: string) {
		setSettings({ ...settings, appearance_accent_mode: 'fixed', appearance_accent: value });
	}

	function useCircadian() {
		setSettings({ ...settings, appearance_accent_mode: 'circadian' });
	}

	function setGlassBlur(event: Event) {
		const value = Number((event.currentTarget as HTMLInputElement).value);
		setSettings({ ...settings, appearance_glass_blur: normalizeGlassBlur(value) });
	}

	function toggleGlow() {
		setSettings({ ...settings, appearance_background_glow: !glowOn });
	}
</script>

<AppLayout title={t('settings.appearance.pageTitle')}>
	<div class="flex gap-8">
		<SettingsSidebar />
		<div class="flex-1 space-y-4">
			<Card glow>
				<div class="space-y-3">
					<h2 class="text-sm font-semibold text-white">
						{t('settings.appearance.accentTitle')}
					</h2>
					<p class="text-xs text-white/50">{t('settings.appearance.accentDescription')}</p>
					<div class="swatch-row pt-1">
						<button
							type="button"
							class="swatch swatch-auto"
							class:swatch-active={accentMode === 'circadian'}
							style:background={circadian.accent}
							style:color={circadian.accent}
							title={t('settings.appearance.circadianTitle')}
							aria-label={t('settings.appearance.circadianTitle')}
							aria-pressed={accentMode === 'circadian'}
							onclick={useCircadian}
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="2" aria-hidden="true">
								<circle cx="12" cy="12" r="4" />
								<path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" stroke-linecap="round" />
							</svg>
						</button>
						{#each ACCENT_SWATCHES as swatch (swatch)}
							<button
								type="button"
								class="swatch"
								class:swatch-active={accentMode === 'fixed' && swatch === accent}
								style:background={swatch}
								style:color={swatch}
								title={swatch}
								aria-label={swatch}
								aria-pressed={accentMode === 'fixed' && swatch === accent}
								onclick={() => pickAccent(swatch)}
							></button>
						{/each}
					</div>
					{#if accentMode === 'circadian'}
						<p class="text-xs text-white/50">
							{t('settings.appearance.circadianActive', {
								phase: circadian.phase ?? '',
								hex: circadian.accent
							})}
						</p>
					{/if}
				</div>
			</Card>

			<Card glow>
				<div class="space-y-3">
					<div class="flex items-center justify-between gap-4">
						<h2 class="text-sm font-semibold text-white">
							{t('settings.appearance.glassTitle')}
						</h2>
						<span class="text-xs text-accent">{blurLabel}</span>
					</div>
					<input
						type="range"
						class="glass-range"
						min={MIN_GLASS_BLUR}
						max={MAX_GLASS_BLUR}
						step={GLASS_BLUR_STEP}
						value={glassBlur}
						aria-label={t('settings.appearance.glassTitle')}
						oninput={setGlassBlur}
					/>
					<p class="text-xs text-white/40">{t('settings.appearance.glassDescription')}</p>
				</div>
			</Card>

			<Card glow>
				<div class="flex items-center justify-between gap-4">
					<div class="space-y-1">
						<h2 class="text-sm font-semibold text-white">
							{t('settings.appearance.glowTitle')}
						</h2>
						<p class="text-xs text-white/40">{t('settings.appearance.glowDescription')}</p>
					</div>
					<button
						type="button"
						class="toggle-switch"
						class:toggle-switch-on={glowOn}
						role="switch"
						aria-checked={glowOn}
						aria-label={t('settings.appearance.glowTitle')}
						onclick={toggleGlow}
					>
						<span class="toggle-switch-knob"></span>
					</button>
				</div>
			</Card>
		</div>
	</div>
</AppLayout>
