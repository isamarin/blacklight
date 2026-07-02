<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { errorI18nKey } from '$lib/errors';
	import { initI18n, t } from '$lib/i18n';
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

	onMount(async () => {
		document.getElementById('boot-fallback')?.remove();
		try {
			await initDesktopShell();
			await initAuth();
			await initI18n(getSettings().language);
		} catch (error) {
			console.error('Failed to initialize Blacklight shell', error);
		} finally {
			ready = true;
		}
	});

	$effect(() => {
		initI18n(getSettings().language);
	});

	$effect(() => {
		if (getIsAuthenticated()) {
			refreshTitleCatalog();
		}
	});

	const showApp = $derived(ready && getIsAuthenticated());
	const showAuthLoading = $derived(ready && !getIsAuthenticated() && getIsAuthenticating());
	const showAuthHome = $derived(ready && !getIsAuthenticated() && !getIsAuthenticating());
	const storedAuthError = $derived(getAuthError());
</script>

{#if !ready}
	<AuthLoading />
{:else if showAuthLoading}
	<AuthLoading />
	{#if storedAuthError}
		<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4">
			<div class="glass rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
				<p class="text-red-400 text-sm">{t(errorI18nKey(storedAuthError))}</p>
			</div>
		</div>
	{/if}
{:else if showAuthHome}
	<AuthHome />
{:else if showApp}
	{@render children()}
{/if}