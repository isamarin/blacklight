<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
	import { getAuthState, logout } from '$lib/stores/auth.svelte';

	const nav = [
		{ href: '/home', labelKey: 'page.xCloud.breadcrumb', fallback: 'xCloud' },
		{ href: '/consoles', labelKey: 'page.myConsoles.pageTitle', fallback: 'My Consoles' },
		{ href: '/xcloud/library', labelKey: 'page.xCloudLibrary.breadcrumb2', fallback: 'Library' },
		{ href: '/settings/home', labelKey: 'page.settings.sidebar.about', fallback: 'Settings' }
	];

	const authState = $derived(getAuthState());
	const gamertag = $derived(
		(authState.webToken?.data.DisplayClaims?.xui?.[0] as { gtg?: string } | undefined)?.gtg ||
			'Gamertag'
	);

	function handleLogout() {
		if (confirm('Are you sure you want to logout?')) logout();
	}

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(href);
	}
</script>

<aside class="w-64 h-full flex flex-col bg-[#0d0d0d] border-r border-white/5 relative z-20">
	<div class="p-6">
		<h2 class="text-2xl font-bold text-white mb-1">Blacklight</h2>
		<p class="text-white/40 text-sm">{gamertag}</p>
		<button onclick={handleLogout} class="text-white/50 text-sm hover:text-white mt-1">
			Logout
		</button>
	</div>
	<ul class="px-4 space-y-1">
		{#each nav as item (item.href)}
			<li>
				<a
					href={item.href}
					class="flex items-center px-3 py-2 rounded-lg text-sm {isActive(item.href)
						? 'bg-[#107C10]/20 text-[#107C10]'
						: 'text-white/60 hover:text-white hover:bg-white/5'}"
				>
					{t(item.labelKey, { defaultValue: item.fallback })}
				</a>
			</li>
		{/each}
	</ul>
</aside>