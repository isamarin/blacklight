<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { initI18n } from '$lib/i18n';
	import {
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
		await initDesktopShell();
		await initAuth();
		await initI18n(getSettings().language);
		ready = true;
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
</script>

{#if !ready}
	<AuthLoading />
{:else if showAuthLoading}
	<AuthLoading />
{:else if showAuthHome}
	<AuthHome />
{:else if showApp}
	{@render children()}
{/if}