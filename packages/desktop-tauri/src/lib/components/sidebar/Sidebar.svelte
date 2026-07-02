<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
	import { getAuthState, logout } from '$lib/stores/auth.svelte';

	const nav = [
		{ href: '/home', labelKey: 'page.xCloud.breadcrumb', fallback: 'xCloud' },
		{ href: '/consoles', labelKey: 'page.myConsoles.pageTitle', fallback: 'My Consoles' },
		{ href: '/xcloud/library', labelKey: 'page.xCloudLibrary.breadcrumb2', fallback: 'Library' },
		{ href: '/settings/home', labelKey: 'settings.sidebar.about', fallback: 'Settings' }
	];

	const authState = $derived(getAuthState());
	const gamertag = $derived(
		(authState.webToken?.data.DisplayClaims?.xui?.[0] as { gtg?: string } | undefined)?.gtg ||
			'Gamertag'
	);

	function handleLogout() {
		if (confirm(t('auth.logoutQuestion'))) logout();
	}

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(href);
	}
</script>

<aside
	class="glass-panel relative z-20 flex h-full w-64 flex-col border-r border-white/10 bg-surface/40"
>
	<div class="border-b border-white/5 p-6">
		<h2 class="mb-1 text-2xl font-bold tracking-tight text-white">Blacklight</h2>
		<a
			href="/profile"
			class="transition-soft text-sm text-white/40 hover:text-white"
			title={t('header.viewProfile')}
		>
			{gamertag}
		</a>
		<button onclick={handleLogout} class="transition-soft mt-1 text-sm text-white/50 hover:text-white">
			{t('auth.logoutBtn')}
		</button>
	</div>
	<ul class="space-y-1 px-3 py-4">
		{#each nav as item (item.href)}
			<li>
				<a
					href={item.href}
					class="glass-nav-link {isActive(item.href) ? 'glass-nav-link-active' : ''}"
				>
					{t(item.labelKey, { defaultValue: item.fallback })}
				</a>
			</li>
		{/each}
	</ul>
</aside>