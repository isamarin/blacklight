<script lang="ts">
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
	import FriendsList from '$lib/components/sidebar/FriendsList.svelte';

	let { title, children }: { title?: string; children: import('svelte').Snippet } = $props();
</script>

<svelte:head>
	<title>{title ? `Blacklight - ${title}` : 'Blacklight'}</title>
</svelte:head>

<div class="flex h-screen overflow-hidden bg-surface bg-pattern">
	<Sidebar />
	<main class="relative flex flex-1 overflow-hidden">
		<div class="flex-1 overflow-y-auto">
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
		<FriendsList />
	</main>
</div>