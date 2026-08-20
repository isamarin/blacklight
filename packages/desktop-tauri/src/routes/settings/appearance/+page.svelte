<script lang="ts">
	import { t } from '$lib/i18n';
	import {
		ACCENT_SWATCHES,
		GLASS_BLUR_STEP,
		MAX_GLASS_BLUR,
		MIN_GLASS_BLUR,
		normalizeAccent,
		normalizeGlassBlur
	} from '$lib/appearance';
	import { getSettings, setSettings } from '$lib/stores/settings.svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import SettingsSidebar from '$lib/components/settings/SettingsSidebar.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	const settings = $derived(getSettings());
	const accent = $derived(normalizeAccent(settings.appearance_accent));
	const glassBlur = $derived(normalizeGlassBlur(settings.appearance_glass_blur));
	const glowOn = $derived(settings.appearance_background_glow !== false);

	const blurLabel = $derived(
		glassBlur === MIN_GLASS_BLUR ? t('settings.appearance.glassOff') : `${glassBlur} px`
	);

	function pickAccent(value: string) {
		setSettings({ ...settings, appearance_accent: value });
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
						{#each ACCENT_SWATCHES as swatch (swatch)}
							<button
								type="button"
								class="swatch"
								class:swatch-active={swatch === accent}
								style:background={swatch}
								style:color={swatch}
								title={swatch}
								aria-label={swatch}
								aria-pressed={swatch === accent}
								onclick={() => pickAccent(swatch)}
							></button>
						{/each}
					</div>
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
