<script lang="ts">
	import { t } from '$lib/i18n';
	import { getAuthState, logout } from '$lib/stores/auth.svelte';
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
</script>

<AppLayout title={t('page.settings.about.pageTitle', { defaultValue: 'Settings' })}>
	<div class="flex gap-8">
		<SettingsSidebar />
		<div class="flex-1 space-y-4">
			<Card>
				<h2 class="text-lg font-semibold text-white mb-2">
					{t('page.settings.about.profileTitle', { defaultValue: 'Profile' })}
				</h2>
				<p class="text-white/70">{gamertag}</p>
			</Card>
			<Card>
				<h2 class="text-lg font-semibold text-white mb-2">
					{t('page.settings.about.languageTitle', { defaultValue: 'Language' })}
				</h2>
				<select
					class="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
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
				<p class="text-white/40 text-sm mb-3">
					<a
						href="https://github.com/isamarin/blacklight"
						target="_blank"
						rel="noreferrer"
						class="hover:text-white/60"
					>
						github.com/isamarin/blacklight
					</a>
				</p>
				<Button label="Logout" onclick={logout} class="bg-red-900 hover:bg-red-800" />
			</Card>
		</div>
	</div>
</AppLayout>