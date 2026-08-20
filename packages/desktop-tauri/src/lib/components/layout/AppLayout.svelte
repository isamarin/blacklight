<script lang="ts">
	import { page } from '$app/state';
	import { cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
	import FriendsList from '$lib/components/sidebar/FriendsList.svelte';
	import AmbientGlow from '$lib/components/layout/AmbientGlow.svelte';

	let { title, children }: { title?: string; children: import('svelte').Snippet } = $props();

	const pageKey = $derived(page.url.pathname);
</script>

<svelte:head>
	<title>{title ? `Blacklight - ${title}` : 'Blacklight'}</title>
</svelte:head>

<div class="relative flex h-screen flex-col overflow-hidden bg-surface bg-pattern">
	<AmbientGlow />
	<Sidebar />
	<div class="relative z-[1] flex min-h-0 flex-1 overflow-hidden">
		<FriendsList />
		<main class="relative min-w-0 flex-1 overflow-hidden">
			{#key pageKey}
				<div
					class="page-stage h-full overflow-y-auto"
					in:fly={{ y: 18, duration: 420, easing: cubicOut, opacity: 0 }}
					out:fade={{ duration: 200 }}
				>
					<div class="relative mx-auto max-w-6xl p-6 md:p-8">
						{@render children()}
					</div>
				</div>
			{/key}
		</main>
	</div>
</div>