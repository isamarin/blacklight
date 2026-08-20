<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { subscribeNativeGamepads, type NativeGamepad } from '$lib/gamepads';
	import { getSettings, setSettings } from '$lib/stores/settings.svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import SettingsSidebar from '$lib/components/settings/SettingsSidebar.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	const settings = $derived(getSettings());
	let pads = $state<NativeGamepad[]>([]);

	const toggles = [
		['controller_vibration', 'settings.input.enableVibration'],
		['input_mousekeyboard', 'settings.input.enableMouseKeyboard'],
		['input_touch', 'settings.input.enableTouch'],
		['input_newgamepad', 'settings.input.enableNewGamepadLabel']
	] as const;

	function toggle(key: (typeof toggles)[number][0]) {
		setSettings({ ...settings, [key]: !settings[key] });
	}

	onMount(() => {
		let stop: (() => void) | undefined;
		void subscribeNativeGamepads((next) => (pads = next)).then((unlisten) => {
			stop = unlisten;
		});
		return () => stop?.();
	});
</script>

<AppLayout title={t('settings.input.settingsInputPageTitle')}>
	<div class="flex gap-8">
		<SettingsSidebar />
		<div class="flex-1 space-y-4">
			<Card>
				<h2 class="text-lg font-semibold text-white mb-2">
					{t('settings.input.controllerDetectedTitle')}
				</h2>
				<p class="text-sm text-white/60 mb-4">
					{t('settings.input.controllerDetectedDescription')}
				</p>
				{#if pads.length === 0}
					<p class="text-sm text-white/50">{t('settings.input.noControllerDetected')}</p>
				{:else}
					<ul class="space-y-2">
						{#each pads as pad (pad.id)}
							<li class="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80">
								<div class="font-medium text-white">{pad.name}</div>
								<div class="text-white/50">
									{pad.buttons} {t('settings.input.buttonsLabel')} · {pad.axes}
									{t('settings.input.axesLabel')} · {pad.rumble
										? t('settings.input.rumbleLabel')
										: t('settings.input.notSupportedLabel')}
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</Card>
			{#each toggles as [key, labelKey] (key)}
				<Card>
					<label class="flex items-center gap-3 text-white/80 cursor-pointer">
						<input
							type="checkbox"
							checked={settings[key]}
							onchange={() => toggle(key)}
							class="accent-xbox"
						/>
						{t(labelKey)}
					</label>
				</Card>
			{/each}
		</div>
	</div>
</AppLayout>