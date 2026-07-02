<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n';

	const links = [
		{ href: '/settings/home', key: 'about' },
		{ href: '/settings/streaming', key: 'streaming' },
		{ href: '/settings/input', key: 'input' },
		{ href: '/settings/video', key: 'video' },
		{ href: '/settings/webui', key: 'webUI' },
		{ href: '/settings/debug', key: 'debug' }
	];

	function isActive(href: string) {
		return page.url.pathname.startsWith(href);
	}
</script>

<nav class="w-48 shrink-0 space-y-1">
	{#each links as link (link.href)}
		<a
			href={link.href}
			class="block px-3 py-2 rounded-lg text-sm {isActive(link.href)
				? 'bg-[#107C10]/20 text-[#107C10]'
				: 'text-white/60 hover:text-white hover:bg-white/5'}"
		>
			{t(`page.settings.sidebar.${link.key}`, { defaultValue: link.key })}
		</a>
	{/each}
</nav>