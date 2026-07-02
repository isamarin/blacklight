<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { getSettings, setSettings } from '$lib/stores/settings.svelte';
	import { syncSidecarSettings } from '$lib/init/desktop';
	import {
		getWebuiApi,
		isDesktopShell,
		isTauriApp,
		isWebUIMode,
		openExternal
	} from '$lib/runtime';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import SettingsSidebar from '$lib/components/settings/SettingsSidebar.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	const settings = $derived(getSettings());
	const inWebUI = $derived(isWebUIMode());
	const webuiApi = getWebuiApi();

	let running = $state(false);

	onMount(() => {
		if (!webuiApi) return;
		const refresh = () => webuiApi.getStatus().then((r) => (running = r));
		refresh();
		const interval = setInterval(refresh, 1000);
		return () => clearInterval(interval);
	});

	async function syncToMain(next: ReturnType<typeof getSettings>) {
		const patch = {
			webui_autostart: next.webui_autostart,
			webui_port: Number(next.webui_port) || 9003
		};
		if (isTauriApp()) {
			await syncSidecarSettings(patch);
			return;
		}
		await webuiApi?.saveSettings(patch);
	}

	async function toggleServer() {
		if (!webuiApi) return;
		if (running) {
			await webuiApi.stop();
		} else {
			await webuiApi.start(Number(settings.webui_port) || 9003);
		}
		running = await webuiApi.getStatus();
	}

	function openInBrowser() {
		const port = Number(settings.webui_port) || 9003;
		void openExternal(`http://127.0.0.1:${port}/home`);
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
						<span>{t('settings.webUI.enableWebUILabel')}</span>
						<div class="flex gap-2">
							<Button
								label={running
									? t('settings.webUI.stopWebUIBtn')
									: t('settings.webUI.startWebUIBtn')}
								onclick={toggleServer}
								disabled={inWebUI}
								class={running ? 'bg-red-800 hover:bg-red-700' : ''}
							/>
							<Button label={t('settings.webUI.openWebUIBtn')} onclick={openInBrowser} />
						</div>
					</div>

					{#if inWebUI}
						<p class="text-orange-300 text-sm">
							You are viewing Blacklight through WebUI. Server controls are disabled in this mode.
						</p>
					{/if}

					{#if isDesktopShell() && !isWebUIMode()}
						<p class="text-white/50 text-sm">
							Tauri shell uses the local API server on 127.0.0.1. Start it before opening streams if
							autostart is disabled.
						</p>
					{/if}

					<label class="flex items-center gap-3 cursor-pointer">
						<input
							type="checkbox"
							checked={settings.webui_autostart}
							disabled={inWebUI}
							onchange={(e) => {
								const next = {
									...settings,
									webui_autostart: (e.currentTarget as HTMLInputElement).checked
								};
								setSettings(next);
								syncToMain(next);
							}}
							class="accent-[#107C10]"
						/>
						<span>
							{t('settings.webUI.autostartLabel')} ({settings.webui_autostart
								? t('settings.webUI.autostartEnabled')
								: t('settings.webUI.autostartDisabled')})
						</span>
					</label>

					<div>
						<label class="block text-sm text-white/60 mb-1">{t('settings.webUI.portLabel')}</label>
						<input
							type="number"
							min="1024"
							max="65535"
							disabled={inWebUI}
							class="w-32 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
							placeholder={t('settings.webUI.portPlaceholder')}
							value={settings.webui_port}
							onchange={(e) => {
								const next = {
									...settings,
									webui_port: parseInt((e.currentTarget as HTMLInputElement).value) || 9003
								};
								setSettings(next);
								syncToMain(next);
							}}
						/>
					</div>

					<p class="text-white/40 text-sm">
						WebUI is available only on this machine at 127.0.0.1 (localhost). Authentication and
						streaming use HTTP tRPC in the browser.
					</p>
				</div>
			</Card>
		</div>
	</div>
</AppLayout>