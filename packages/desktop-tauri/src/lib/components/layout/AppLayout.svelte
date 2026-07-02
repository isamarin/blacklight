<script lang="ts">
	import { page } from '$app/state';
	import { cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
	import FriendsList from '$lib/components/sidebar/FriendsList.svelte';

	let { title, children }: { title?: string; children: import('svelte').Snippet } = $props();

	const pageKey = $derived(page.url.pathname);
</script>

<svelte:head>
	<title>{title ? `Blacklight - ${title}` : 'Blacklight'}</title>
</svelte:head>

<div class="flex h-screen flex-col overflow-hidden bg-surface bg-pattern">
	<Sidebar />
	<div class="flex min-h-0 flex-1 overflow-hidden">
		<FriendsList />
		<main class="relative min-w-0 flex-1 overflow-hidden">
			{#key pageKey}
				<div
					class="page-stage h-full overflow-y-auto"
					in:fly={{ y: 18, duration: 420, easing: cubicOut, opacity: 0 }}
					out:fade={{ duration: 200 }}
				>
					<div
						class="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-xbox/10 blur-3xl"
					></div>
					<div
						class="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-xbox/5 blur-3xl"
					></div>
					<div class="relative mx-auto max-w-6xl p-6 md:p-8">
						{@render children()}
					</div>
				</div>
			{/key}
		</main>
	</div>
</div>