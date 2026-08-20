<script lang="ts">
	import { tick } from 'svelte';
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
	import { getAuthState } from '$lib/stores/auth.svelte';
	import NavIcon from '$lib/components/sidebar/NavIcon.svelte';

	type NavItem = {
		href: string;
		labelKey: string;
		fallback: string;
		icon: 'home' | 'consoles' | 'library' | 'settings' | 'profile';
	};

	// Design order: Home → Consoles → Library → Profile → Settings
	const nav: NavItem[] = [
		{ href: '/home', labelKey: 'header.home', fallback: 'Home', icon: 'home' },
		{
			href: '/consoles',
			labelKey: 'page.myConsoles.pageTitle',
			fallback: 'My Consoles',
			icon: 'consoles'
		},
		{
			href: '/xcloud/library',
			labelKey: 'page.xCloudLibrary.breadcrumb2',
			fallback: 'Library',
			icon: 'library'
		},
		{
			href: '/profile',
			labelKey: 'page.profile.pageTitle',
			fallback: 'Profile',
			icon: 'profile'
		},
		{
			href: '/settings/home',
			labelKey: 'header.settings',
			fallback: 'Settings',
			icon: 'settings'
		}
	];

	const authState = $derived(getAuthState());
	const tokenProfile = $derived(
		authState.webToken?.data.DisplayClaims?.xui?.[0] as
			| { gtg?: string; gsu?: string }
			| undefined
	);
	const gamertag = $derived(tokenProfile?.gtg || 'Gamertag');
	const gamerscore = $derived(tokenProfile?.gsu || null);

	let navListEl = $state<HTMLUListElement | null>(null);
	let indicator = $state({ left: 0, width: 0, ready: false });

	function isActive(href: string) {
		const path = page.url.pathname;
		if (href === '/home') return path === '/home' || path === '/';
		if (href === '/settings/home') return path.startsWith('/settings');
		if (href === '/profile') return path === '/profile';
		return path === href || path.startsWith(`${href}/`);
	}

	async function syncIndicator() {
		await tick();
		if (!navListEl) return;

		const activeIndex = nav.findIndex((item) => isActive(item.href));
		const items = navListEl.querySelectorAll<HTMLElement>('[data-nav-item]');
		const activeEl = items[activeIndex];
		if (!activeEl) {
			indicator = { left: 0, width: 0, ready: false };
			return;
		}

		indicator = {
			left: activeEl.offsetLeft,
			width: activeEl.offsetWidth,
			ready: true
		};
	}

	$effect(() => {
		page.url.pathname;
		void syncIndicator();
	});

	$effect(() => {
		const el = navListEl;
		if (!el) return;

		void syncIndicator();
		const observer = new ResizeObserver(() => {
			void syncIndicator();
		});
		observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<header class="tv-topbar">
	<div class="tv-topbar-brand">
		<div class="tv-topbar-logo" aria-hidden="true">bl</div>
		<div class="min-w-0 hidden sm:block">
			<h2 class="truncate text-sm font-semibold tracking-[0.06em] text-white">BLACKLIGHT</h2>
		</div>
	</div>

	<nav class="tv-topbar-nav" aria-label="Main">
		<ul bind:this={navListEl} class="tv-topbar-list">
			{#if indicator.ready}
				<span
					class="tv-nav-indicator tv-nav-indicator-horizontal"
					style:transform="translateX({indicator.left}px)"
					style:width="{indicator.width}px"
					aria-hidden="true"
				></span>
			{/if}

			{#each nav as item (item.href)}
				<li data-nav-item>
					<a
						href={item.href}
						class="tv-nav-link tv-nav-link-horizontal"
						class:tv-nav-link-active={isActive(item.href)}
						aria-current={isActive(item.href) ? 'page' : undefined}
					>
						<span class="tv-nav-icon">
							<NavIcon name={item.icon} />
						</span>
						<span class="tv-nav-label">
							{t(item.labelKey, { defaultValue: item.fallback })}
						</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="tv-topbar-actions">
		<a href="/profile" class="tv-topbar-profile" title={gamertag}>
			<span class="tv-topbar-avatar" aria-hidden="true">{gamertag.slice(0, 1).toUpperCase()}</span>
			<span class="hidden min-w-0 flex-col md:flex">
				<span class="max-w-32 truncate text-sm text-white/90">{gamertag}</span>
				{#if gamerscore}
					<span class="max-w-32 truncate text-[11px] text-white/45">{gamerscore} G</span>
				{/if}
			</span>
		</a>
	</div>
</header>