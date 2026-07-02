<script lang="ts">
	import { tick } from 'svelte';
	import { page } from '$app/state';
	import { t } from '$lib/i18n';

	const links = [
		{ href: '/settings/home', key: 'about' },
		{ href: '/settings/streaming', key: 'streaming' },
		{ href: '/settings/input', key: 'input' },
		{ href: '/settings/video', key: 'videoAudio' },
		{ href: '/settings/webui', key: 'webUI' },
		{ href: '/settings/debug', key: 'debug' }
	];

	let navListEl = $state<HTMLUListElement | null>(null);
	let indicator = $state({ top: 0, height: 0, ready: false });

	function isActive(href: string) {
		return page.url.pathname.startsWith(href);
	}

	async function syncIndicator() {
		await tick();
		if (!navListEl) return;

		const activeIndex = links.findIndex((link) => isActive(link.href));
		const items = navListEl.querySelectorAll<HTMLElement>('[data-settings-nav-item]');
		const activeEl = items[activeIndex];
		if (!activeEl) {
			indicator = { top: 0, height: 0, ready: false };
			return;
		}

		indicator = {
			top: activeEl.offsetTop,
			height: activeEl.offsetHeight,
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

<nav class="tv-settings-nav glass-panel shrink-0 rounded-2xl border border-white/10 p-2" aria-label="Settings">
	<ul bind:this={navListEl} class="tv-settings-list">
		{#if indicator.ready}
			<span
				class="tv-nav-indicator"
				style:transform="translateY({indicator.top}px)"
				style:height="{indicator.height}px"
				aria-hidden="true"
			></span>
		{/if}

		{#each links as link (link.href)}
			<li data-settings-nav-item>
				<a
					href={link.href}
					class="tv-settings-link"
					class:tv-settings-link-active={isActive(link.href)}
					aria-current={isActive(link.href) ? 'page' : undefined}
				>
					{t(`settings.sidebar.${link.key}`, { defaultValue: link.key })}
				</a>
			</li>
		{/each}
	</ul>
</nav>