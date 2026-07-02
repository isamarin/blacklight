<script lang="ts">
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

	function isActive(href: string) {
		return page.url.pathname.startsWith(href);
	}
</script>

<nav class="glass-panel w-52 shrink-0 space-y-1 rounded-2xl border border-white/10 p-2">
	{#each links as link (link.href)}
		<a
			href={link.href}
			class="glass-nav-link block {isActive(link.href) ? 'glass-nav-link-active' : ''}"
		>
			{t(`settings.sidebar.${link.key}`, { defaultValue: link.key })}
		</a>
	{/each}
</nav>