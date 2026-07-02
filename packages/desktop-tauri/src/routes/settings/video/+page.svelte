<script lang="ts">
	import { t } from '$lib/i18n';
	import { getSettings, setSettings } from '$lib/stores/settings.svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import SettingsSidebar from '$lib/components/settings/SettingsSidebar.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	const settings = $derived(getSettings());
</script>

<AppLayout title={t('settings.videoAudio.pageTitle')}>
	<div class="flex gap-8">
		<SettingsSidebar />
		<div class="flex-1 space-y-4">
			<Card>
				<label class="flex items-center gap-3 text-white/80">
					<input
						type="checkbox"
						checked={settings.video_enabled}
						onchange={() => setSettings({ ...settings, video_enabled: !settings.video_enabled })}
						class="accent-xbox"
					/>
					{t('settings.videoAudio.enableVideoLabel')}
				</label>
			</Card>
			<Card>
				<label class="flex items-center gap-3 text-white/80">
					<input
						type="checkbox"
						checked={settings.audio_enabled}
						onchange={() => setSettings({ ...settings, audio_enabled: !settings.audio_enabled })}
						class="accent-xbox"
					/>
					{t('settings.videoAudio.enableAudioLabel')}
				</label>
			</Card>
			<Card>
				<label class="flex items-center gap-3 text-white/80">
					<input
						type="checkbox"
						checked={settings.app_lowresolution}
						onchange={() =>
							setSettings({ ...settings, app_lowresolution: !settings.app_lowresolution })}
						class="accent-xbox"
					/>
					{t('settings.videoAudio.forceLowResLabel')}
				</label>
				<p class="text-white/40 text-xs mt-2">{t('settings.videoAudio.forceLowResDescription')}</p>
			</Card>
		</div>
	</div>
</AppLayout>