<script lang="ts">
	import type { VideoRendererMode } from '@blacklight/player/client';
	import { t } from '$lib/i18n';
	import { getSettings, setSettings } from '$lib/stores/settings.svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import SettingsSidebar from '$lib/components/settings/SettingsSidebar.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	const VIDEO_RENDERER_OPTIONS: VideoRendererMode[] = ['auto', 'webgpu', 'video'];
	const VIDEO_RENDERER_I18N_KEYS: Record<VideoRendererMode, string> = {
		auto: 'page.settings.streaming.videoRendererValueAuto',
		webgpu: 'page.settings.streaming.videoRendererValueWebgpu',
		video: 'page.settings.streaming.videoRendererValueVideo'
	};

	const settings = $derived(getSettings());
</script>

<AppLayout title="Streaming Settings">
	<div class="flex gap-8">
		<SettingsSidebar />
		<div class="flex-1 space-y-4">
			<Card>
				<label class="block text-white/70 text-sm mb-2">
					{t('page.settings.streaming.videoRendererLabel', { defaultValue: 'Video renderer' })}
				</label>
				<select
					class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
					value={settings.video_renderer}
					onchange={(e) =>
						setSettings({
							...settings,
							video_renderer: (e.currentTarget as HTMLSelectElement).value as VideoRendererMode
						})}
				>
					{#each VIDEO_RENDERER_OPTIONS as mode (mode)}
						<option value={mode}>{t(VIDEO_RENDERER_I18N_KEYS[mode], { defaultValue: mode })}</option>
					{/each}
				</select>
			</Card>
			<Card>
				<label class="block text-white/70 text-sm mb-2">xCloud bitrate (0 = auto)</label>
				<input
					type="number"
					class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
					value={settings.xcloud_bitrate}
					onchange={(e) =>
						setSettings({
							...settings,
							xcloud_bitrate: parseInt((e.currentTarget as HTMLInputElement).value) || 0
						})}
				/>
			</Card>
			<Card>
				<label class="block text-white/70 text-sm mb-2">xHome bitrate (0 = auto)</label>
				<input
					type="number"
					class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
					value={settings.xhome_bitrate}
					onchange={(e) =>
						setSettings({
							...settings,
							xhome_bitrate: parseInt((e.currentTarget as HTMLInputElement).value) || 0
						})}
				/>
			</Card>
			<Card>
				<label class="block text-white/70 text-sm mb-2">Preferred game language</label>
				<input
					type="text"
					class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
					value={settings.preferred_game_language}
					onchange={(e) =>
						setSettings({
							...settings,
							preferred_game_language: (e.currentTarget as HTMLInputElement).value
						})}
				/>
			</Card>
			<Card>
				<label class="block text-white/70 text-sm mb-2">Force region IP</label>
				<input
					type="text"
					class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
					placeholder="e.g. 1.2.3.4 (European egress)"
					value={settings.force_region_ip}
					onchange={(e) =>
						setSettings({
							...settings,
							force_region_ip: (e.currentTarget as HTMLInputElement).value
						})}
				/>
				<p class="text-white/40 text-xs mt-2">
					Sent as X-Forwarded-For during Xbox authentication. Log out and sign in again after
					changing this value.
				</p>
			</Card>
		</div>
	</div>
</AppLayout>