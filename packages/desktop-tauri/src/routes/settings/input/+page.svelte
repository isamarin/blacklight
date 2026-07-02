<script lang="ts">
	import { getSettings, setSettings } from '$lib/stores/settings.svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import SettingsSidebar from '$lib/components/settings/SettingsSidebar.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	const settings = $derived(getSettings());

	const toggles = [
		['controller_vibration', 'Controller vibration'],
		['input_mousekeyboard', 'Mouse & keyboard'],
		['input_touch', 'Touch controls'],
		['input_newgamepad', 'New gamepad driver']
	] as const;

	function toggle(key: (typeof toggles)[number][0]) {
		setSettings({ ...settings, [key]: !settings[key] });
	}
</script>

<AppLayout title="Input Settings">
	<div class="flex gap-8">
		<SettingsSidebar />
		<div class="flex-1 space-y-4">
			{#each toggles as [key, label] (key)}
				<Card>
					<label class="flex items-center gap-3 text-white/80 cursor-pointer">
						<input
							type="checkbox"
							checked={settings[key]}
							onchange={() => toggle(key)}
							class="accent-[#107C10]"
						/>
						{label}
					</label>
				</Card>
			{/each}
		</div>
	</div>
</AppLayout>