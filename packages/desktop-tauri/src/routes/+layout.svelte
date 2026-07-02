<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { errorI18nKey } from '$lib/errors';
	import { initI18n, isI18nReady, t } from '$lib/i18n';
	import {
		getAuthError,
		getIsAuthenticated,
		getIsAuthenticating,
		initAuth
	} from '$lib/stores/auth.svelte';
	import { getSettings } from '$lib/stores/settings.svelte';
	import { refreshTitleCatalog } from '$lib/stores/titleCatalog.svelte';
	import { initDesktopShell } from '$lib/init/desktop';
	import AuthHome from '$lib/components/auth/AuthHome.svelte';
	import AuthLoading from '$lib/components/auth/AuthLoading.svelte';

	let { children } = $props();
	let ready = $state(false);
	let bootError = $state<string | null>(null);
	let syncedLanguage = $state<string | null>(null);
	let catalogRequested = $state(false);

	onMount(async () => {
		document.documentElement.classList.toggle(
			'tauri-shell',
			'__TAURI_INTERNALS__' in window
		);

		try {
			await initDesktopShell();
			await initAuth();
			const language = getSettings().language;
			syncedLanguage = language;
			await initI18n(language);
		} catch (error) {
			console.error('Failed to initialize Blacklight shell', error);
			bootError = error instanceof Error ? error.message : String(error);
		} finally {
			document.getElementById('boot-fallback')?.remove();
			ready = true;
		}
	});

	$effect(() => {
		if (!ready) return;

		const language = getSettings().language;
		if (language === syncedLanguage) return;

		syncedLanguage = language;
		void initI18n(language);
	});

	$effect(() => {
		if (!ready || !getIsAuthenticated()) {
			catalogRequested = false;
			return;
		}

		if (catalogRequested) return;
		catalogRequested = true;
		void refreshTitleCatalog();
	});

	const showApp = $derived(ready && getIsAuthenticated());
	const showAuthLoading = $derived(ready && !getIsAuthenticated() && getIsAuthenticating());
	const showAuthHome = $derived(ready && !getIsAuthenticated() && !getIsAuthenticating());
	const storedAuthError = $derived(getAuthError());
</script>

{#if bootError}
	<div class="flex h-full min-h-screen items-center justify-center bg-[#0d0d0d] p-8 text-red-400">
		<div class="max-w-lg text-center">
			<h1 class="mb-3 text-xl font-semibold text-white">Blacklight failed to start</h1>
			<p class="text-sm">{bootError}</p>
		</div>
	</div>
{:else if !ready || showAuthLoading}
	<AuthLoading />
	{#if storedAuthError}
		<div class="fixed bottom-6 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4">
			<div class="glass rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
				<p class="text-sm text-red-400">{t(errorI18nKey(storedAuthError))}</p>
			</div>
		</div>
	{/if}
{:else if showAuthHome && isI18nReady()}
	<AuthHome />
{:else if showApp}
	{@render children()}
{/if}