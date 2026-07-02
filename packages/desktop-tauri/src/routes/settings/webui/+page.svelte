<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { getSettings, setSettings } from '$lib/stores/settings.svelte';
	import { syncApiSettings } from '$lib/init/desktop';
	import { getApiHealth, getApiOrigin, isDesktopShell, isTauriApp } from '$lib/runtime';
	import { restartApi, startApi, stopApi } from '$lib/tauri';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import SettingsSidebar from '$lib/components/settings/SettingsSidebar.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	const settings = $derived(getSettings());
	const inTauri = $derived(isTauriApp());

	let apiOnline = $state(false);

	onMount(() => {
		const refresh = () => getApiHealth().then((ok) => (apiOnline = ok));
		refresh();
		const interval = setInterval(refresh, 2000);
		return () => clearInterval(interval);
	});

	async function applyAutostartChange(enabled: boolean) {
		const next = { ...settings, webui_autostart: enabled };
		setSettings(next);
		if (inTauri) {
			await syncApiSettings({ webui_autostart: enabled });
		}
	}

	async function applyPortChange(port: number) {
		const next = { ...settings, webui_port: port };
		setSettings(next);
		if (inTauri) {
			await syncApiSettings({ webui_port: port });
		}
	}

	async function toggleApi() {
		if (!inTauri) return;
		if (apiOnline) {
			await stopApi();
		} else {
			await startApi();
		}
		apiOnline = await getApiHealth();
	}

	async function handleRestartApi() {
		if (!inTauri) return;
		await restartApi();
		apiOnline = await getApiHealth();
	}
</script>

<AppLayout title={t('settings.webUI.pageTitle')}>
	<div class="flex gap-8">
		<SettingsSidebar />
		<div class="flex-1">
			<Card>
				<h1 class="text-xl font-bold text-white mb-4">{t('settings.webUI.title')}</h1>
				<div class="space-y-4 text-white/80">
					<div class="flex items-center justify-between gap-4">
						<span>Local API (tRPC)</span>
						<span class="text-sm {apiOnline ? 'text-green-400' : 'text-red-400'}">
							{apiOnline ? 'Online' : 'Offline'} — {getApiOrigin()}/trpc
						</span>
					</div>

					{#if isDesktopShell()}
						<div class="flex flex-wrap gap-2">
							<Button
								label={apiOnline ? t('settings.webUI.stopWebUIBtn') : t('settings.webUI.startWebUIBtn')}
								variant={apiOnline ? 'danger' : 'primary'}
								size="sm"
								onclick={toggleApi}
							/>
							<Button label="Restart API" variant="secondary" size="sm" onclick={handleRestartApi} />
						</div>
						<p class="text-white/50 text-sm">
							The desktop app spawns a minimal Node API process for Xbox authentication and
							streaming. The Svelte UI runs inside Tauri; no separate browser WebUI server is
							required.
						</p>
					{/if}

					<label class="flex items-center gap-3 cursor-pointer">
						<input
							type="checkbox"
							checked={settings.webui_autostart}
							disabled={!inTauri}
							onchange={(e) => {
								void applyAutostartChange((e.currentTarget as HTMLInputElement).checked);
							}}
							class="accent-xbox"
						/>
						<span>
							{t('settings.webUI.autostartLabel')} (
							{settings.webui_autostart
								? t('settings.webUI.autostartEnabled')
								: t('settings.webUI.autostartDisabled')}
							)
						</span>
					</label>

					<div>
						<span class="block text-sm text-white/60 mb-1">{t('settings.webUI.portLabel')}</span>
						<input
							type="number"
							min="1024"
							max="65535"
							class="glass-control w-32 px-3 py-2"
							placeholder={t('settings.webUI.portPlaceholder')}
							value={settings.webui_port}
							onchange={(e) => {
								const port = parseInt((e.currentTarget as HTMLInputElement).value) || 9003;
								void applyPortChange(port);
							}}
						/>
						{#if inTauri}
							<p class="text-white/40 text-xs mt-2">
								Changing the port restarts the API process automatically.
							</p>
						{/if}
					</div>
				</div>
			</Card>
		</div>
	</div>
</AppLayout>