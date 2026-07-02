<script lang="ts">
	import { t } from '$lib/i18n';
	import { getSettings, setSettings } from '$lib/stores/settings.svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import SettingsSidebar from '$lib/components/settings/SettingsSidebar.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	const settings = $derived(getSettings());

	const toggles = [
		['controller_vibration', 'settings.input.enableVibration'],
		['input_mousekeyboard', 'settings.input.enableMouseKeyboard'],
		['input_touch', 'settings.input.enableTouch'],
		['input_newgamepad', 'settings.input.enableNewGamepadLabel']
	] as const;

	function toggle(key: (typeof toggles)[number][0]) {
		setSettings({ ...settings, [key]: !settings[key] });
	}
</script>

<AppLayout title={t('settings.input.settingsInputPageTitle')}>
	<div class="flex gap-8">
		<SettingsSidebar />
		<div class="flex-1 space-y-4">
			{#each toggles as [key, labelKey] (key)}
				<Card>
					<label class="flex items-center gap-3 text-white/80 cursor-pointer">
						<input
							type="checkbox"
							checked={settings[key]}
							onchange={() => toggle(key)}
							class="accent-[#107C10]"
						/>
						{t(labelKey)}
					</label>
				</Card>
			{/each}
		</div>
	</div>
</AppLayout>