<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { fetchAppVersion, getBuildVersion } from '$lib/app-version';
	import { clearAppData, getAuthState, logout } from '$lib/stores/auth.svelte';
	import { getSettings, setSettings } from '$lib/stores/settings.svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import SettingsSidebar from '$lib/components/settings/SettingsSidebar.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	const languages = [
		{ code: 'en-US', label: 'English' },
		{ code: 'de-DE', label: 'Deutsch' },
		{ code: 'ru-RU', label: 'Русский' },
		{ code: 'uk-UA', label: 'Українська' }
	];

	const authState = $derived(getAuthState());
	const settings = $derived(getSettings());
	const gamertag = $derived(
		(authState.webToken?.data.DisplayClaims?.xui?.[0] as { gtg?: string } | undefined)?.gtg
	);
	const gamerscore = $derived(
		(authState.webToken?.data.DisplayClaims?.xui?.[0] as { gsu?: string } | undefined)?.gsu
	);

	let appVersion = $state(getBuildVersion());

	onMount(() => {
		void fetchAppVersion({ force: true }).then((version) => {
			appVersion = version;
		});
	});

	async function handleClearData() {
		if (!confirm(t('auth.clearDataQuestion'))) return;
		await clearAppData();
	}
</script>

<AppLayout title={t('settings.about.title')}>
	<div class="flex gap-8">
		<SettingsSidebar />
		<div class="flex-1 space-y-4">
			<Card>
				<h2 class="text-lg font-semibold text-white mb-2">
					{t('settings.about.profileTitle')}
				</h2>
				<p class="text-white/70">{gamertag}</p>
				{#if gamerscore}
					<p class="text-white/50 text-sm mt-1">
						{t('settings.about.gamerscore')}: {gamerscore}
					</p>
				{/if}
			</Card>
			<Card>
				<h2 class="text-lg font-semibold text-white mb-2">
					{t('settings.about.languageTitle')}
				</h2>
				<select
					class="glass-control px-3 py-2"
					value={settings.language}
					onchange={(e) =>
						setSettings({ ...settings, language: (e.currentTarget as HTMLSelectElement).value })}
				>
					{#each languages as lang (lang.code)}
						<option value={lang.code}>{lang.label}</option>
					{/each}
				</select>
			</Card>
			<Card>
				<p class="text-white/50 text-sm mb-2">
					{t('settings.about.version')}: {appVersion}
				</p>
				<p class="text-white/40 text-sm mb-3">
					<span class="text-white/50">{t('settings.about.website')}: </span>
					<a
						href="https://github.com/isamarin/blacklight"
						target="_blank"
						rel="noreferrer"
						class="hover:text-white/60"
						title={t('settings.about.websiteLinkTitle')}
					>
						github.com/isamarin/blacklight
					</a>
				</p>
				<div class="flex flex-wrap gap-3">
					<Button
						label={t('settings.about.logout')}
						variant="danger"
						size="sm"
						onclick={() => {
							if (confirm(t('settings.about.logoutQuestion'))) logout();
						}}
					/>
					<Button
						label={t('auth.clearDataBtn')}
						variant="ghost"
						size="sm"
						onclick={handleClearData}
					/>
				</div>
			</Card>
		</div>
	</div>
</AppLayout>